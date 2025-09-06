// User service layer - Drizzle ORM calls only, no HTTP logic
import { generateId, required } from '@pivotal-flow/shared';
import { eq, and, like, desc, asc, isNull, count } from 'drizzle-orm';
import { users, roles, userRoles } from '../../lib/schema.js';
// Local password hashing function
async function hashPassword(password) {
    // Simple hash for now - replace with proper bcrypt in production
    return Buffer.from(password).toString('base64');
}
/**
 * List users with pagination and filters using Drizzle ORM
 */
export async function listUsers(options, fastify) {
    const { organizationId, filters = {}, sort = { field: 'createdAt', direction: 'desc' }, page, pageSize } = options;
    // Build where conditions
    const whereConditions = [
        eq(users.organizationId, organizationId),
        isNull(users.deletedAt)
    ];
    if (filters.isActive !== undefined) {
        whereConditions.push(eq(users.status, filters.isActive ? 'active' : 'inactive'));
    }
    if (filters.q) {
        whereConditions.push(like(users.email, `%${filters.q}%`));
    }
    // Get total count
    const countResult = await fastify.db
        .select({ total: count() })
        .from(users)
        .where(and(...whereConditions));
    const total = countResult[0]?.total || 0;
    // Calculate pagination
    const totalPages = Math.ceil(total / pageSize);
    const offset = (page - 1) * pageSize;
    // Get users with roles using Drizzle
    const usersResult = await fastify.db
        .select({
        id: users.id,
        email: users.email,
        displayName: users.displayName,
        status: users.status,
        mfaEnabled: users.mfaEnabled,
        createdAt: users.createdAt,
        organizationId: users.organizationId,
        roleId: roles.id,
        roleName: roles.name,
        roleDescription: roles.description,
        roleIsSystem: roles.isSystem,
        roleIsActive: roles.isActive,
    })
        .from(users)
        .leftJoin(userRoles, and(eq(userRoles.userId, users.id), eq(userRoles.isActive, true)))
        .leftJoin(roles, and(eq(userRoles.roleId, roles.id), eq(roles.isActive, true)))
        .where(and(...whereConditions))
        .orderBy(sort.field === 'email' ? asc(users.email) : desc(users.createdAt))
        .limit(pageSize)
        .offset(offset);
    // Transform to UserWithRoles format
    const userMap = new Map();
    for (const row of usersResult) {
        const userId = row.id;
        if (!userMap.has(userId)) {
            userMap.set(userId, {
                id: userId,
                email: row.email,
                displayName: row.displayName,
                status: row.status,
                mfaEnabled: row.mfaEnabled,
                createdAt: row.createdAt,
                organizationId: row.organizationId,
                roles: []
            });
        }
        if (row.roleId && row.roleName && row.roleIsSystem !== null && row.roleIsActive !== null) {
            const user = required(userMap.get(userId), `User ${userId} should exist in map`);
            user.roles.push({
                id: row.roleId,
                name: row.roleName,
                description: row.roleDescription,
                isSystem: row.roleIsSystem,
                isActive: row.roleIsActive
            });
        }
    }
    // Transform to UserPublic format
    const items = Array.from(userMap.values()).map(user => ({
        id: user.id,
        email: user.email,
        displayName: user.displayName ?? 'Unknown User',
        status: user.status,
        isActive: user.status === 'active',
        mfaEnabled: user.mfaEnabled,
        createdAt: user.createdAt,
        organizationId: user.organizationId,
        roles: user.roles.map(role => ({
            id: role.id,
            name: role.name,
            description: role.description,
            isSystem: role.isSystem,
            isActive: role.isActive
        }))
    }));
    return {
        items,
        total,
        totalPages
    };
}
/**
 * Get user by ID using Drizzle ORM
 */
