import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { BaseRepository } from '../../lib/repo.base.js';
export interface CurrencyData {
    code: string;
    name: string;
    symbol?: string;
    isActive?: boolean;
    exchangeRate?: number;
}
export interface CurrencyFilters {
    page?: number;
    limit?: number;
    search?: string;
    activeOnly?: boolean;
}
export interface CurrencyResponse {
    currencies: any[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
/**
 * Currency Service
 *
 * Handles ISO 4217 currency code management including:
 * - Currency validation
 * - Active currency listing
 * - Currency metadata (names, symbols)
 * - Audit logging for currency operations
 */
export declare class CurrencyService extends BaseRepository {
    options: {
        organizationId: string;
        userId: string;
    };
    constructor(db: PostgresJsDatabase<typeof import('../../lib/schema.js')>, options: {
        organizationId: string;
        userId: string;
    });
    /**
     * Get all active currencies
     */
    getActiveCurrencies(): Promise<any[]>;
    /**
     * Get all currencies (including inactive)
     */
    getAllCurrencies(): Promise<any[]>;
    /**
     * Get currencies with pagination and filtering
     */
    getCurrencies(filters?: CurrencyFilters): Promise<CurrencyResponse>;
    /**
     * Get currency by code
     */
    getCurrency(code: string): Promise<any | null>;
    /**
     * Create a new currency
     */
    createCurrency(data: CurrencyData): Promise<any>;
    /**
     * Update an existing currency
     */
    updateCurrency(code: string, data: Partial<CurrencyData>): Promise<any>;
    /**
     * Get currency by code
     */
    getCurrencyByCode(code: string): Promise<any | null>;
    /**
     * Validate if a currency code is valid and active
     */
    isValidCurrency(code: string): Promise<boolean>;
    /**
     * Get currency symbol by code
     */
    getCurrencySymbol(code: string): Promise<string | null>;
    /**
     * Get currency name by code
     */
    getCurrencyName(code: string): Promise<string | null>;
    /**
     * Get popular currencies (commonly used ones)
     */
    getPopularCurrencies(): Promise<any[]>;
    /**
     * Get currencies by region
     */
    getCurrenciesByRegion(region: string): Promise<any[]>;
    /**
     * Format currency amount with symbol
     */
    formatCurrency(amount: number, currencyCode: string, locale?: string): Promise<string>;
    /**
     * Get currency exchange rate info (placeholder for future implementation)
     */
    getExchangeRateInfo(fromCurrency: string, toCurrency: string): Promise<any>;
    /**
     * Set a currency as the default currency
     */
    setDefaultCurrency(currencyCode: string): Promise<any>;
    /**
     * Get the default currency
     */
    getDefaultCurrency(): Promise<any | null>;
}
//# sourceMappingURL=service.d.ts.map