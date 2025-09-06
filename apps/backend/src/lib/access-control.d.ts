/**
 * Access Control Middleware for C0 Backend Readiness
 * Enforces bearer auth, tenancy, and permission checks on every handler
 */
import type { FastifyRequest, FastifyReply } from 'fastify';
export declare const ROUTE_PERMISSIONS: {
    readonly '/auth/login': null;
    readonly '/auth/refresh': null;
    readonly '/auth/logout': null;
    readonly '/auth/me': null;
    readonly 'GET /users': "users.view_users";
    readonly 'POST /users': "users.create_users";
    readonly 'GET /users/:id': "users.view_users";
    readonly 'PUT /users/:id': "users.update_users";
    readonly 'DELETE /users/:id': "users.delete_users";
    readonly 'GET /quotes': "quotes.view_quotes";
    readonly 'POST /quotes': "quotes.create_quotes";
    readonly 'GET /quotes/:id': "quotes.view_quotes";
    readonly 'PUT /quotes/:id': "quotes.update_quotes";
    readonly 'DELETE /quotes/:id': "quotes.delete_quotes";
    readonly 'GET /projects': "projects.view_projects";
    readonly 'POST /projects': "projects.create_projects";
    readonly 'GET /projects/:id': "projects.view_projects";
    readonly 'PUT /projects/:id': "projects.update_projects";
    readonly 'DELETE /projects/:id': "projects.delete_projects";
    readonly 'GET /time-entries': "time.view_time_entries";
    readonly 'POST /time-entries': "time.create_time_entries";
    readonly 'GET /time-entries/:id': "time.view_time_entries";
    readonly 'PUT /time-entries/:id': "time.update_time_entries";
    readonly 'DELETE /time-entries/:id': "time.delete_time_entries";
    readonly 'GET /payments': "payments.view_payments";
    readonly 'POST /payments': "payments.create_payments";
    readonly 'GET /payments/:id': "payments.view_payments";
    readonly 'PUT /payments/:id': "payments.update_payments";
    readonly 'DELETE /payments/:id': "payments.delete_payments";
    readonly 'GET /reports/summary/*': "reports.view_reports";
    readonly 'POST /reports/export': "reports.export_reports";
    readonly 'GET /reports/export/:id': "reports.export_reports";
    readonly 'GET /reports/export/:id/download': "reports.export_reports";
    readonly 'GET /portal/quotes': "portal.view_quotes";
    readonly 'GET /portal/quotes/:id': "portal.view_quotes";
    readonly 'GET /portal/invoices': "portal.view_invoices";
    readonly 'GET /portal/invoices/:id': "portal.view_invoices";
    readonly 'GET /portal/time': "portal.view_time";
    readonly 'GET /permissions': "permissions.view_permissions";
    readonly 'POST /permissions': "permissions.create_permissions";
    readonly 'GET /permissions/:id': "permissions.view_permissions";
    readonly 'PUT /permissions/:id': "permissions.update_permissions";
    readonly 'DELETE /permissions/:id': "permissions.delete_permissions";
    readonly 'GET /roles': "roles.view_roles";
    readonly 'POST /roles': "roles.create_roles";
    readonly 'GET /roles/:id': "roles.view_roles";
    readonly 'PUT /roles/:id': "roles.update_roles";
    readonly 'DELETE /roles/:id': "roles.delete_roles";
    readonly 'GET /currencies': "currencies.view_currencies";
    readonly 'POST /currencies': "currencies.create_currencies";
    readonly 'GET /currencies/:id': "currencies.view_currencies";
    readonly 'PUT /currencies/:id': "currencies.update_currencies";
    readonly 'DELETE /currencies/:id': "currencies.delete_currencies";
    readonly 'GET /rate-cards': "rate_cards.view_rate_cards";
    readonly 'POST /rate-cards': "rate_cards.create_rate_cards";
    readonly 'GET /rate-cards/:id': "rate_cards.view_rate_cards";
    readonly 'PUT /rate-cards/:id': "rate_cards.update_rate_cards";
    readonly 'DELETE /rate-cards/:id': "rate_cards.delete_rate_cards";
};
export declare const PUBLIC_ROUTES: string[];
export declare const AUTH_ONLY_ROUTES: string[];
/**
 * Access control middleware
 */
export declare function accessControlMiddleware(request: FastifyRequest): Promise<void>;
/**
 * Tenancy middleware - ensures data isolation
 */
export declare function tenancyMiddleware(request: FastifyRequest): Promise<void>;
/**
 * Request context middleware - adds request metadata
 */
export declare function requestContextMiddleware(request: FastifyRequest, reply: FastifyReply, done: () => void): void;
//# sourceMappingURL=access-control.d.ts.map