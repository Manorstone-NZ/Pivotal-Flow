import { describe, it, expect } from 'vitest';

import { 
  organizations, 
  users, 
  customers, 
  projects, 
  quotes, 
  quoteLineItems,
  rateCards,
  serviceCategories,
  roles,
  permissions,
  userRoles,
  orgSecurityPolicies,
  orgNotificationPrefs,
  orgFeatureFlags,
  orgSettings,
  auditLogs,
  currencies
} from '../lib/schema.js';

describe('Database Schema Naming Convention', () => {
  describe('snake_case convention validation', () => {
    // Helper function to check if a string follows snake_case convention
    const isSnakeCase = (str: string): boolean => {
      return /^[a-z][a-z0-9_]*$/.test(str) && !/[A-Z]/.test(str);
    };

    // Helper function to extract column names from a table schema
    const getColumnNames = (table: any): string[] => {
      const columns: string[] = [];
      for (const [, value] of Object.entries(table)) {
        if (typeof value === 'object' && value !== null && 'name' in value) {
          columns.push(value.name as string);
        }
      }
      return columns;
    };

    // Helper function to check all columns in a table
    const checkTableColumns = (tableName: string, table: any) => {
      const columnNames = getColumnNames(table);
      
      it(`should use snake_case for all columns in ${tableName}`, () => {
        const nonSnakeCaseColumns = columnNames.filter(col => !isSnakeCase(col));
        
        expect(nonSnakeCaseColumns).toEqual(
          []
        );
        if (nonSnakeCaseColumns.length > 0) {
          throw new Error(`Found columns not following snake_case convention: ${nonSnakeCaseColumns.join(', ')}`);
        }
      });

      it(`should have consistent naming pattern in ${tableName}`, () => {
        // Check for common patterns that should be snake_case
        const patterns = [
          /created_at/,
          /updated_at/,
          /deleted_at/,
          /organization_id/,
          /customer_id/,
          /user_id/,
          /project_id/,
          /quote_id/,
          /rate_card_id/,
          /service_category_id/,
          /role_id/,
          /permission_id/
        ];

        patterns.forEach(pattern => {
          const matchingColumns = columnNames.filter(col => pattern.test(col));
          if (matchingColumns.length > 0) {
            matchingColumns.forEach(col => {
              expect(isSnakeCase(col)).toBe(true);
              if (!isSnakeCase(col)) {
                throw new Error(`Column ${col} in ${tableName} should follow snake_case convention`);
              }
            });
          }
        });
      });
    };

    // Test each table
    describe('Core Tables', () => {
      checkTableColumns('organizations', organizations);
      checkTableColumns('users', users);
      checkTableColumns('customers', customers);
      checkTableColumns('projects', projects);
      checkTableColumns('quotes', quotes);
      checkTableColumns('quote_line_items', quoteLineItems);
      checkTableColumns('rate_cards', rateCards);
      checkTableColumns('service_categories', serviceCategories);
    });

    describe('Authorization Tables', () => {
      checkTableColumns('roles', roles);
      checkTableColumns('permissions', permissions);
      checkTableColumns('user_roles', userRoles);
    });

    describe('Organization Settings Tables', () => {
      checkTableColumns('org_security_policies', orgSecurityPolicies);
      checkTableColumns('org_notification_prefs', orgNotificationPrefs);
      checkTableColumns('org_feature_flags', orgFeatureFlags);
      checkTableColumns('org_settings', orgSettings);
    });

    describe('Audit and Reference Tables', () => {
      checkTableColumns('audit_logs', auditLogs);
      checkTableColumns('currencies', currencies);
    });
  });

  describe('Specific naming convention rules', () => {
    it('should use snake_case for all timestamp fields', () => {
      const timestampPatterns = ['created_at', 'updated_at', 'deleted_at', 'approved_at', 'sent_at', 'accepted_at', 'expires_at', 'email_verified_at', 'last_login_at', 'locked_until'];
      
      const allTables = [
        organizations, users, customers, projects, quotes, quoteLineItems,
        rateCards, serviceCategories, roles, permissions, userRoles,
        orgSecurityPolicies, orgNotificationPrefs, orgFeatureFlags, orgSettings,
        auditLogs, currencies
      ];

      allTables.forEach(table => {
        const columnNames = Object.values(table).map((col: any) => col?.name).filter(Boolean);
        timestampPatterns.forEach(pattern => {
          const matchingColumns = columnNames.filter((col: string) => col.includes(pattern));
          matchingColumns.forEach(col => {
            expect(col).toMatch(/^[a-z][a-z0-9_]*$/);
            if (!col.match(/^[a-z][a-z0-9_]*$/)) {
              throw new Error(`Timestamp column ${col} should be snake_case`);
            }
          });
        });
      });
    });

    it('should use snake_case for all foreign key fields', () => {
      const foreignKeyPatterns = [
        'organization_id', 'customer_id', 'user_id', 'project_id', 
        'quote_id', 'rate_card_id', 'service_category_id', 'role_id', 
        'permission_id', 'created_by', 'approved_by', 'owner_id'
      ];

      const allTables = [
        organizations, users, customers, projects, quotes, quoteLineItems,
        rateCards, serviceCategories, roles, permissions, userRoles,
        orgSecurityPolicies, orgNotificationPrefs, orgFeatureFlags, orgSettings,
        auditLogs, currencies
      ];

      allTables.forEach(table => {
        const columnNames = Object.values(table).map((col: any) => col?.name).filter(Boolean);
        foreignKeyPatterns.forEach(pattern => {
          const matchingColumns = columnNames.filter((col: string) => col.includes(pattern));
          matchingColumns.forEach(col => {
            expect(col).toMatch(/^[a-z][a-z0-9_]*$/);
            if (!col.match(/^[a-z][a-z0-9_]*$/)) {
              throw new Error(`Foreign key column ${col} should be snake_case`);
            }
          });
        });
      });
    });

    it('should use snake_case for all boolean fields', () => {
      const booleanPatterns = ['is_active', 'is_visible', 'email_verified', 'mfa_enabled', 'tax_exempt'];
      
      const allTables = [
        organizations, users, customers, projects, quotes, quoteLineItems,
        rateCards, serviceCategories, roles, permissions, userRoles,
        orgSecurityPolicies, orgNotificationPrefs, orgFeatureFlags, orgSettings,
        auditLogs, currencies
      ];

      allTables.forEach(table => {
        const columnNames = Object.values(table).map((col: any) => col?.name).filter(Boolean);
        booleanPatterns.forEach(pattern => {
          const matchingColumns = columnNames.filter((col: string) => col.includes(pattern));
          matchingColumns.forEach(col => {
            expect(col).toMatch(/^[a-z][a-z0-9_]*$/);
            if (!col.match(/^[a-z][a-z0-9_]*$/)) {
              throw new Error(`Boolean column ${col} should be snake_case`);
            }
          });
        });
      });
    });

    it('should use snake_case for all decimal/numeric fields', () => {
      const numericPatterns = ['tax_rate', 'exchange_rate', 'subtotal', 'tax_amount', 'discount_value', 'discount_amount', 'total_amount', 'credit_limit', 'payment_terms'];
      
      const allTables = [
        organizations, users, customers, projects, quotes, quoteLineItems,
        rateCards, serviceCategories, roles, permissions, userRoles,
        orgSecurityPolicies, orgNotificationPrefs, orgFeatureFlags, orgSettings,
        auditLogs, currencies
      ];

      allTables.forEach(table => {
        const columnNames = Object.values(table).map((col: any) => col?.name).filter(Boolean);
        numericPatterns.forEach(pattern => {
          const matchingColumns = columnNames.filter((col: string) => col.includes(pattern));
          matchingColumns.forEach(col => {
            expect(col).toMatch(/^[a-z][a-z0-9_]*$/);
            if (!col.match(/^[a-z][a-z0-9_]*$/)) {
              throw new Error(`Numeric column ${col} should be snake_case`);
            }
          });
        });
      });
    });
  });

  describe('Table naming convention', () => {
    it('should use snake_case for all table names', () => {
      const tableNames = [
        'organizations', 'users', 'customers', 'projects', 'quotes', 
        'quote_line_items', 'rate_cards', 'service_categories', 'roles', 
        'permissions', 'user_roles', 'org_security_policies', 
        'org_notification_prefs', 'org_feature_flags', 'org_settings',
        'audit_logs', 'currencies'
      ];

      tableNames.forEach(tableName => {
        expect(tableName).toMatch(/^[a-z][a-z0-9_]*$/);
        if (!tableName.match(/^[a-z][a-z0-9_]*$/)) {
          throw new Error(`Table name ${tableName} should be snake_case`);
        }
      });
    });
  });
});
