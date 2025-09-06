/**
 * Portal Module Constants
 *
 * Constants for the customer portal API system
 */
export declare const PORTAL_USER_TYPES: {
    readonly INTERNAL: "internal";
    readonly EXTERNAL_CUSTOMER: "external_customer";
};
export type PortalUserType = typeof PORTAL_USER_TYPES[keyof typeof PORTAL_USER_TYPES];
export declare const PORTAL_PERMISSIONS: {
    readonly VIEW_OWN_QUOTES: "portal.view_own_quotes";
    readonly VIEW_OWN_INVOICES: "portal.view_own_invoices";
    readonly VIEW_OWN_TIME_ENTRIES: "portal.view_own_time_entries";
};
export type PortalPermission = typeof PORTAL_PERMISSIONS[keyof typeof PORTAL_PERMISSIONS];
export declare const CUSTOMER_VISIBLE_QUOTE_STATUSES: {
    readonly DRAFT: "draft";
    readonly SENT: "sent";
    readonly APPROVED: "approved";
    readonly ACCEPTED: "accepted";
    readonly EXPIRED: "expired";
    readonly REJECTED: "rejected";
};
export type CustomerVisibleQuoteStatus = typeof CUSTOMER_VISIBLE_QUOTE_STATUSES[keyof typeof CUSTOMER_VISIBLE_QUOTE_STATUSES];
export declare const CUSTOMER_VISIBLE_INVOICE_STATUSES: {
    readonly DRAFT: "draft";
    readonly SENT: "sent";
    readonly PART_PAID: "part_paid";
    readonly PAID: "paid";
    readonly OVERDUE: "overdue";
};
export type CustomerVisibleInvoiceStatus = typeof CUSTOMER_VISIBLE_INVOICE_STATUSES[keyof typeof CUSTOMER_VISIBLE_INVOICE_STATUSES];
export declare const PORTAL_RATE_LIMITS: {
    readonly DEFAULT_RPM: 200;
    readonly BURST_LIMIT: 50;
    readonly WINDOW_MS: 60000;
};
export declare const PORTAL_METRICS: {
    readonly REQUESTS_TOTAL: "pivotal_portal_requests_total";
    readonly REQUEST_DURATION_MS: "pivotal_portal_request_duration_ms";
    readonly AUTH_FAILURES_TOTAL: "pivotal_portal_auth_failures_total";
    readonly RATE_LIMIT_HITS_TOTAL: "pivotal_portal_rate_limit_hits_total";
    readonly ISOLATION_VIOLATIONS_TOTAL: "pivotal_portal_isolation_violations_total";
};
export declare const PORTAL_CONFIG: {
    readonly DEFAULT_PAGE_SIZE: 25;
    readonly MAX_PAGE_SIZE: 100;
    readonly PERFORMANCE_TARGET_MS: 250;
};
//# sourceMappingURL=constants.d.ts.map