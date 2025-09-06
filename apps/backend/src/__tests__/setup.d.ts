import '../config/load-test-env.js';
import type { FastifyInstance } from 'fastify';
import { organizations, users, customers, roles } from '../lib/schema.js';
declare let testDb: any;
declare let testRedis: any;
declare let app: FastifyInstance;
declare const testUtils: {
    generateId(): string;
    createTestOrganization(data?: Partial<typeof organizations.$inferInsert>): Promise<any>;
    createTestUser(data?: Partial<typeof users.$inferInsert>): Promise<any>;
    createTestCustomer(organizationId: string, data?: Partial<typeof customers.$inferInsert>): Promise<any>;
    createTestRole(organizationId: string, data?: Partial<typeof roles.$inferInsert>): Promise<any>;
    generateTestToken(userId: string, organizationId: string, permissions?: string[]): string;
    cleanupTestData(): Promise<void>;
};
export { app, testDb, testRedis, testUtils };
//# sourceMappingURL=setup.d.ts.map