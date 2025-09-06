import { BaseRepository } from './repo.base.js';
/**
 * Currency Repository
 *
 * Handles currency lookup and FX rate resolution with fallbacks
 * - Currency validation and lookup
 * - FX rate resolution by date with fallback strategies
 * - Currency decimal place management for rounding
 */
export declare class CurrencyRepository extends BaseRepository {
    /**
     * Get currency by ISO code
     */
    getCurrency(code: string): Promise<any | null>;
    /**
     * Get all active currencies
     */
    getActiveCurrencies(): Promise<any[]>;
    /**
     * Get FX rate for currency pair as of specific date
     * Falls back to most recent rate if exact date not found
     */
    getFxRate(baseCurrency: string, quoteCurrency: string, asOfDate?: Date): Promise<any | null>;
    /**
     * Get FX rate with fallback to inverse rate if direct rate not found
     */
    getFxRateWithFallback(baseCurrency: string, quoteCurrency: string, asOfDate?: Date): Promise<any | null>;
    /**
     * Create or update FX rate
     */
    upsertFxRate(data: {
        baseCurrency: string;
        quoteCurrency: string;
        rate: number;
        effectiveFrom: Date;
        source: string;
        verified?: boolean;
    }): Promise<any>;
    /**
     * Get currency decimal places for rounding
     */
    getCurrencyDecimals(currencyCode: string): Promise<number>;
    /**
     * Validate currency code exists and is active
     */
    validateCurrency(currencyCode: string): Promise<boolean>;
}
//# sourceMappingURL=repo.currencies.d.ts.map