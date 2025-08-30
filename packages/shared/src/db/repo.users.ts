// Users repository with reads and writes used by users module

import type { PrismaClient, Prisma } from '@prisma/client';
import { BaseRepository } from './repo.base.js';
import type { BaseRepositoryOptions, PaginationOptions, PaginationResult } from './repo.base.js';
import type { FilterBuilderOptions, SortBuilderOptions } from './repo.util.js';
import { FilterBuilder, SortBuilder, QueryBuilder, PaginationBuilder } from './repo.util.js';
import { withTx, createTxOptions } from './withTx.js';
import { CacheWrapper, CacheKeyBuilder } from '../cache/index.js';

export interface UserCreateData {
  email: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  timezone?: string;
  locale?: string;
}

export interface UserUpdateData {
  displayName?: string;
  isActive?: boolean;
}

export interface UserWithRoles {
  id: string;
  email: string;
  displayName: string | null;
  status: string;
  mfaEnabled: boolean;
  createdAt: Date;
  userRoles: Array<{
    role: {
      id: string;
      name: string;
      description: string | null;
      isSystem: boolean;
      isActive: boolean;
    };
  }>;
}

export interface UserListFilters extends FilterBuilderOptions {
  q?: string;
  isActive?: boolean;
  roleId?: string;
  createdFrom?: Date;
  createdTo?: Date;
}

export interface UserListOptions {
  pagination: PaginationOptions;
  filters: UserListFilters;
  sort: SortBuilderOptions;
}

export class UsersRepository extends BaseRepository {
  constructor(
    prisma: PrismaClient,
    options: BaseRepositoryOptions,
    private readonly cache?: CacheWrapper
  ) {
    super(prisma, options);
  }

  /**
   * List users with pagination, filtering, and sorting
   */
  async listUsers(options: UserListOptions): Promise<PaginationResult<UserWithRoles>> {
    try {
      // Validate pagination
      PaginationBuilder.validate(options.pagination);

      // Build filters, sort, and pagination
      const filters = FilterBuilder.buildUserFilters(options.filters);
      const sort = SortBuilder.buildUserSort(options.sort);
      const { skip, take, pagination } = PaginationBuilder.build({
        page: options.pagination.page,
        pageSize: options.pagination.pageSize
      });

      // Build query
      const query = QueryBuilder.buildUserQuery(filters, sort, { skip, take });
      const countQuery = QueryBuilder.buildUserCountQuery(filters);

      // Execute queries with userRoles included
      const baseQuery = this.scopeToOrganization(query) as any;
      
      // Remove select if it exists and use include instead
      const { select, ...queryWithoutSelect } = baseQuery;
      
      const [users, total] = await Promise.all([
        this.prisma.user.findMany({
          ...queryWithoutSelect,
          include: {
            userRoles: {
              include: {
                role: true
              }
            }
          }
        }),
        this.prisma.user.count(this.scopeToOrganization(countQuery) as any)
      ]);

      // Transform user roles
      const usersWithRoles: UserWithRoles[] = users.map((user: any) => ({
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        status: user.status,
        mfaEnabled: user.mfaEnabled,
        createdAt: user.createdAt,
        userRoles: user.userRoles?.map((ur: any) => ({
          role: ur.role
        })) || []
      }));

      return this.buildPaginationResult(usersWithRoles, total, pagination);
    } catch (error) {
      this.handlePrismaError(error, 'listUsers');
    }
  }

  /**
   * Get user by ID with roles and caching
   * TTL: 15s with jitter for hot reads
   */
  async getUserById(userId: string): Promise<UserWithRoles | null> {
    if (!this.cache) {
      return this.fetchUserFromDb(userId);
    }

    const cacheKey = CacheKeyBuilder.buildUserKey(this.options.organizationId, userId);
    
    return this.cache.getOrSet(
      cacheKey,
      () => this.fetchUserFromDb(userId),
      15 // 15 seconds TTL for hot reads
    );
  }

