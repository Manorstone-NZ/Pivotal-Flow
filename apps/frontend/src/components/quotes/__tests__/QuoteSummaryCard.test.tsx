import React from 'react';
import { render, screen } from '@testing-library/react';
import { QuoteSummaryCard } from '../QuoteSummaryCard';
import type { Quote } from '../../../features/quotes/api';

const mockQuote: Quote = {
  id: 'quote-1',
  clientId: 'customer-1',
  title: 'Test Quote',
  description: 'A test quote',
  type: 'project',
  status: 'draft',
  validUntil: '2024-12-31T23:59:59Z',
  metadata: {
    currency: 'NZD',
    discountType: 'percentage',
    discountValue: '10',
    discountAmount: '100.00',
    taxRate: '0.15',
  },
  organizationId: 'org-1',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  lineItems: [],
  subtotal: 1000,
  taxAmount: 150,
  totalAmount: 1050,
  createdBy: 'user-1',
  quoteNumber: 'Q-001',
};

describe('QuoteSummaryCard', () => {
  it('renders quote summary correctly', () => {
    render(<QuoteSummaryCard quote={mockQuote} />);
    
    expect(screen.getByText('Quote Summary')).toBeInTheDocument();
    expect(screen.getByText('Q-001')).toBeInTheDocument();
    expect(screen.getByText('Draft')).toBeInTheDocument();
  });

  it('displays pricing breakdown', () => {
    render(<QuoteSummaryCard quote={mockQuote} showDetailedBreakdown={true} />);
    
    expect(screen.getByText('Subtotal:')).toBeInTheDocument();
    expect(screen.getByText('NZ$1,000.00')).toBeInTheDocument();
    expect(screen.getByText('Total Amount:')).toBeInTheDocument();
    expect(screen.getByText('NZ$1,050.00')).toBeInTheDocument();
  });

  it('shows discount information when applied', () => {
    render(<QuoteSummaryCard quote={mockQuote} />);
    
    expect(screen.getByText('Discount')).toBeInTheDocument();
    expect(screen.getByText('-NZ$100.00')).toBeInTheDocument();
  });

  it('handles different currencies', () => {
    const usdQuote = {
      ...mockQuote,
      metadata: { ...mockQuote.metadata, currency: 'USD' },
    };
    
    render(<QuoteSummaryCard quote={usdQuote} />);
    
    expect(screen.getByText('US$1,000.00')).toBeInTheDocument();
  });

  it('shows server truth indicator', () => {
    render(<QuoteSummaryCard quote={mockQuote} />);
    
    expect(screen.getByText(/calculations performed server-side/)).toBeInTheDocument();
  });
});
