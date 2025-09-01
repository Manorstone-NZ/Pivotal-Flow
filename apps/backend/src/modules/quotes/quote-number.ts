import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { quotes } from '../../lib/schema.js';
import { eq, and, isNull } from 'drizzle-orm';
import { withTx } from '../../lib/withTx.js';

/**
 * Quote Number Generator Service
 * 
 * Generates deterministic, sequential quote numbers per organization
 * Format: {PREFIX}-{YEAR}-{SEQUENCE} (e.g., Q-2024-0001)
 * 
 * Features:
 * - Deterministic server-side generation
 * - Zero-padded sequential numbers
 * - Organization-specific prefixes
 * - Transaction-safe sequence generation
 * - No gaps in sequence within a single transaction
 */
export class QuoteNumberGenerator {
  constructor(private db: PostgresJsDatabase<typeof import('../../lib/schema.js')>) {}

  /**
   * Generate the next quote number for an organization
   * Uses transaction retry logic to handle concurrency
   */
  async generateQuoteNumber(organizationId: string): Promise<string> {
    return withTx(this.db, async (tx) => {
      // Get organization settings for prefix
      const prefix = await this.getOrganizationPrefix(organizationId);
      
      // Get current year
      const currentYear = new Date().getFullYear();
      
      // Get all quote numbers for this organization
      const existingQuotes = await tx
        .select({ quoteNumber: quotes.quoteNumber })
        .from(quotes)
        .where(
          and(
            eq(quotes.organizationId, organizationId),
            isNull(quotes.deletedAt)
          )
        );

      let nextSequence = 1;
      
      // Find the highest sequence number for the current year
      for (const quote of existingQuotes) {
        if (quote.quoteNumber) {
          const match = quote.quoteNumber.match(new RegExp(`${prefix}-${currentYear}-(\\d+)`));
          if (match && match[1]) {
            const sequence = parseInt(match[1], 10);
            if (sequence >= nextSequence) {
              nextSequence = sequence + 1;
            }
          }
        }
      }

      // Generate new quote number with zero-padded sequence
      const sequenceStr = nextSequence.toString().padStart(4, '0');
      const quoteNumber = `${prefix}-${currentYear}-${sequenceStr}`;

      return quoteNumber;
    });
  }

  /**
   * Get organization prefix from settings
   * Defaults to 'Q' if not configured
   */
  private async getOrganizationPrefix(_organizationId: string): Promise<string> {
    // TODO: Implement organization settings lookup
    // For now, return default prefix
    return 'Q';
  }

  /**
   * Validate quote number format
   */
  static validateQuoteNumber(quoteNumber: string): boolean {
    // Format: PREFIX-YEAR-SEQUENCE (e.g., Q-2024-0001)
    const pattern = /^[A-Z]{1,3}-\d{4}-\d{4}$/;
    return pattern.test(quoteNumber);
  }

  /**
   * Extract components from quote number
   */
  static parseQuoteNumber(quoteNumber: string): { prefix: string; year: number; sequence: number } | null {
    const match = quoteNumber.match(/^([A-Z]{1,3})-(\d{4})-(\d{4})$/);
    
    if (!match || !match[1] || !match[2] || !match[3]) {
      return null;
    }

    return {
      prefix: match[1],
      year: parseInt(match[2], 10),
      sequence: parseInt(match[3], 10)
    };
  }

  /**
   * Check if quote number already exists
   */
  async quoteNumberExists(quoteNumber: string, organizationId: string): Promise<boolean> {
    const result = await this.db
      .select({ id: quotes.id })
      .from(quotes)
      .where(
        and(
          eq(quotes.quoteNumber, quoteNumber),
          eq(quotes.organizationId, organizationId),
          isNull(quotes.deletedAt)
        )
      )
      .limit(1);

    return result.length > 0;
  }

  /**
   * Get quote number statistics for an organization
   */
  async getQuoteNumberStats(organizationId: string): Promise<{
    totalQuotes: number;
    currentYearQuotes: number;
    lastQuoteNumber: string | null;
    nextSequence: number;
  }> {
    const currentYear = new Date().getFullYear();
    const prefix = await this.getOrganizationPrefix(organizationId);

    // Get total quotes
    const totalResult = await this.db
      .select({ count: quotes.id })
      .from(quotes)
      .where(
        and(
          eq(quotes.organizationId, organizationId),
          isNull(quotes.deletedAt)
        )
      );

    // Get current year quotes
    const yearResult = await this.db
      .select({ count: quotes.id })
      .from(quotes)
      .where(
        and(
          eq(quotes.organizationId, organizationId),
          eq(quotes.quoteNumber, `${prefix}-${currentYear}-%`),
          isNull(quotes.deletedAt)
        )
      );

    // Get last quote number
    const lastQuote = await this.db
      .select({ quoteNumber: quotes.quoteNumber })
      .from(quotes)
      .where(
        and(
          eq(quotes.organizationId, organizationId),
          isNull(quotes.deletedAt)
        )
      )
      .orderBy(quotes.quoteNumber)
      .limit(1);

    let nextSequence = 1;
    if (lastQuote.length > 0 && lastQuote[0]?.quoteNumber) {
      const parsed = QuoteNumberGenerator.parseQuoteNumber(lastQuote[0].quoteNumber);
      if (parsed && parsed.year === currentYear) {
        nextSequence = parsed.sequence + 1;
      }
    }

    return {
      totalQuotes: totalResult.length,
      currentYearQuotes: yearResult.length,
      lastQuoteNumber: lastQuote.length > 0 && lastQuote[0]?.quoteNumber ? lastQuote[0].quoteNumber : null,
      nextSequence
    };
  }
}
