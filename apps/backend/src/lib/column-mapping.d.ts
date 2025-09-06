/**
 * Database Column Name Mapping Utility
 *
 * This utility helps maintain consistency between:
 * - Database: snake_case (rate_cards, rate_card_items) or camelCase (customers, quotes, users)
 * - Application: camelCase (TypeScript)
 *
 * Usage:
 * - For new tables: Always use snake_case in database
 * - For existing tables: Use the current naming convention
 * - In application code: Always use camelCase
 */
export declare const columnMapping: {
    readonly rateCards: {
        readonly organizationId: "organization_id";
        readonly effectiveFrom: "effective_from";
        readonly effectiveUntil: "effective_until";
        readonly isDefault: "is_default";
        readonly isActive: "is_active";
        readonly createdAt: "created_at";
        readonly updatedAt: "updated_at";
    };
    readonly rateCardItems: {
        readonly rateCardId: "rate_card_id";
        readonly serviceCategoryId: "service_category_id";
        readonly roleId: "role_id";
        readonly itemCode: "item_code";
        readonly baseRate: "base_rate";
        readonly taxClass: "tax_class";
        readonly tieringModelId: "tiering_model_id";
        readonly effectiveFrom: "effective_from";
        readonly effectiveUntil: "effective_until";
        readonly isActive: "is_active";
        readonly createdAt: "created_at";
        readonly updatedAt: "updated_at";
    };
    readonly customers: {
        readonly organizationId: "organizationId";
        readonly customerNumber: "customerNumber";
        readonly companyName: "companyName";
        readonly legalName: "legalName";
        readonly customerType: "customerType";
        readonly createdAt: "createdAt";
        readonly updatedAt: "updatedAt";
        readonly deletedAt: "deletedAt";
        readonly contactExtras: "contact_extras";
    };
    readonly quotes: {
        readonly organizationId: "organizationId";
        readonly quoteNumber: "quoteNumber";
        readonly customerId: "customerId";
        readonly projectId: "projectId";
        readonly validFrom: "validFrom";
        readonly validUntil: "validUntil";
        readonly exchangeRate: "exchangeRate";
        readonly taxRate: "taxRate";
        readonly taxAmount: "taxAmount";
        readonly discountType: "discountType";
        readonly discountValue: "discountValue";
        readonly discountAmount: "discountAmount";
        readonly totalAmount: "totalAmount";
        readonly termsConditions: "termsConditions";
        readonly internalNotes: "internalNotes";
        readonly createdBy: "createdBy";
        readonly approvedBy: "approvedBy";
        readonly approvedAt: "approvedAt";
        readonly sentAt: "sentAt";
        readonly acceptedAt: "acceptedAt";
        readonly expiresAt: "expiresAt";
        readonly createdAt: "createdAt";
        readonly updatedAt: "updatedAt";
        readonly deletedAt: "deletedAt";
    };
    readonly quoteLineItems: {
        readonly quoteId: "quoteId";
        readonly lineNumber: "lineNumber";
        readonly unitPrice: "unitPrice";
        readonly unitCost: "unitCost";
        readonly taxInclusive: "taxInclusive";
        readonly taxRate: "taxRate";
        readonly taxAmount: "taxAmount";
        readonly discountType: "discountType";
        readonly discountValue: "discountValue";
        readonly discountAmount: "discountAmount";
        readonly totalAmount: "totalAmount";
        readonly serviceCategoryId: "serviceCategoryId";
        readonly rateCardId: "rateCardId";
        readonly createdAt: "createdAt";
        readonly updatedAt: "updatedAt";
    };
    readonly users: {
        readonly organizationId: "organizationId";
        readonly firstName: "firstName";
        readonly lastName: "lastName";
        readonly displayName: "displayName";
        readonly avatarUrl: "avatarUrl";
        readonly emailVerified: "emailVerified";
        readonly emailVerifiedAt: "emailVerifiedAt";
        readonly lastLoginAt: "lastLoginAt";
        readonly loginCount: "loginCount";
        readonly failedLoginAttempts: "failedLoginAttempts";
        readonly lockedUntil: "lockedUntil";
        readonly passwordHash: "passwordHash";
        readonly mfaEnabled: "mfaEnabled";
        readonly mfaSecret: "mfaSecret";
        readonly createdAt: "createdAt";
        readonly updatedAt: "updatedAt";
        readonly deletedAt: "deletedAt";
        readonly dateFormat: "date_format";
        readonly timeFormat: "time_format";
    };
    readonly serviceCategories: {
        readonly organizationId: "organizationId";
        readonly isActive: "isActive";
        readonly createdAt: "createdAt";
        readonly updatedAt: "updatedAt";
        readonly isVisible: "is_visible";
    };
};
/**
 * Get the database column name for a given table and field
 */
export declare function getDbColumnName(table: keyof typeof columnMapping, field: string): string;
/**
 * Get the application field name for a given table and database column
 */
export declare function getAppFieldName(table: keyof typeof columnMapping, column: string): string;
/**
 * Check if a table uses snake_case naming in the database
 */
export declare function isSnakeCaseTable(table: keyof typeof columnMapping): boolean;
/**
 * Check if a table uses camelCase naming in the database
 */
export declare function isCamelCaseTable(table: keyof typeof columnMapping): boolean;
//# sourceMappingURL=column-mapping.d.ts.map