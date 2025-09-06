/**
 * Frontend API Integration Example for D4 Contract Stability
 * Demonstrates usage of generated SDK types
 */

import { PivotalFlowClient } from '@pivotal-flow/sdk';

// Example configuration
const API_BASE_URL = 'http://localhost:3000/api/v1';

// Create client instance
const client = new PivotalFlowClient({
  baseURL: API_BASE_URL,
  getAccessToken: () => localStorage.getItem('accessToken'),
  refreshToken: async () => {
    // Implement token refresh logic
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return null;
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
      });
      
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('accessToken', data.accessToken);
        return data.accessToken;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
    }
    
    return null;
  }
});

// Example usage with traditional client
export async function listQuotesExample() {
  try {
    // Using the traditional client
    const quotes = await client.quotes.list();
    
    console.log('Quotes:', quotes);
    
    return quotes;
  } catch (error) {
    console.error('Failed to list quotes:', error);
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
    
    console.log('Created quote:', newQuote);
    
    return newQuote;
  } catch (error) {
    console.error('Failed to create quote:', error);
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

