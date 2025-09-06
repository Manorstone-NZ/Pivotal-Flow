export declare const PERMISSIONS: {
    readonly QUOTES: {
        readonly VIEW: "quotes.view";
        readonly CREATE: "quotes.create";
        readonly UPDATE: "quotes.update";
        readonly DELETE: "quotes.delete";
        readonly APPROVE: "quotes.approve";
        readonly SEND: "quotes.send";
        readonly OVERRIDE_PRICE: "quotes.override_price";
    };
    readonly RATE_CARDS: {
        readonly VIEW: "rate_cards.view";
        readonly CREATE: "rate_cards.create";
        readonly UPDATE: "rate_cards.update";
        readonly DELETE: "rate_cards.delete";
    };
    readonly USERS: {
        readonly VIEW: "users.view";
        readonly CREATE: "users.create";
        readonly UPDATE: "users.update";
        readonly DELETE: "users.delete";
        readonly MANAGE_ROLES: "users.manage_roles";
    };
    readonly CUSTOMERS: {
        readonly VIEW: "customers.view";
        readonly CREATE: "customers.create";
        readonly UPDATE: "customers.update";
        readonly DELETE: "customers.delete";
    };
    readonly PROJECTS: {
        readonly VIEW: "projects.view";
        readonly CREATE: "projects.create";
        readonly UPDATE: "projects.update";
        readonly DELETE: "projects.delete";
    };
    readonly APPROVALS: {
        readonly VIEW: "approvals.view";
        readonly REQUEST: "approvals.request";
        readonly DECIDE: "approvals.decide";
    };
    readonly ALLOCATIONS: {
        readonly CREATE: "allocations.create";
        readonly READ: "allocations.read";
        readonly UPDATE: "allocations.update";
        readonly DELETE: "allocations.delete";
        readonly VIEW_CAPACITY: "allocations.view_capacity";
    };
    readonly PORTAL: {
        readonly VIEW_OWN_QUOTES: "portal.view_own_quotes";
        readonly VIEW_OWN_INVOICES: "portal.view_own_invoices";
        readonly VIEW_OWN_TIME_ENTRIES: "portal.view_own_time_entries";
    };
    readonly REPORTS: {
        readonly VIEW_REPORTS: "reports.view_reports";
        readonly EXPORT_REPORTS: "reports.export_reports";
        readonly VIEW_COMPLIANCE: "reports.view_compliance";
    };
    readonly JOBS: {
        readonly CREATE_JOBS: "jobs.create_jobs";
        readonly VIEW_JOBS: "jobs.view_jobs";
        readonly CANCEL_JOBS: "jobs.cancel_jobs";
        readonly RETRY_JOBS: "jobs.retry_jobs";
    };
    readonly FILES: {
        readonly GENERATE_FILES: "files.generate_files";
        readonly ACCESS_FILES: "files.access_files";
        readonly VIEW_FILES: "files.view_files";
        readonly DELETE_FILES: "files.delete_files";
        readonly CLEANUP_FILES: "files.cleanup_files";
    };
};
export declare const ALL_PERMISSIONS: ("quotes.view" | "quotes.create" | "quotes.update" | "quotes.delete" | "quotes.approve" | "quotes.send" | "quotes.override_price" | "rate_cards.view" | "rate_cards.create" | "rate_cards.update" | "rate_cards.delete" | "users.view" | "users.create" | "users.update" | "users.delete" | "users.manage_roles" | "customers.view" | "customers.create" | "customers.update" | "customers.delete" | "projects.view" | "projects.create" | "projects.update" | "projects.delete" | "approvals.view" | "approvals.request" | "approvals.decide" | "allocations.create" | "allocations.read" | "allocations.update" | "allocations.delete" | "allocations.view_capacity" | "portal.view_own_quotes" | "portal.view_own_invoices" | "portal.view_own_time_entries" | "reports.view_reports" | "reports.export_reports" | "reports.view_compliance" | "jobs.create_jobs" | "jobs.view_jobs" | "jobs.cancel_jobs" | "jobs.retry_jobs" | "files.generate_files" | "files.access_files" | "files.view_files" | "files.delete_files" | "files.cleanup_files")[];
export declare const PERMISSION_CATEGORIES: {
    readonly QUOTES: "quotes";
    readonly RATE_CARDS: "rate_cards";
    readonly USERS: "users";
    readonly CUSTOMERS: "customers";
    readonly PROJECTS: "projects";
    readonly APPROVALS: "approvals";
    readonly ALLOCATIONS: "allocations";
    readonly PORTAL: "portal";
    readonly REPORTS: "reports";
    readonly JOBS: "jobs";
    readonly FILES: "files";
};
//# sourceMappingURL=constants.d.ts.map