  /**
   * Create new user
   */
  async createUser(data: UserCreateData): Promise<UserWithRoles> {
    try {
      const result = await withTx(this.prisma, createTxOptions(), async (tx) => {
        // Check if user already exists
        const existingUser = await tx.user.findFirst({
          where: {
            email: data.email.toLowerCase(),
            organizationId: this.options.organizationId,
            deletedAt: null
          }
        });

        if (existingUser) {
          throw new Error('User with this email already exists');
        }

        // Create user with temporary password
        const user = await tx.user.create({
          data: {
            email: data.email.toLowerCase(),
            firstName: data.firstName,
            lastName: data.lastName,
            displayName: data.displayName || null,
            timezone: data.timezone || 'UTC',
            locale: data.locale || 'en-US',
            organizationId: this.options.organizationId,
            status: 'active',
            passwordHash: this.generateTemporaryPassword()
          },
          select: {
            id: true,
            email: true,
            displayName: true,
            status: true,
            mfaEnabled: true,
            createdAt: true,
            userRoles: {
              where: { isActive: true },
              select: {
                role: {
                  select: {
                    id: true,
                    name: true,
                    description: true,
                    isSystem: true,
                    isActive: true
                  }
                }
              }
            }
          }
        });

        // Create audit log
        await tx.auditLog.create({
          data: {
            organizationId: this.options.organizationId,
            userId: this.options.userId || 'system',
            action: 'users.create',
            entityType: 'User',
            entityId: user.id,
            newValues: {
              email: user.email,
              displayName: user.displayName,
              status: user.status
            },
            metadata: {
              actorUserId: this.options.userId,
              organizationId: this.options.organizationId,
              createdBy: this.options.userId || 'system'
            }
          }
        });

        return user;
      });

      // Bust cache for user lists
      if (this.cache) {
        await this.cache.bust({
          organizationId: this.options.organizationId,
          resource: 'users'
        });
      }

      return result;
    } catch (error) {
      this.handlePrismaError(error, 'createUser');
    }
  }

  /**
   * Update user
   */
  async updateUser(userId: string, data: UserUpdateData): Promise<UserWithRoles> {
    try {
      const result = await withTx(this.prisma, createTxOptions(), async (tx) => {
        // Get current user for audit
        const currentUser = await tx.user.findFirst({
          where: {
            id: userId,
            organizationId: this.options.organizationId,
            deletedAt: null
          },
          select: {
            id: true,
            email: true,
            displayName: true,
            status: true,
            mfaEnabled: true,
            createdAt: true,
            userRoles: {
              where: { isActive: true },
              select: {
                role: {
                  select: {
                    id: true,
                    name: true,
                    description: true,
                    isSystem: true,
                    isActive: true
                  }
                }
              }
            }
          }
        });

        if (!currentUser) {
          throw new Error('User not found');
        }

        // Prepare update data
        const updateData: Prisma.UserUpdateInput = {};
        if (data.displayName !== undefined) {
          updateData.displayName = data.displayName;
        }
        if (data.isActive !== undefined) {
          updateData.status = data.isActive ? 'active' : 'inactive';
        }

        // Update user
        const updatedUser = await tx.user.update({
          where: {
            id: userId,
            organizationId: this.options.organizationId
          },
          data: updateData,
          select: {
            id: true,
            email: true,
            displayName: true,
            status: true,
            mfaEnabled: true,
            createdAt: true,
            userRoles: {
              where: { isActive: true },
              select: {
                role: {
                  select: {
                    id: true,
                    name: true,
                    description: true,
                    isSystem: true,
                    isActive: true
                  }
                }
              }
            }
          }
        });

        // Create audit log
        await tx.auditLog.create({
          data: {
            organizationId: this.options.organizationId,
            userId: this.options.userId || 'system',
            action: 'users.update',
            entityType: 'User',
            entityId: userId,
            oldValues: {
              displayName: currentUser.displayName,
              status: currentUser.status
            },
            newValues: {
              displayName: updatedUser.displayName,
              status: updatedUser.status
            },
            metadata: {
              actorUserId: this.options.userId,
              organizationId: this.options.organizationId,
              updatedBy: this.options.userId || 'system'
            }
          }
        });

        return updatedUser;
      });

      // Bust cache for this user and user lists
      if (this.cache) {
        await Promise.all([
          this.cache.bust({
            organizationId: this.options.organizationId,
            resource: 'user',
            identifier: userId
          }),
          this.cache.bust({
            organizationId: this.options.organizationId,
            resource: 'users'
          })
        ]);
      }

      return result;
    } catch (error) {
      this.handlePrismaError(error, 'updateUser');
    }
  }

