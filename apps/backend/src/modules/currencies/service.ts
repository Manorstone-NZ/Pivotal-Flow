import { eq } from 'drizzle-orm';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { currencies } from '../../lib/schema.js';
import { BaseRepository } from '../../lib/repo.base.js';
// import { AuditLogger } from '../../lib/audit.logger.js';

export interface CurrencyData {
  code: string;
  name: string;
  symbol?: string;
  isActive?: boolean;
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
export class CurrencyService extends BaseRepository {
  constructor(
    db: PostgresJsDatabase<typeof import('../../lib/schema.js')>,
    public override options: { organizationId: string; userId: string }
  ) {
    super(db, options);
  }

  /**
   * Get all active currencies
   */
  async getActiveCurrencies(): Promise<any[]> {
    return this.db
      .select()
      .from(currencies)
      .where(eq(currencies.isActive, true))
      .orderBy(currencies.code);
  }

  /**
   * Get all currencies (including inactive)
   */
  async getAllCurrencies(): Promise<any[]> {
    return this.db
      .select()
      .from(currencies)
      .orderBy(currencies.code);
  }

  /**
   * Get currency by code
   */
  async getCurrencyByCode(code: string): Promise<any | null> {
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
  async isValidCurrency(code: string): Promise<boolean> {
    const currency = await this.getCurrencyByCode(code);
    return currency?.isActive === true;
  }

  /**
   * Get currency symbol by code
   */
  async getCurrencySymbol(code: string): Promise<string | null> {
    const currency = await this.getCurrencyByCode(code);
    return currency?.symbol || null;
  }

  /**
   * Get currency name by code
   */
  async getCurrencyName(code: string): Promise<string | null> {
    const currency = await this.getCurrencyByCode(code);
    return currency?.name || null;
  }

  /**
   * Get popular currencies (commonly used ones)
   */
  async getPopularCurrencies(): Promise<any[]> {
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
  async getCurrenciesByRegion(region: string): Promise<any[]> {
    const regionCurrencies: Record<string, string[]> = {
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
  async formatCurrency(amount: number, currencyCode: string, locale: string = 'en-NZ'): Promise<string> {
    const currency = await this.getCurrencyByCode(currencyCode);
    if (!currency || !currency.isActive) {
      return `${amount} ${currencyCode}`;
    }

    try {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: 2,
        maximumFractionDigits: 4
      }).format(amount);
    } catch (error) {
      // Fallback to simple formatting
      const symbol = currency.symbol || currencyCode;
      return `${symbol}${amount.toFixed(2)}`;
    }
  }

  /**
   * Get currency exchange rate info (placeholder for future implementation)
   */
  async getExchangeRateInfo(fromCurrency: string, toCurrency: string): Promise<any> {
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
}
