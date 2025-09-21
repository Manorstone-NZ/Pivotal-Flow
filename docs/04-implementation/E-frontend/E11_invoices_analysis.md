# E11 Invoices UI - Analysis

## Overview
Implementation of comprehensive invoice management UI with ETag caching, payment tracking, and status transitions for the Pivotal Flow application.

## Requirements Analysis

### Core Functionality
- **Invoice List View**: Paginated list with status filtering
- **Invoice Detail View**: Complete invoice with line items, payments, and balance
- **Status Management**: Draft → Sent → Part Paid → Paid → Overdue → Written Off
- **Payment Tracking**: Timeline of payments with running balance
- **ETag Caching**: Efficient HTTP caching with 304 Not Modified responses

### Data Model (From Schema Analysis)
```typescript
interface Invoice {
  id: string;
  organizationId: string;
  invoiceNumber: string;
  customerId: string;
  projectId?: string;
  quoteId?: string;
  
  // Financial Data
  currency: string;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  
  // Status & Dates
  status: 'draft' | 'sent' | 'part_paid' | 'paid' | 'overdue' | 'written_off';
  issuedAt?: Date;
  dueAt?: Date;
  paidAt?: Date;
  overdueAt?: Date;
  writtenOffAt?: Date;
  
  // Content
  title: string;
  description?: string;
  termsConditions?: string;
  notes?: string;
  internalNotes?: string;
  
  // Relations
  lineItems: InvoiceLineItem[];
  payments: Payment[];
  customer: Customer;
  project?: Project;
  quote?: Quote;
  
  // Audit
  createdBy: string;
  approvedBy?: string;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### Status Transitions
```
Draft → Sent → Part Paid → Paid
  ↓       ↓        ↓
Void   Overdue  Written Off
```

## ETag/Cache Headers Strategy

### Implementation Approach
1. **Server-Side ETag Generation**: Hash of invoice data + updatedAt timestamp
2. **Client-Side If-None-Match**: Send ETag with subsequent requests
3. **304 Not Modified**: Return when content unchanged
4. **Cache-Control Headers**: Set appropriate cache lifetime

### ETag Calculation
```typescript
function generateInvoiceETag(invoice: Invoice): string {
  const dataString = JSON.stringify({
    id: invoice.id,
    updatedAt: invoice.updatedAt,
    paymentsUpdatedAt: Math.max(...invoice.payments.map(p => p.updatedAt))
  });
  return `"${createHash('sha256').update(dataString).digest('hex').substring(0, 16)}"`;
}
```

### HTTP Headers
- `ETag: "abc123def456"`
- `Cache-Control: private, max-age=300, must-revalidate`
- `Last-Modified: Wed, 18 Sep 2025 10:00:00 GMT`

## API Endpoints Design

### Backend Routes
```typescript
// List invoices with filtering
GET /api/v1/invoices
Query: status?, customerId?, page?, limit?, sort?
Response: { data: Invoice[], pagination: {...}, etag: string }

// Get invoice by ID
GET /api/v1/invoices/:id
Headers: If-None-Match: "etag"
Response: Invoice | 304 Not Modified

// Create invoice
POST /api/v1/invoices
Body: CreateInvoiceData
Response: Invoice

// Update invoice status
PATCH /api/v1/invoices/:id/status
Body: { status: string, reason?: string }
Response: Invoice

// Mark invoice as paid
POST /api/v1/invoices/:id/mark-paid
Body: { paymentDate: Date, amount?: number }
Response: Invoice