export async function getUserById(userId, organizationId, fastify) {
    const result = await fastify.db
        .select({
        id: users.id,
        email: users.email,
        displayName: users.displayName,
        status: users.status,
        mfaEnabled: users.mfaEnabled,
        createdAt: users.createdAt,
        organizationId: users.organizationId,
        roleId: roles.id,
        roleName: roles.name,
        roleDescription: roles.description,
        roleIsSystem: roles.isSystem,
        roleIsActive: roles.isActive,
    })
        .from(users)
        .leftJoin(userRoles, and(eq(userRoles.userId, users.id), eq(userRoles.isActive, true)))
        .leftJoin(roles, and(eq(userRoles.roleId, roles.id), eq(roles.isActive, true)))
        .where(and(eq(users.id, userId), eq(users.organizationId, organizationId), isNull(users.deletedAt)));
    if (result.length === 0) {
        return null;
    }
    const firstRow = result[0];
    if (!firstRow) {
        return null;
    }
    const user = {
        id: firstRow.id,
        email: firstRow.email,
        displayName: firstRow.displayName,
        status: firstRow.status,
        mfaEnabled: firstRow.mfaEnabled,
        createdAt: firstRow.createdAt,
        organizationId: firstRow.organizationId,
        roles: []
    };
    // Add roles
    for (const row of result) {
        if (row.roleId && row.roleName && row.roleIsSystem !== null && row.roleIsActive !== null) {
            user.roles.push({
                id: row.roleId,
                name: row.roleName,
                description: row.roleDescription,
                isSystem: row.roleIsSystem,
                isActive: row.roleIsActive
            });
        }
    }
    return user;
}
/**
 * Create new user using Drizzle ORM
 */
export async function createUser(userData, organizationId, fastify) {
    const { email, displayName } = userData;
    // Note: Password and role assignment will be implemented in future iterations
    const password = 'temporary-password';
    const roleIds = [];
    // Check if user already exists
    const existingUser = await fastify.db
        .select({ id: users.id })
        .from(users)
        .where(and(eq(users.email, email), eq(users.organizationId, organizationId), isNull(users.deletedAt)))
        .limit(1);
    if (existingUser.length > 0) {
        throw new Error('User with this email already exists');
    }
    // Create user
    const hashedPassword = await hashPassword(password);
    const [userResult] = await fastify.db
        .insert(users)
        .values({
        id: generateId(),
        email,
        displayName,
        passwordHash: hashedPassword,
        status: 'active',
        mfaEnabled: false,
        organizationId,
    })
        .returning({
        id: users.id,
        email: users.email,
        displayName: users.displayName,
        status: users.status,
        mfaEnabled: users.mfaEnabled,
        createdAt: users.createdAt,
        organizationId: users.organizationId,
    });
    if (!userResult) {
        throw new Error('Failed to create user');
    }
    const userId = userResult.id;
    // Assign roles
    if (roleIds.length > 0) {
        for (const roleId of roleIds) {
            await fastify.db
                .insert(userRoles)
                .values({
                id: generateId(),
                userId,
                roleId,
                organizationId,
                isActive: true,
            });
        }
    }
    // Return created user with roles
    const createdUser = await getUserById(userId, organizationId, fastify);
    if (!createdUser) {
        throw new Error('Failed to create user');
    }
    return createdUser;
}
/**
 * Update user using Drizzle ORM
 */
export async function updateUser(userId, updateData, organizationId, fastify) {
    const { displayName } = updateData;
    // Note: Status and MFA settings will be implemented in future iterations
    const status = 'active';
    const mfaEnabled = false;
    const [result] = await fastify.db
        .update(users)
        .set({
        displayName,
        status,
        mfaEnabled,
    })
        .where(and(eq(users.id, userId), eq(users.organizationId, organizationId), isNull(users.deletedAt)))
        .returning({
        id: users.id,
        email: users.email,
        displayName: users.displayName,
        status: users.status,
        mfaEnabled: users.mfaEnabled,
        createdAt: users.createdAt,
        organizationId: users.organizationId,
    });
    if (!result) {
        throw new Error('User not found');
    }
    // Return updated user with roles
    const updatedUser = await getUserById(userId, organizationId, fastify);
    if (!updatedUser) {
        throw new Error('Failed to update user');
    }
    return updatedUser;
}
/**
 * Add role to user using Drizzle ORM
 */