  /**
   * Assign role to user
   */
  async assignRole(userId: string, roleId: string, assignedBy: string): Promise<{ success: boolean; wasNewAssignment: boolean }> {
    try {
      const result = await withTx(this.prisma, createTxOptions(), async (tx) => {
        // Check if user exists
        const user = await tx.user.findFirst({
          where: {
            id: userId,
            organizationId: this.options.organizationId,
            deletedAt: null
          }
        });

        if (!user) {
          throw new Error('User not found');
        }

        // Check if role exists
        const role = await tx.role.findFirst({
          where: {
            id: roleId,
            organizationId: this.options.organizationId,
            isActive: true
          }
        });

        if (!role) {
          throw new Error('Role not found');
        }

        // Check if role is already assigned
        const existingUserRole = await tx.userRole.findFirst({
          where: {
            userId,
            roleId,
            organizationId: this.options.organizationId,
            isActive: true
          }
        });

        const wasNewAssignment = !existingUserRole;

        // Create or update user role (idempotent)
        await tx.userRole.upsert({
          where: {
            userId_roleId_organizationId: {
              userId,
              roleId,
              organizationId: this.options.organizationId
            }
          },
          update: {
            isActive: true,
            assignedBy,
            assignedAt: new Date()
          },
          create: {
            userId,
            roleId,
            organizationId: this.options.organizationId,
            assignedBy,
            assignedAt: new Date()
          }
        });

        // Create audit log
        await tx.auditLog.create({
          data: {
            organizationId: this.options.organizationId,
            userId: assignedBy,
            action: 'users.role_added',
            entityType: 'User',
            entityId: userId,
            newValues: { roleId },
            metadata: {
              actorUserId: assignedBy,
              organizationId: this.options.organizationId,
              roleName: role.name,
              wasNewAssignment
            }
          }
        });

        return { success: true, wasNewAssignment };
      });

      // Bust cache for this user and user lists
      if (this.cache) {
        await Promise.all([
          this.cache.bust({
            organizationId: this.options.organizationId,
            resource: 'user',
            identifier: userId
          }),
          this.cache.bust({
            organizationId: this.options.organizationId,
            resource: 'users'
          })
        ]);
      }

      return result;
    } catch (error) {
      this.handlePrismaError(error, 'assignRole');
    }
  }

  /**
   * Remove role from user
   */
  async removeRole(userId: string, roleId: string): Promise<{ success: boolean; wasRemoved: boolean }> {
    try {
      const result = await withTx(this.prisma, createTxOptions(), async (tx) => {
        // Check if user exists
        const user = await tx.user.findFirst({
          where: {
            id: userId,
            organizationId: this.options.organizationId,
            deletedAt: null
          }
        });

        if (!user) {
          throw new Error('User not found');
        }

        // Check if role exists
        const role = await tx.role.findFirst({
          where: {
            id: roleId,
            organizationId: this.options.organizationId,
            isActive: true
          }
        });

        if (!role) {
          throw new Error('Role not found');
        }

        // Check if role is currently assigned
        const existingUserRole = await tx.userRole.findFirst({
          where: {
            userId,
            roleId,
            organizationId: this.options.organizationId,
            isActive: true
          }
        });

        if (!existingUserRole) {
          return { success: true, wasRemoved: false };
        }

        // Remove role
        await tx.userRole.updateMany({
          where: {
            userId,
            roleId,
            organizationId: this.options.organizationId,
            isActive: true
          },
          data: {
            isActive: false
          }
        });

        // Create audit log
        await tx.auditLog.create({
          data: {
            organizationId: this.options.organizationId,
            userId: this.options.userId || 'system',
            action: 'users.role_removed',
            entityType: 'User',
            entityId: userId,
            oldValues: { roleId },
            metadata: {
              actorUserId: this.options.userId,
              organizationId: this.options.organizationId,
              roleName: role.name,
              wasRemoved: true
            }
          }
        });

        return { success: true, wasRemoved: true };
      });

      // Bust cache for this user and user lists
      if (this.cache) {
        await Promise.all([
          this.cache.bust({
            organizationId: this.options.organizationId,
            resource: 'user',
            identifier: userId
          }),
          this.cache.bust({
            organizationId: this.options.organizationId,
            resource: 'users'
          })
        ]);
      }

      return result;
    } catch (error) {
      this.handlePrismaError(error, 'removeRole');
    }
  }

