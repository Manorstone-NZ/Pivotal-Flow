import crypto from 'crypto';

import { eq, and, desc, sql } from 'drizzle-orm';

import { currencies, fxRates } from '../schema.js';
import { required } from '../utils/strict.js';

import { BaseRepository } from './repo.base.js';

/**
 * Currency Repository
 * 
 * Handles currency lookup and FX rate resolution with fallbacks
 * - Currency validation and lookup
 * - FX rate resolution by date with fallback strategies
 * - Currency decimal place management for rounding
 */
export class CurrencyRepository extends BaseRepository {
  /**
   * Get currency by ISO code
   */
  async getCurrency(code: string): Promise<any | null> {
    try {
      const result = await this.db
        .select()
        .from(currencies)
        .where(and(
          eq(currencies.code, code),
          eq(currencies.isActive, true)
        ))
        .limit(1);

      return result[0] || null;
    } catch (error) {
      console.error('Failed to get currency:', { code, error });
      throw error;
    }
  }

  /**
   * Get all active currencies
   */
  async getActiveCurrencies(): Promise<any[]> {
    try {
      return await this.db
        .select()
        .from(currencies)
        .where(eq(currencies.isActive, true))
        .orderBy(currencies.code);
    } catch (error) {
      console.error('Failed to get active currencies:', { error });
      throw error;
    }
  }

  /**
   * Get FX rate for currency pair as of specific date
   * Falls back to most recent rate if exact date not found
   */
  async getFxRate(
    baseCurrency: string, 
    quoteCurrency: string, 
    asOfDate: Date = new Date()
  ): Promise<any | null> {
    try {
      const dateStr = required(asOfDate, 'asOfDate is required').toISOString().split('T')[0];

      // First try to get exact date match
      let result = await this.db
        .select()
        .from(fxRates)
        .where(and(
          eq(fxRates.baseCurrency, baseCurrency),
          eq(fxRates.quoteCurrency, quoteCurrency),
          eq(fxRates.effectiveFrom, dateStr as string)
        ))
        .limit(1);

      if (result[0]) {
        return result[0];
      }

      // Fallback to most recent rate before the date
      result = await this.db
        .select()
        .from(fxRates)
        .where(and(
          eq(fxRates.baseCurrency, baseCurrency),
          eq(fxRates.quoteCurrency, quoteCurrency),
          sql`${fxRates.effectiveFrom} <= ${dateStr}`
        ))
        .orderBy(desc(fxRates.effectiveFrom))
        .limit(1);

      return result[0] || null;
    } catch (error) {
      console.error('Failed to get FX rate:', { 
        baseCurrency, 
        quoteCurrency, 
        asOfDate, 
        error 
      });
      throw error;
    }
  }

  /**
   * Get FX rate with fallback to inverse rate if direct rate not found
   */
  async getFxRateWithFallback(
    baseCurrency: string, 
    quoteCurrency: string, 
    asOfDate: Date = new Date()
  ): Promise<any | null> {
    try {
      // Try direct rate first
      const rate = await this.getFxRate(baseCurrency, quoteCurrency, asOfDate);
      
      if (rate) {
        return rate;
      }

      // Try inverse rate and calculate reciprocal
      const inverseRate = await this.getFxRate(quoteCurrency, baseCurrency, asOfDate);
      
      if (inverseRate) {
        return {
          ...inverseRate,
          baseCurrency: baseCurrency,
          quoteCurrency: quoteCurrency,
          rate: 1 / Number(inverseRate.rate)
        };
      }

      return null;
    } catch (error) {
      console.error('Failed to get FX rate with fallback:', { 
        baseCurrency, 
        quoteCurrency, 
        asOfDate, 
        error 
      });
      throw error;
    }
  }

  /**
   * Create or update FX rate
   */
  async upsertFxRate(data: {
    baseCurrency: string;
    quoteCurrency: string;
    rate: number;
    effectiveFrom: Date;
    source: string;
    verified?: boolean;
  }): Promise<any> {
    try {
      const dateStr = required(data.effectiveFrom, 'effectiveFrom is required').toISOString().split('T')[0];
      
      // Check if rate already exists for this date
      const existing = await this.db
        .select()
        .from(fxRates)
        .where(and(
          eq(fxRates.baseCurrency, data.baseCurrency),
          eq(fxRates.quoteCurrency, data.quoteCurrency),
          eq(fxRates.effectiveFrom, dateStr as string)
        ))
        .limit(1);

      if (existing[0]) {
        // Update existing rate
        const result = await this.db
          .update(fxRates)
          .set({
            rate: data.rate.toString(),
            source: data.source,
            verified: data.verified ?? false,
            updatedAt: new Date()
          })
          .where(eq(fxRates.id, existing[0].id))
          .returning();

        return result[0];
      } else {
        // Insert new rate
        const result = await this.db
          .insert(fxRates)
          .values({
            id: crypto.randomUUID(),
            baseCurrency: data.baseCurrency,
            quoteCurrency: data.quoteCurrency,
            rate: data.rate.toString(),
            effectiveFrom: dateStr as string,
            source: data.source,
            verified: data.verified ?? false
          })
          .returning();

        return result[0];
      }
    } catch (error) {
      console.error('Failed to upsert FX rate:', { data, error });
      throw error;
    }
  }

  /**
   * Get currency decimal places for rounding
   */
  async getCurrencyDecimals(currencyCode: string): Promise<number> {
    try {
      const currency = await this.getCurrency(currencyCode);
      return currency?.decimals ?? 2; // Default to 2 decimal places
    } catch (error) {
      console.error('Failed to get currency decimals:', { currencyCode, error });
      return 2; // Safe fallback
    }
  }

  /**
   * Validate currency code exists and is active
   */
  async validateCurrency(currencyCode: string): Promise<boolean> {
    try {
      const currency = await this.getCurrency(currencyCode);
      return !!currency;
    } catch (error) {
      console.error('Failed to validate currency:', { currencyCode, error });
      return false;
    }
  }
}
