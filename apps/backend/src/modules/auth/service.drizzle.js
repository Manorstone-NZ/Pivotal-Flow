import { verifyPassword } from '@pivotal-flow/shared';
import { eq, and } from 'drizzle-orm';
import { users, roles as rolesTable, userRoles as userRolesTable } from '../../lib/schema.js';
export class AuthService {
    fastify;
    constructor(fastify) {
        this.fastify = fastify;
    }
    async authenticateUser(email, password) {
        try {
            // Find user by email using Drizzle
            const userResult = await this.fastify.db
                .select({
                id: users.id,
                email: users.email,
                displayName: users.displayName,
                status: users.status,
                passwordHash: users.passwordHash,
                organizationId: users.organizationId,
            })
                .from(users)
                .where(and(eq(users.email, email.toLowerCase()), eq(users.status, 'active')))
                .limit(1);
            if (userResult.length === 0) {
                return null;
            }
            const user = userResult[0];
            if (!user) {
                return null;
            }
            // Verify password
            const isValidPassword = await verifyPassword(password, user.passwordHash ?? '');
            if (!isValidPassword) {
                return null;
            }
            // Get user roles using Drizzle
            const rolesResult = await this.fastify.db
                .select({
                name: rolesTable.name,
            })
                .from(userRolesTable)
                .innerJoin(rolesTable, eq(userRolesTable.roleId, rolesTable.id))
                .where(and(eq(userRolesTable.userId, user.id), eq(userRolesTable.isActive, true), eq(rolesTable.isActive, true)));
            const userRolesList = rolesResult.map((row) => row.name);
            return {
                id: user.id,
                email: user.email,
                displayName: user.displayName,
                roles: userRolesList,
                organizationId: user.organizationId,
            };
        }
        catch (error) {
            this.fastify.log.error({ err: error }, 'Error authenticating user');
            throw error;
        }
    }
    async getUserById(userId) {
        try {
            const userResult = await this.fastify.db
                .select({
                id: users.id,
                email: users.email,
                displayName: users.displayName,
                status: users.status,
                organizationId: users.organizationId,
            })
                .from(users)
                .where(and(eq(users.id, userId), eq(users.status, 'active')))
                .limit(1);
            if (userResult.length === 0) {
                return null;
            }
            const user = userResult[0];
            if (!user) {
                return null;
            }
            // Get user roles using Drizzle
            const rolesResult = await this.fastify.db
                .select({
                name: rolesTable.name,
            })
                .from(userRolesTable)
                .innerJoin(rolesTable, eq(userRolesTable.roleId, rolesTable.id))
                .where(and(eq(userRolesTable.userId, user.id), eq(userRolesTable.isActive, true), eq(rolesTable.isActive, true)));
            const userRolesList = rolesResult.map((row) => row.name);
            return {
                id: user.id,
                email: user.email,
                displayName: user.displayName,
                roles: userRolesList,
                organizationId: user.organizationId,
            };
        }
        catch (error) {
            this.fastify.log.error({ err: error }, 'Error getting user by ID');
            throw error;
        }
    }
}
//# sourceMappingURL=service.drizzle.js.map