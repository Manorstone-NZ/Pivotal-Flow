# @pivotal-flow/sdk

TypeScript SDK for Pivotal Flow API with full type safety and React Query integration.

## Features

- ✅ **Full TypeScript Support** - Complete type definitions for all API endpoints
- ✅ **Authentication Handling** - Automatic bearer token injection and refresh
- ✅ **React Query Integration** - Pre-built hooks for all API operations
- ✅ **Environment Aware** - Configurable base URLs for different environments
- ✅ **Error Handling** - Consistent error responses with proper typing
- ✅ **Pagination Support** - Built-in pagination with proper typing

## Installation

```bash
npm install @pivotal-flow/sdk
```

## Quick Start

### Basic Usage

```typescript
import { PivotalFlowClient } from '@pivotal-flow/sdk';

// Create client instance
const client = new PivotalFlowClient({
  baseURL: 'https://api.pivotalflow.com/api/v1',
  getAccessToken: () => localStorage.getItem('accessToken'),
  refreshToken: async () => {
    // Implement your token refresh logic
    const response = await fetch('/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: localStorage.getItem('refreshToken') })
    });
    const data = await response.json();
    localStorage.setItem('accessToken', data.accessToken);
    return data.accessToken;
  }
});

// Login
const loginResponse = await client.auth.login({
  email: 'user@example.com',
  password: 'password'
});

// Get quotes with pagination
const quotes = await client.quotes.list({
  page: 1,
  pageSize: 10,
  status: 'approved'
});

console.log(`Found ${quotes.total} quotes`);
```

### React Query Integration

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PivotalFlowClient, useQuotes, useCreateQuote } from '@pivotal-flow/sdk';

const queryClient = new QueryClient();
const apiClient = new PivotalFlowClient({
  baseURL: 'https://api.pivotalflow.com/api/v1',
  getAccessToken: () => localStorage.getItem('accessToken')
});

function QuotesList() {
  const { data: quotes, isLoading, error } = useQuotes(apiClient, {
    page: 1,
    pageSize: 10
  });

  const createQuote = useCreateQuote(apiClient);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {quotes?.items.map(quote => (
        <div key={quote.id}>
          <h3>Quote {quote.id}</h3>
          <p>Status: {quote.status}</p>
          <p>Total: ${quote.totalAmount}</p>
        </div>
      ))}
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <QuotesList />
    </QueryClientProvider>
  );
}
```

## Configuration

### Environment Setup

```typescript
// Environment-specific configuration
const config = {
  development: {
    baseURL: 'http://localhost:3000/api/v1',
    timeout: 10000
  },
  staging: {
    baseURL: 'https://staging-api.pivotalflow.com/api/v1',
    timeout: 30000
  },
  production: {
    baseURL: 'https://api.pivotalflow.com/api/v1',
    timeout: 30000
  }
};

const client = new PivotalFlowClient({
  ...config[process.env.NODE_ENV || 'development'],
  getAccessToken: () => localStorage.getItem('accessToken'),
  refreshToken: async () => {
    // Your refresh logic
  }
});
```

### Authentication

The SDK automatically handles authentication by:

1. **Injecting Bearer Tokens** - Automatically adds `Authorization: Bearer <token>` headers
2. **Token Refresh** - Automatically refreshes expired tokens on 401 responses
3. **Error Handling** - Proper error handling for authentication failures

```typescript
const client = new PivotalFlowClient({
  baseURL: 'https://api.pivotalflow.com/api/v1',
  getAccessToken: () => {
    // Return current access token
    return localStorage.getItem('accessToken');
  },
  refreshToken: async () => {
    // Implement token refresh logic
    const refreshToken = localStorage.getItem('refreshToken');
    const response = await fetch('/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    });
    
    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('accessToken', data.accessToken);
      return data.accessToken;
    }
    
    // Clear tokens on refresh failure
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    return null;
  }
});
```

## API Reference

### Core Client

```typescript
import { PivotalFlowClient, PivotalFlowConfig } from '@pivotal-flow/sdk';

const client = new PivotalFlowClient(config: PivotalFlowConfig);
```

### Authentication

```typescript
// Login
await client.auth.login(data: LoginRequest): Promise<LoginResponse>

// Refresh token
await client.auth.refresh(data: RefreshTokenRequest): Promise<RefreshTokenResponse>

// Logout
await client.auth.logout(data: LogoutRequest): Promise<LogoutResponse>

