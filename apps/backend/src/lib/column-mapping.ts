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

export const columnMapping = {
  // Rate Cards (snake_case in database)
  rateCards: {
    organizationId: 'organization_id',
    effectiveFrom: 'effective_from',
    effectiveUntil: 'effective_until',
    isDefault: 'is_default',
    isActive: 'is_active',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
  rateCardItems: {
    rateCardId: 'rate_card_id',
    serviceCategoryId: 'service_category_id',
    roleId: 'role_id',
    itemCode: 'item_code',
    baseRate: 'base_rate',
    taxClass: 'tax_class',
    tieringModelId: 'tiering_model_id',
    effectiveFrom: 'effective_from',
    effectiveUntil: 'effective_until',
    isActive: 'is_active',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
  
  // Customers (camelCase in database)
  customers: {
    organizationId: 'organizationId',
    customerNumber: 'customerNumber',
    companyName: 'companyName',
    legalName: 'legalName',
    customerType: 'customerType',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    deletedAt: 'deletedAt',
    contactExtras: 'contact_extras', // Mixed: camelCase field, snake_case column
  },
  
  // Quotes (camelCase in database)
  quotes: {
    organizationId: 'organizationId',
    quoteNumber: 'quoteNumber',
    customerId: 'customerId',
    projectId: 'projectId',
    validFrom: 'validFrom',
    validUntil: 'validUntil',
    exchangeRate: 'exchangeRate',
    taxRate: 'taxRate',
    taxAmount: 'taxAmount',
    discountType: 'discountType',
    discountValue: 'discountValue',
    discountAmount: 'discountAmount',
    totalAmount: 'totalAmount',
    termsConditions: 'termsConditions',
    internalNotes: 'internalNotes',
    createdBy: 'createdBy',
    approvedBy: 'approvedBy',
    approvedAt: 'approvedAt',
    sentAt: 'sentAt',
    acceptedAt: 'acceptedAt',
    expiresAt: 'expiresAt',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    deletedAt: 'deletedAt',
  },
  
  // Quote Line Items (camelCase in database)
  quoteLineItems: {
    quoteId: 'quoteId',
    lineNumber: 'lineNumber',
    unitPrice: 'unitPrice',
    unitCost: 'unitCost',
    taxInclusive: 'taxInclusive',
    taxRate: 'taxRate',
    taxAmount: 'taxAmount',
    discountType: 'discountType',
    discountValue: 'discountValue',
    discountAmount: 'discountAmount',
    totalAmount: 'totalAmount',
    serviceCategoryId: 'serviceCategoryId',
    rateCardId: 'rateCardId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  },
  
  // Users (camelCase in database, with some snake_case)
  users: {
    organizationId: 'organizationId',
    firstName: 'firstName',
    lastName: 'lastName',
    displayName: 'displayName',
    avatarUrl: 'avatarUrl',
    emailVerified: 'emailVerified',
    emailVerifiedAt: 'emailVerifiedAt',
    lastLoginAt: 'lastLoginAt',
    loginCount: 'loginCount',
    failedLoginAttempts: 'failedLoginAttempts',
    lockedUntil: 'lockedUntil',
    passwordHash: 'passwordHash',
    mfaEnabled: 'mfaEnabled',
    mfaSecret: 'mfaSecret',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    deletedAt: 'deletedAt',
    dateFormat: 'date_format', // Mixed: camelCase field, snake_case column
    timeFormat: 'time_format', // Mixed: camelCase field, snake_case column
  },
  
  // Service Categories (camelCase in database, with some snake_case)
  serviceCategories: {
    organizationId: 'organizationId',
    isActive: 'isActive',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    isVisible: 'is_visible', // Mixed: camelCase field, snake_case column
  },
} as const;

/**
 * Get the database column name for a given table and field
 */
export function getDbColumnName(table: keyof typeof columnMapping, field: string): string {
  const tableMapping = columnMapping[table];
  if (!tableMapping) {
    throw new Error(`Unknown table: ${table}`);
  }
  
  const columnName = tableMapping[field as keyof typeof tableMapping];
  if (!columnName) {
    // If no mapping found, assume the field name is the column name
    return field;
  }
  
  return columnName;
}

/**
 * Get the application field name for a given table and database column
 */
export function getAppFieldName(table: keyof typeof columnMapping, column: string): string {
  const tableMapping = columnMapping[table];
  if (!tableMapping) {
    throw new Error(`Unknown table: ${table}`);
  }
  
  // Find the field name that maps to this column
  for (const [fieldName, columnName] of Object.entries(tableMapping)) {
    if (columnName === column) {
      return fieldName;
    }
  }
  
  // If no mapping found, assume the column name is the field name
  return column;
}

/**
 * Check if a table uses snake_case naming in the database
 */
export function isSnakeCaseTable(table: keyof typeof columnMapping): boolean {
  const snakeCaseTables = ['rateCards', 'rateCardItems'];
  return snakeCaseTables.includes(table);
}

/**
 * Check if a table uses camelCase naming in the database
 */
export function isCamelCaseTable(table: keyof typeof columnMapping): boolean {
  const camelCaseTables = ['customers', 'quotes', 'quoteLineItems', 'users', 'serviceCategories'];
  return camelCaseTables.includes(table);
}