  /**
   * Update user status
   */
  async updateUserStatus(userId: string, isActive: boolean): Promise<UserWithRoles> {
    try {
      const result = await withTx(this.prisma, createTxOptions(), async (tx) => {
        // Get current user for audit
        const currentUser = await tx.user.findFirst({
          where: {
            id: userId,
            organizationId: this.options.organizationId,
            deletedAt: null
          },
          include: {
            userRoles: {
              where: { isActive: true },
              include: {
                role: true
              }
            }
          }
        });

        if (!currentUser) {
          throw new Error('User not found');
        }

        // Prevent deactivating the last admin user
        if (!isActive && currentUser.userRoles.some(ur => ur.role.name === 'admin' && ur.role.isActive)) {
          const adminCount = await tx.userRole.count({
            where: {
              userId: { not: userId },
              role: {
                name: 'admin',
                isActive: true
              },
              user: {
                organizationId: this.options.organizationId,
                status: 'active',
                deletedAt: null
              }
            }
          });

          if (adminCount === 0) {
            throw new Error('Cannot deactivate the last admin user in the organization');
          }
        }

        // Update user status
        const updatedUser = await tx.user.update({
          where: {
            id: userId,
            organizationId: this.options.organizationId
          },
          data: {
            status: isActive ? 'active' : 'inactive'
          },
          select: {
            id: true,
            email: true,
            displayName: true,
            status: true,
            mfaEnabled: true,
            createdAt: true,
            userRoles: {
              where: { isActive: true },
              select: {
                role: {
                  select: {
                    id: true,
                    name: true,
                    description: true,
                    isSystem: true,
                    isActive: true
                  }
                }
              }
            }
          }
        });

        // Create audit log
        await tx.auditLog.create({
          data: {
            organizationId: this.options.organizationId,
            userId: this.options.userId || 'system',
            action: 'users.status_changed',
            entityType: 'User',
            entityId: userId,
            oldValues: {
              status: currentUser.status
            },
            newValues: {
              status: updatedUser.status
            },
            metadata: {
              actorUserId: this.options.userId,
              organizationId: this.options.organizationId,
              previousStatus: currentUser.status,
              newStatus: updatedUser.status
            }
          }
        });

        return updatedUser;
      });

      // Bust cache for this user and user lists
      if (this.cache) {
        await Promise.all([
          this.cache.bust({
            organizationId: this.options.organizationId,
            resource: 'user',
            identifier: userId
          }),
          this.cache.bust({
            organizationId: this.options.organizationId,
            resource: 'users'
          })
        ]);
      }

      return result;
    } catch (error) {
      this.handlePrismaError(error, 'updateUserStatus');
    }
  }

  /**
   * Fetch user from database (internal method)
   */
  private async fetchUserFromDb(userId: string): Promise<UserWithRoles | null> {
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
        organizationId: this.options.organizationId,
        deletedAt: null
      },
      select: {
        id: true,
        email: true,
        displayName: true,
        status: true,
        mfaEnabled: true,
        createdAt: true,
        userRoles: {
          where: { isActive: true },
          select: {
            role: {
              select: {
                id: true,
                name: true,
                description: true,
                isSystem: true,
                isActive: true
              }
            }
          }
        }
      }
    });

    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      status: user.status,
      mfaEnabled: user.mfaEnabled,
      createdAt: user.createdAt,
      userRoles: user.userRoles.map(ur => ({
        role: ur.role
      }))
    };
  }

  /**
   * Generate temporary password hash
   */
  private generateTemporaryPassword(): string {
    // In production, this would generate a secure random password
    // For now, return a placeholder that will be updated on first login
    return 'temporary_password_hash_' + Date.now();
  }
}
