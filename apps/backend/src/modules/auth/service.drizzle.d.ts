import type { FastifyInstance } from 'fastify';
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
export declare class AuthService {
    private fastify;
    constructor(fastify: FastifyInstance);
    authenticateUser(email: string, password: string): Promise<AuthUser | null>;
    getUserById(userId: string): Promise<AuthUser | null>;
}
//# sourceMappingURL=service.drizzle.d.ts.map