// Void invoice
POST /api/v1/invoices/:id/void
Body: { reason: string }
Response: Invoice
```

### Frontend API Hooks
```typescript
// List with caching
export const useInvoices = (filters: InvoiceFilters) => {
  return useQuery({
    queryKey: ['invoices', filters],
    queryFn: () => api.listInvoices(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Detail with ETag caching
export const useInvoice = (id: string) => {
  return useQuery({
    queryKey: ['invoice', id],
    queryFn: () => api.getInvoice(id),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Mutations
export const useCreateInvoice = () => {
  return useMutation({
    mutationFn: api.createInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
};

export const useMarkInvoicePaid = () => {
  return useMutation({
    mutationFn: ({ id, data }) => api.markInvoicePaid(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['invoice', id] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
};
```

## Component Architecture

### Page Components
- **InvoicesListPage**: Main list view with filters and table
- **InvoiceDetailPage**: Detailed invoice view with payments timeline

### Feature Components
- **InvoiceTable**: Data table with sorting, filtering, status badges
- **InvoiceTotals**: Financial summary with breakdown
- **PaymentTimeline**: Chronological payment history
- **StatusBadge**: Visual status indicator with transitions
- **InvoiceFilters**: Filter controls for status, customer, date range

### UI Components (Reusable)
- **DataTable**: Enhanced table with ETag caching indicators
- **Badge**: Status and priority indicators
- **Card**: Container for invoice sections
- **Timeline**: Payment and status change history

## ETag Caching Implementation

### Client-Side Strategy
```typescript
// Custom hook for ETag-aware requests
export const useETagQuery = <T>(
  key: QueryKey,
  fetcher: () => Promise<{ data: T; etag?: string }>,
  options?: UseQueryOptions<T>
) => {
  return useQuery({
    ...options,
    queryKey: key,
    queryFn: async () => {
      const cachedData = queryClient.getQueryData(key);
      const cachedETag = queryClient.getQueryState(key)?.dataUpdatedAt;
      
      try {
        const response = await fetcher();
        return response.data;
      } catch (error) {
        if (error.status === 304 && cachedData) {
          return cachedData as T;
        }
        throw error;
      }
    },
  });
};
```

### Axios Interceptor
```typescript
// Add ETag headers to requests
api.interceptors.request.use((config) => {
  const queryKey = config.url ? ['invoice', extractIdFromUrl(config.url)] : null;
  if (queryKey) {
    const cachedState = queryClient.getQueryState(queryKey);
    if (cachedState?.data) {
      config.headers['If-None-Match'] = cachedState.etag;
    }
  }
  return config;
});

// Handle 304 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 304) {
      // Return cached data instead of error
      const queryKey = extractQueryKeyFromError(error);
      const cachedData = queryClient.getQueryData(queryKey);
      return Promise.resolve({ data: cachedData, status: 304 });
    }
    return Promise.reject(error);
  }
);
```

## Testing Strategy

### Unit Tests (RTL + MSW)
```typescript
describe('ETag Caching Behavior', () => {
  it('should send If-None-Match header on subsequent requests', async () => {
    const { rerender } = render(<InvoiceDetail id="inv-123" />);
    
    // First request - no ETag header
    expect(server.getHandlers()[0]).toHaveBeenCalledWith(
      expect.objectContaining({
        headers: expect.not.objectContaining({
          'if-none-match': expect.any(String)
        })
      })
    );
    
    // Second request - should include ETag
    rerender(<InvoiceDetail id="inv-123" />);
    
    expect(server.getHandlers()[0]).toHaveBeenCalledWith(
      expect.objectContaining({
        headers: expect.objectContaining({
          'if-none-match': expect.any(String)
        })
      })
    );
  });
  
  it('should handle 304 Not Modified responses gracefully', async () => {
    // Mock 304 response
    server.use(
      rest.get('/api/v1/invoices/:id', (req, res, ctx) => {
        if (req.headers.get('if-none-match')) {
          return res(ctx.status(304));
        }
        return res(ctx.json(mockInvoice));
      })
    );
    
    const { getByText } = render(<InvoiceDetail id="inv-123" />);
    
    // Should still display cached content
    expect(getByText('Invoice #INV-001')).toBeInTheDocument();
  });
});
```

### E2E Tests (Playwright)
```typescript
// e2e/invoices.smoke.spec.ts
test('invoice list to detail navigation with caching', async ({ page }) => {
  // Navigate to invoices list
  await page.goto('/invoices');
  
  // Click on first invoice
  await page.click('[data-testid="invoice-row"]:first-child');
  
  // Verify detail page loads
  await expect(page.locator('[data-testid="invoice-detail"]')).toBeVisible();
  
  // Go back and return to same invoice
  await page.goBack();
  await page.click('[data-testid="invoice-row"]:first-child');
  
  // Verify 304 response was received (check network tab)
  const responses = await page.evaluate(() => 
    performance.getEntriesByType('navigation')
  );
  
  expect(responses.some(r => r.transferSize === 0)).toBe(true);
});
```

## Performance Considerations

### Optimization Strategies
1. **Virtual Scrolling**: For large invoice lists
2. **Pagination**: Server-side with reasonable page sizes
3. **Debounced Search**: Prevent excessive API calls
4. **Optimistic Updates**: Immediate UI feedback for status changes
5. **Background Refresh**: Periodic cache invalidation

### Performance Budgets
- **Initial Load**: < 2 seconds
- **Navigation**: < 500ms with cache hits
- **Search/Filter**: < 1 second
- **Status Updates**: < 300ms optimistic

## Accessibility Requirements

### WCAG 2.1 AA Compliance
- **Keyboard Navigation**: Full keyboard access to all functions
- **Screen Reader Support**: ARIA labels and descriptions
- **Color Contrast**: 4.5:1 minimum ratio
- **Focus Management**: Clear focus indicators
- **Status Announcements**: Live regions for status changes

### Implementation
```typescript
// Status badge with accessibility
const StatusBadge: React.FC<{ status: InvoiceStatus }> = ({ status }) => {
  return (
    <Badge
      variant={getStatusVariant(status)}
      aria-label={`Invoice status: ${getStatusLabel(status)}`}
      role="status"
    >
      {getStatusLabel(status)}
    </Badge>
  );
};

// Payment timeline with screen reader support
const PaymentTimeline: React.FC<{ payments: Payment[] }> = ({ payments }) => {
  return (
    <div role="list" aria-label="Payment history">
      {payments.map((payment, index) => (
        <div
          key={payment.id}
          role="listitem"
          aria-label={`Payment ${index + 1}: ${formatCurrency(payment.amount)} on ${formatDate(payment.date)}`}
        >
          {/* Payment content */}
        </div>
      ))}
    </div>
  );
};
```

## Browser Compatibility

### Target Support
- **Chrome**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+

### Polyfills Required
- None (using modern React with Vite)

## Implementation Plan

### Phase 1: Backend Foundation
1. Create invoices module with service and routes
2. Implement ETag generation and caching logic
3. Add comprehensive TypeBox schemas
4. Write unit tests for service layer

### Phase 2: Frontend API Layer
1. Create invoice API hooks with ETag support
2. Implement caching interceptors
3. Add error handling for 304 responses
4. Write MSW mocks for testing

### Phase 3: UI Components
1. Build core components (table, totals, timeline, badges)
2. Create Storybook stories
3. Implement accessibility features
4. Write RTL unit tests

### Phase 4: Pages & Routes
1. Create list and detail pages
2. Add routing configuration
3. Implement filtering and search
4. Add loading and error states

### Phase 5: Testing & Polish
1. Write comprehensive E2E tests
2. Performance optimization
3. Accessibility audit
4. Browser compatibility testing

## Success Criteria

### Functional Requirements
- ✅ Invoice list with status filtering works
- ✅ Invoice detail shows complete information
- ✅ Status transitions function correctly
- ✅ Payment tracking displays accurately
- ✅ ETag caching reduces server load

### Technical Requirements
- ✅ 304 responses handled correctly
- ✅ Cache-Control headers respected
- ✅ All tests pass (unit + E2E)
- ✅ Performance budgets met
- ✅ WCAG 2.1 AA compliance achieved

### Business Requirements
- ✅ Reduces server load through efficient caching
- ✅ Improves user experience with fast navigation
- ✅ Provides clear invoice status visibility
- ✅ Enables efficient payment tracking
- ✅ Supports audit trail requirements