export async function addRoleToUser(userId, roleId, organizationId, fastify) {
    // Check if user exists
    const userExists = await fastify.db
        .select({ id: users.id })
        .from(users)
        .where(and(eq(users.id, userId), eq(users.organizationId, organizationId), isNull(users.deletedAt)))
        .limit(1);
    if (userExists.length === 0) {
        throw new Error('User not found');
    }
    // Check if role exists
    const roleExists = await fastify.db
        .select({ id: roles.id })
        .from(roles)
        .where(eq(roles.isActive, true))
        .limit(1);
    if (roleExists.length === 0) {
        throw new Error('Role not found');
    }
    // Check if user already has this role
    const existingRole = await fastify.db
        .select({ id: userRoles.id })
        .from(userRoles)
        .where(and(eq(userRoles.userId, userId), eq(userRoles.roleId, roleId)))
        .limit(1);
    if (existingRole.length > 0) {
        // Update existing role to active
        await fastify.db
            .update(userRoles)
            .set({
            isActive: true,
        })
            .where(and(eq(userRoles.userId, userId), eq(userRoles.roleId, roleId)));
    }
    else {
        // Create new user role
        await fastify.db
            .insert(userRoles)
            .values({
            id: generateId(),
            userId,
            roleId,
            organizationId,
            isActive: true,
        });
    }
}
/**
 * Remove role from user using Drizzle ORM
 */
export async function removeRoleFromUser(userId, roleId, organizationId, fastify) {
    // Check if user exists
    const userExists = await fastify.db
        .select({ id: users.id })
        .from(users)
        .where(and(eq(users.id, userId), eq(users.organizationId, organizationId), isNull(users.deletedAt)))
        .limit(1);
    if (userExists.length === 0) {
        throw new Error('User not found');
    }
    // Deactivate user role
    await fastify.db
        .update(userRoles)
        .set({
        isActive: false,
    })
        .where(and(eq(userRoles.userId, userId), eq(userRoles.roleId, roleId)));
}
/**
 * Get user roles using Drizzle ORM
 */
export async function getUserRoles(userId, fastify) {
    const result = await fastify.db
        .select({
        id: roles.id,
        name: roles.name,
        description: roles.description,
        isSystem: roles.isSystem,
        isActive: roles.isActive,
    })
        .from(userRoles)
        .innerJoin(roles, eq(userRoles.roleId, roles.id))
        .where(and(eq(userRoles.userId, userId), eq(userRoles.isActive, true), eq(roles.isActive, true)));
    return result.map((row) => ({
        id: row.id,
        name: row.name,
        description: row.description,
        isSystem: row.isSystem,
        isActive: row.isActive
    }));
}
/**
 * Check if user has role using Drizzle ORM
 */
export async function userHasRole(userId, roleName, fastify) {
    const result = await fastify.db
        .select({ id: roles.id })
        .from(userRoles)
        .innerJoin(roles, eq(userRoles.roleId, roles.id))
        .where(and(eq(userRoles.userId, userId), eq(userRoles.isActive, true), eq(roles.name, roleName), eq(roles.isActive, true)))
        .limit(1);
    return result.length > 0;
}
/**
 * UserService class for backward compatibility with tests
 */
export class UserService {
    options;
    constructor(options) {
        this.options = options;
    }
    async createUser(userData) {
        const fastify = { log: { info: () => { }, error: () => { }, warn: () => { } } };
        return createUser(userData, this.options.organizationId, fastify);
    }
    async getUser(userId) {
        const fastify = { log: { info: () => { }, error: () => { }, warn: () => { } } };
        return getUserById(userId, this.options.organizationId, fastify);
    }
    async getUsers(options) {
        const fastify = { log: { info: () => { }, error: () => { }, warn: () => { } } };
        const listOptions = {
            organizationId: this.options.organizationId,
            page: options.page,
            pageSize: options.limit,
            filters: options.search ? { q: options.search } : {},
            sort: { field: 'createdAt', direction: 'desc' }
        };
        return listUsers(listOptions, fastify);
    }
    async updateUser(userId, updateData) {
        const fastify = { log: { info: () => { }, error: () => { }, warn: () => { } } };
        return updateUser(userId, updateData, this.options.organizationId, fastify);
    }
    async addUserRole(userId, roleName) {
        const fastify = { log: { info: () => { }, error: () => { }, warn: () => { } } };
        await addRoleToUser(userId, roleName, this.options.organizationId, fastify);
        // Return the created user role assignment
        return {
            userId,
            roleId: roleName,
            organizationId: this.options.organizationId,
            isActive: true
        };
    }
    async removeUserRole(userId, roleName) {
        const fastify = { log: { info: () => { }, error: () => { }, warn: () => { } } };
        await removeRoleFromUser(userId, roleName, this.options.organizationId, fastify);
        // Return the removed user role assignment info
        return {
            userId,
            roleId: roleName,
            organizationId: this.options.organizationId,
            isActive: false
        };
    }
}
//# sourceMappingURL=service.drizzle.js.map