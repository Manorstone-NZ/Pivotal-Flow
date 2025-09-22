/**
 * Frontend API Integration Example for D4 Contract Stability
 * Demonstrates usage of generated SDK types
 */

import { PivotalFlowClient } from '@pivotal-flow/sdk';

// Example configuration
const API_BASE_URL = 'http://localhost:3000/api/v1';

// F2B: Create client instance for cookie-based authentication
const client = new PivotalFlowClient({
  baseURL: API_BASE_URL,
  // F2B: No access token needed - using secure HttpOnly cookies
  getAccessToken: () => null,
  // F2B: No refresh token needed - sessions auto-expire and renew
  refreshToken: async () => null,
  // F2B: Ensure cookies are sent with all requests
  credentials: 'include'
});

// Example usage with traditional client
export async function listQuotesExample() {
  try {
    // Using the traditional client
    const quotes = await client.quotes.list();
    
    // Quotes retrieved successfully
    
    return quotes;
  } catch (error) {
    // Failed to list quotes
    throw error;
  }
}

// Example usage with create quote
export async function createQuoteExample() {
  try {
    // Using the traditional client with proper type safety
    const quoteData = {
      customerId: 'customer-123',
      title: 'Website Development Quote',
      description: 'Full-stack website development project',
      currency: 'USD',
      validFrom: new Date().toISOString(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      lineItems: [
        {
          description: 'Frontend Development',
          quantity: 40,
          unitPrice: 100,
          total: 4000
        },
        {
          description: 'Backend Development',
          quantity: 30,
          unitPrice: 120,
          total: 3600
        }
      ]
    };
    
    const newQuote = await client.quotes.create(quoteData);
    
    // Quote created successfully
    
    return newQuote;
  } catch (error) {
    // Failed to create quote
    throw error;
  }
}

// Example React hook (if using React Query in the future)
export function useQuoteOperations() {
  return {
    createQuote: createQuoteExample,
    listQuotes: listQuotesExample,
    // Future: React Query hooks can be added here
  };
}

