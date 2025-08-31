import type { FastifyInstance } from 'fastify';
import { verifyPassword } from '@pivotal-flow/shared/security/password';

export interface UserWithRoles {
  id: string;
  email: string;
  displayName: string | null;
  status: string;
  passwordHash: string;
  organizationId: string;
  roles: Array<{
    id: string;
    name: string;
    description: string | null;
    isSystem: boolean;
    isActive: boolean;
  }>;
}

export interface AuthUser {
  id: string;
  email: string;
  displayName: string | null;
  roles: string[];
  organizationId: string;
}

export class AuthService {
  constructor(private fastify: FastifyInstance) {}

  async authenticateUser(email: string, password: string): Promise<AuthUser | null> {
    try {
      // Find user by email
      const result = await this.fastify.db.query(
        `SELECT 
          u.id,
          u.email,
          u."displayName",
          u.status,
          u."passwordHash",
          u."organizationId"
        FROM users u
        WHERE u.email = $1 AND u.status = 'active'
        LIMIT 1`,
        [email.toLowerCase()]
      );

      if (result.length === 0) {
        return null;
      }

      const user = result[0] as unknown as UserWithRoles;

      // Verify password
      const isValidPassword = await verifyPassword(password, user.passwordHash);
      if (!isValidPassword) {
        return null;
      }

      // Get user roles
      const rolesResult = await this.fastify.db.query(
        `SELECT r.name
         FROM user_roles ur
         JOIN roles r ON ur."roleId" = r.id
         WHERE ur."userId" = $1 AND ur."isActive" = true AND r."isActive" = true`,
        [user.id]
      );

      const roles = rolesResult.map((row: any) => row.name);

      return {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        roles,
        organizationId: user.organizationId
      };
    } catch (error) {
      this.fastify.log.error({ err: error }, 'Error authenticating user');
      throw error;
    }
  }

  async getUserById(userId: string): Promise<AuthUser | null> {
    try {
      const result = await this.fastify.db.query(
        `SELECT 
          u.id,
          u.email,
          u."displayName",
          u.status,
          u."organizationId"
        FROM users u
        WHERE u.id = $1 AND u.status = 'active'
        LIMIT 1`,
        [userId]
      );

      if (result.length === 0) {
        return null;
      }

      const user = result[0] as unknown as UserWithRoles;

      // Get user roles
      const rolesResult = await this.fastify.db.query(
        `SELECT r.name
         FROM user_roles ur
         JOIN roles r ON ur."roleId" = r.id
         WHERE ur."userId" = $1 AND ur."isActive" = true AND r."isActive" = true`,
        [user.id]
      );

      const roles = rolesResult.map((row: any) => row.name);

      return {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        roles,
        organizationId: user.organizationId
      };
    } catch (error) {
      this.fastify.log.error({ err: error }, 'Error getting user by ID');
      throw error;
    }
  }
}