// Get current user
await client.auth.me(): Promise<MeResponse>
```

### User Management

```typescript
// List users
await client.users.list(params?: UserFilters): Promise<PaginationEnvelope<User>>

// Get user
await client.users.get(id: string): Promise<User>

// Create user
await client.users.create(data: CreateUserRequest): Promise<User>

// Update user
await client.users.update(id: string, data: UpdateUserRequest): Promise<User>
```

### Quote Management

```typescript
// List quotes
await client.quotes.list(params?: QuoteFilters): Promise<PaginationEnvelope<Quote>>

// Get quote
await client.quotes.get(id: string): Promise<Quote>

// Create quote
await client.quotes.create(data: CreateQuoteRequest): Promise<Quote>

// Update quote
await client.quotes.update(id: string, data: UpdateQuoteRequest): Promise<Quote>

// Transition quote status
await client.quotes.transitionStatus(id: string, data: QuoteStatusTransitionRequest): Promise<Quote>
```

### Portal (Customer-Facing)

```typescript
// Customer quotes
await client.portal.quotes.list(params?: PortalQuoteFilters): Promise<PaginationEnvelope<PortalQuote>>
await client.portal.quotes.get(id: string): Promise<PortalQuote>

// Customer invoices
await client.portal.invoices.list(params?: PortalInvoiceFilters): Promise<PaginationEnvelope<PortalInvoice>>
await client.portal.invoices.get(id: string): Promise<PortalInvoice>

// Customer time entries
await client.portal.timeEntries.list(params: PortalTimeEntryFilters): Promise<PaginationEnvelope<PortalTimeEntry>>
```

### Export Jobs

```typescript
// Create export job
await client.exports.create(data: CreateExportJobRequest): Promise<ExportJob>

// Get export job status
await client.exports.get(id: string): Promise<ExportJob>

// Download export file
await client.exports.download(id: string): Promise<Blob>
```

### System

```typescript
// Health check
await client.system.health(): Promise<HealthResponse>

// Get metrics
await client.system.metrics(): Promise<MetricsResponse>
```

## React Query Hooks

All API endpoints have corresponding React Query hooks for easy integration:

```typescript
import { useQuotes, useCreateQuote, useUpdateQuote } from '@pivotal-flow/sdk/react-query';

function QuoteManager() {
  const { data: quotes, isLoading } = useQuotes(client, { page: 1, pageSize: 10 });
  const createQuote = useCreateQuote(client);
  const updateQuote = useUpdateQuote(client);

  const handleCreate = async () => {
    await createQuote.mutateAsync({
      customerId: 'customer-123',
      currency: 'USD',
      validFrom: '2024-01-01',
      validUntil: '2024-12-31',
      lineItems: [
        {
          description: 'Consulting Services',
          quantity: 10,
          unitPrice: 100,
          total: 1000
        }
      ]
    });
  };

  const handleUpdate = async (id: string) => {
    await updateQuote.mutateAsync({
      id,
      data: { notes: 'Updated quote' }
    });
  };

  return (
    <div>
      {/* Your UI */}
    </div>
  );
}
```

## TypeScript Support

The SDK provides full TypeScript support with comprehensive type definitions:

```typescript
import type { 
  Quote, 
  QuoteStatus, 
  CreateQuoteRequest, 
  PaginationEnvelope 
} from '@pivotal-flow/sdk';

// All types are available for use in your application
const quote: Quote = {
  id: 'quote-123',
  organizationId: 'org-456',
  customerId: 'customer-789',
  status: 'approved',
  totalAmount: 1000,
  currency: 'USD',
  // ... other properties
};
```

## Error Handling

The SDK provides consistent error handling:

```typescript
try {
  const quotes = await client.quotes.list();
} catch (error) {
  if (error instanceof Error) {
    console.error('API Error:', error.message);
  }
}
```

All errors follow the standard `ErrorResponse` format:

```typescript
interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
    timestamp: string;
    request_id: string;
  };
  meta: {
    api_version: string;
    documentation_url: string;
  };
}
```

## Version Management

### Bumping Version

```bash
# Patch version (bug fixes)
npm version patch

# Minor version (new features)
npm version minor

# Major version (breaking changes)
npm version major
```

### Publishing

```bash
# Dry run to see what would be published
npm run publish:dry-run

# Build and publish
npm run prepublishOnly
npm publish
```

## Development

```bash
# Install dependencies
npm install

# Build the SDK
npm run build

# Development mode with watch
npm run dev

# Type checking
npm run type-check

# Run tests
npm test

# Lint code
npm run lint
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details.
