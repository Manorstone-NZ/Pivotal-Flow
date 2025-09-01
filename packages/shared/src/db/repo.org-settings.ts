// Organization settings repository with caching for hot reads

import { PrismaClient, Prisma } from '@prisma/client';
import { BaseRepository } from './repo.base.js';
import type { BaseRepositoryOptions } from './repo.base.js';
import { CacheWrapper, CacheKeyBuilder } from '../cache/index.js';

export interface OrganizationSetting {
  id: string;
  organizationId: string;
  category: string;
  key: string;
  value: Prisma.JsonValue;
  description: string | null;
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Role {
  id: string;
  organizationId: string;
  name: string;
  description: string | null;
  permissions: Prisma.JsonValue;
  isSystem: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Permission {
  id: string;
  name: string;
  description: string | null;
  category: string;
  resource: string;
  action: string;
  createdAt: Date;
}

export interface OrganizationSettingsRepositoryOptions extends BaseRepositoryOptions {
  cache?: CacheWrapper;
}

export class OrganizationSettingsRepository extends BaseRepository {
  constructor(
    prisma: PrismaClient,
    options: OrganizationSettingsRepositoryOptions,
    private readonly cache?: CacheWrapper
  ) {
    super(prisma, options);
  }

  /**
   * Get organization settings with caching
   * TTL: 300s (5 minutes) with jitter
   */
  async getOrganizationSettings(): Promise<OrganizationSetting[]> {
    if (!this.cache) {
      return this.getOrganizationSettingsDirect();
    }

    const cacheKey = CacheKeyBuilder.buildOrgSettingsKey(this.options.organizationId);
    
    return this.cache.getOrSet(
      cacheKey,
      () => this.getOrganizationSettingsDirect(),
      300 // 5 minutes TTL
    );
  }

  /**
   * Get organization settings directly from database
   */
  private async getOrganizationSettingsDirect(): Promise<OrganizationSetting[]> {
    try {
      const settings = await this.prisma.organizationSetting.findMany({
        where: {
          organizationId: this.options.organizationId
        },
        orderBy: [
          { category: 'asc' },
          { key: 'asc' }
        ]
      });

      return settings;
    } catch (error) {
      throw this.handlePrismaError(error, 'getOrganizationSettings');
    }
  }

  /**
   * Get organization roles with caching
   * TTL: 600s (10 minutes) with jitter
   */
  async getOrganizationRoles(): Promise<Role[]> {
    if (!this.cache) {
      return this.getOrganizationRolesDirect();
    }

    const cacheKey = CacheKeyBuilder.buildOrgRolesKey(this.options.organizationId);
    
    return this.cache.getOrSet(
      cacheKey,
      () => this.getOrganizationRolesDirect(),
      600 // 10 minutes TTL
    );
  }

  /**
   * Get organization roles directly from database
   */
  private async getOrganizationRolesDirect(): Promise<Role[]> {
    try {
      const roles = await this.prisma.role.findMany({
        where: {
          organizationId: this.options.organizationId,
          isActive: true
        },
        orderBy: [
          { isSystem: 'desc' },
          { name: 'asc' }
        ]
      });

      return roles;
    } catch (error) {
      throw this.handlePrismaError(error, 'getOrganizationRoles');
    }
  }

  /**
   * Get role permissions with caching
   * TTL: 900s (15 minutes) with jitter
   */
  async getRolePermissions(roleId: string): Promise<Permission[]> {
    if (!this.cache) {
      return this.getRolePermissionsDirect(roleId);
    }

    const cacheKey = CacheKeyBuilder.buildRolePermissionsKey(this.options.organizationId, roleId);
    
    return this.cache.getOrSet(
      cacheKey,
      () => this.getRolePermissionsDirect(roleId),
      900 // 15 minutes TTL
    );
  }

  /**
   * Get role permissions directly from database
   */
  private async getRolePermissionsDirect(roleId: string): Promise<Permission[]> {
    try {
      const role = await this.prisma.role.findFirst({
        where: {
          id: roleId,
          organizationId: this.options.organizationId,
          isActive: true
        },
        select: {
          permissions: true
        }
      });

      if (!role || !Array.isArray(role.permissions)) {
        return [];
      }

      // Get permissions by IDs from role.permissions array
      const permissionIds = role.permissions as string[];
      
      if (permissionIds.length === 0) {
        return [];
      }

      const permissions = await this.prisma.permission.findMany({
        where: {
          id: { in: permissionIds }
        },
        orderBy: [
          { category: 'asc' },
          { resource: 'asc' },
          { action: 'asc' }
        ]
      });

      return permissions;
    } catch (error) {
      throw this.handlePrismaError(error, 'getRolePermissions');
    }
  }

  /**
   * Update organization setting with cache bust
   */
  async updateOrganizationSetting(
    category: string,
    key: string,
    value: Prisma.JsonValue,
    description?: string | null
  ): Promise<OrganizationSetting> {
    try {
      const setting = await this.prisma.organizationSetting.upsert({
        where: {
          organizationId_category_key: {
            organizationId: this.options.organizationId,
            category,
            key
          }
        },
        update: {
          value: value,
          description: description ?? null,
          updatedAt: new Date()
        },
        create: {
          organizationId: this.options.organizationId,
          category,
          key,
          value: value,
          description: description ?? null,
          isSystem: false
        }
      });

      // Bust organization cache
      if (this.cache) {
        await this.cache.bustOrgCache(this.options.organizationId);
      }

      return setting;
    } catch (error) {
      throw this.handlePrismaError(error, 'updateOrganizationSetting');
    }
  }

  /**
   * Update role permissions with cache bust
   */
  async updateRolePermissions(
    roleId: string,
    permissions: string[]
  ): Promise<Role> {
    try {
      const role = await this.prisma.role.update({
        where: {
          id: roleId,
          organizationId: this.options.organizationId
        },
        data: {
          permissions,
          updatedAt: new Date()
        }
      });

      // Bust role and organization cache
      if (this.cache) {
        await this.cache.bustRoleCache(this.options.organizationId, roleId);
      }

      return role;
    } catch (error) {
      throw this.handlePrismaError(error, 'updateRolePermissions');
    }
  }

  /**
   * Create new role with cache bust
   */
  async createRole(data: {
    name: string;
    description?: string;
    permissions: string[];
    isSystem?: boolean;
  }): Promise<Role> {
    try {
      const role = await this.prisma.role.create({
        data: {
          organizationId: this.options.organizationId,
          name: data.name,
          description: data.description ?? null,
          permissions: data.permissions,
          isSystem: data.isSystem || false,
          isActive: true
        }
      });

      // Bust organization cache
      if (this.cache) {
        await this.cache.bustOrgCache(this.options.organizationId);
      }

      return role;
    } catch (error) {
      throw this.handlePrismaError(error, 'createRole');
    }
  }

  /**
   * Update role with cache bust
   */
  async updateRole(
    roleId: string,
    data: {
      name?: string;
      description?: string;
      isActive?: boolean;
    }
  ): Promise<Role> {
    try {
      const role = await this.prisma.role.update({
        where: {
          id: roleId,
          organizationId: this.options.organizationId
        },
        data: {
          ...data,
          updatedAt: new Date()
        }
      });

      // Bust role and organization cache
      if (this.cache) {
        await this.cache.bustRoleCache(this.options.organizationId, roleId);
      }

      return role;
    } catch (error) {
      throw this.handlePrismaError(error, 'updateRole');
    }
  }
}
