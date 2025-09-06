import { eq, and, like, or, asc } from 'drizzle-orm';
import { BaseRepository } from '../../lib/repo.base.js';
import { currencies } from '../../lib/schema.js';
/**
 * Currency Service
 *
 * Handles ISO 4217 currency code management including:
 * - Currency validation
 * - Active currency listing
 * - Currency metadata (names, symbols)
 * - Audit logging for currency operations
 */
export class CurrencyService extends BaseRepository {
    options;
    constructor(db, options) {
        super(db, options);
        this.options = options;
    }
    /**
     * Get all active currencies
     */
    async getActiveCurrencies() {
        return this.db
            .select()
            .from(currencies)
            .where(eq(currencies.isActive, true))
            .orderBy(currencies.code);
    }
    /**
     * Get all currencies (including inactive)
     */
    async getAllCurrencies() {
        return this.db
            .select()
            .from(currencies)
            .orderBy(currencies.code);
    }
    /**
     * Get currencies with pagination and filtering
     */
    async getCurrencies(filters = {}) {
        const { page = 1, limit = 10, search, activeOnly } = filters;
        const offset = (page - 1) * limit;
        let whereConditions = undefined;
        if (activeOnly) {
            whereConditions = eq(currencies.isActive, true);
        }
        if (search) {
            const searchCondition = or(like(currencies.code, `%${search}%`), like(currencies.name, `%${search}%`));
            whereConditions = whereConditions ? and(whereConditions, searchCondition) : searchCondition;
        }
        const [currenciesData, totalResult] = await Promise.all([
            this.db
                .select()
                .from(currencies)
                .where(whereConditions)
                .orderBy(asc(currencies.code))
                .limit(limit)
                .offset(offset),
            this.db
                .select({ count: currencies.code })
                .from(currencies)
                .where(whereConditions)
        ]);
        const total = totalResult.length;
        const totalPages = Math.ceil(total / limit);
        return {
            currencies: currenciesData,
            total,
            page,
            limit,
            totalPages
        };
    }
    /**
     * Get currency by code
     */
    async getCurrency(code) {
        const result = await this.db
            .select()
            .from(currencies)
            .where(eq(currencies.code, code))
            .limit(1);
        return result[0] || null;
    }
    /**
     * Create a new currency
     */
    async createCurrency(data) {
        // Validate currency code format (3 letters)
        if (!/^[A-Z]{3}$/.test(data.code)) {
            throw new Error('Currency code must be exactly 3 uppercase letters');
        }
        // Check if currency already exists
        const existing = await this.getCurrencyByCode(data.code);
        if (existing) {
            throw new Error('Currency with this code already exists');
        }
        const now = new Date();
        const currencyData = {
            code: data.code,
            name: data.name,
            symbol: data.symbol || data.code,
            isActive: data.isActive ?? true,
            isDefault: false,
            createdAt: now,
            updatedAt: now
        };
        const result = await this.db
            .insert(currencies)
            .values(currencyData)
            .returning();
        return result[0];
    }
    /**
     * Update an existing currency
     */
    async updateCurrency(code, data) {
        // Check if currency exists
        const existing = await this.getCurrency(code);
        if (!existing) {
            throw new Error('Currency not found');
        }
        const updateData = {
            ...data,
            updatedAt: new Date()
        };
        const result = await this.db
            .update(currencies)
            .set(updateData)
            .where(eq(currencies.code, code))
            .returning();
        return result[0];
    }
    /**
     * Get currency by code
     */
    async getCurrencyByCode(code) {
        const result = await this.db
            .select()
            .from(currencies)
            .where(eq(currencies.code, code))
            .limit(1);
        return result[0] || null;
    }
    /**
     * Validate if a currency code is valid and active
     */
    async isValidCurrency(code) {
        const currency = await this.getCurrencyByCode(code);
        return currency?.isActive === true;
    }
    /**
     * Get currency symbol by code
     */
    async getCurrencySymbol(code) {
        const currency = await this.getCurrencyByCode(code);
        return currency?.symbol || null;
    }
    /**
     * Get currency name by code
     */
    async getCurrencyName(code) {
        const currency = await this.getCurrencyByCode(code);
        return currency?.name || null;
    }
    /**
     * Get popular currencies (commonly used ones)
     */
    async getPopularCurrencies() {
        const popularCodes = ['NZD', 'USD', 'EUR', 'GBP', 'AUD', 'CAD', 'CHF', 'JPY'];
        const allCurrencies = await this.db
            .select()
            .from(currencies)
            .where(eq(currencies.isActive, true))
            .orderBy(currencies.code);
        return allCurrencies.filter(currency => popularCodes.includes(currency.code));
    }
    /**
     * Get currencies by region
     */
    async getCurrenciesByRegion(region) {
        const regionCurrencies = {
            'europe': ['EUR', 'GBP', 'CHF', 'SEK', 'NOK', 'DKK', 'PLN', 'CZK', 'HUF'],
            'asia': ['JPY', 'CNY', 'SGD', 'HKD', 'KRW', 'THB', 'MYR', 'IDR', 'PHP', 'VND'],
            'americas': ['USD', 'CAD', 'MXN', 'BRL', 'ARS', 'CLP', 'COP', 'PEN', 'UYU'],
            'africa': ['ZAR', 'EGP', 'NGN', 'KES', 'GHS', 'UGX', 'TZS', 'ETB', 'MAD', 'TND'],
            'middle-east': ['SAR', 'AED', 'QAR', 'KWD', 'BHD', 'OMR', 'JOD', 'LBP', 'ILS'],
            'oceania': ['NZD', 'AUD']
        };
        const codes = regionCurrencies[region.toLowerCase()] || [];
        if (codes.length === 0) {
            return [];
        }
        const allCurrencies = await this.db
            .select()
            .from(currencies)
            .where(eq(currencies.isActive, true))
            .orderBy(currencies.code);
        return allCurrencies.filter(currency => codes.includes(currency.code));
    }
    /**
     * Format currency amount with symbol
     */
    async formatCurrency(amount, currencyCode, locale = 'en-NZ') {
        const currency = await this.getCurrencyByCode(currencyCode);
        if (!currency?.isActive) {
            return `${amount} ${currencyCode}`;
        }
        try {
            return new Intl.NumberFormat(locale, {
                style: 'currency',
                currency: currencyCode,
                minimumFractionDigits: 2,
                maximumFractionDigits: 4
            }).format(amount);
        }
        catch (error) {
            // Fallback to simple formatting
            const symbol = currency.symbol || currencyCode;
            return `${symbol}${amount.toFixed(2)}`;
        }
    }
    /**
     * Get currency exchange rate info (placeholder for future implementation)
     */
    async getExchangeRateInfo(fromCurrency, toCurrency) {
        // This would integrate with an exchange rate API in the future
        // For now, return basic info
        const from = await this.getCurrencyByCode(fromCurrency);
        const to = await this.getCurrencyByCode(toCurrency);
        if (!from || !to) {
            throw new Error('Invalid currency code');
        }
        return {
            from: { code: from.code, name: from.name, symbol: from.symbol },
            to: { code: to.code, name: to.name, symbol: to.symbol },
            note: 'Exchange rate API integration not yet implemented'
        };
    }
    /**
     * Set a currency as the default currency
     */
    async setDefaultCurrency(currencyCode) {
        // First, unset any existing default currency
        await this.db
            .update(currencies)
            .set({ isDefault: false })
            .where(eq(currencies.isDefault, true));
        // Set the new default currency
        const result = await this.db
            .update(currencies)
            .set({ isDefault: true })
            .where(eq(currencies.code, currencyCode))
            .returning();
        if (result.length === 0) {
            throw new Error('Currency not found');
        }
        return result[0];
    }
    /**
     * Get the default currency
     */
    async getDefaultCurrency() {
        const result = await this.db
            .select()
            .from(currencies)
            .where(eq(currencies.isDefault, true))
            .limit(1);
        return result[0] || null;
    }
}
//# sourceMappingURL=service.js.map