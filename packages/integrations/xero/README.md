# Xero Integration Package

## Overview

This package provides a pluggable interface for Xero integration with Pivotal Flow. The integration is designed to be feature-flagged and can be enabled/disabled without affecting core business logic.

## Features

- **Pluggable Interface**: Clean contract for Xero operations
- **Feature Flagged**: Can be enabled/disabled per organization
- **No Network Calls**: Safe no-op implementation for development
- **NZ Context**: Optimized for New Zealand GST and multi-currency
- **Audit Logging**: All operations logged for debugging

## Quick Start

### Enable Xero Integration Locally

1. Set environment variables:
```bash
export XERO_CLIENT_ID="your_client_id"
export XERO_CLIENT_SECRET="your_client_secret"
export XERO_REDIRECT_URI="http://localhost:3000/v1/integrations/xero/callback"
export XERO_TENANT_ID="your_tenant_id"
```

2. Enable feature flag for your organization:
```sql
UPDATE organizations 
SET settings = jsonb_set(settings, '{xero_integration_enabled}', 'true')
WHERE id = 'your_org_id';
```

3. Restart the backend service

### Check Integration Status

```bash
curl http://localhost:3000/v1/integrations/xero/health
```

### Test Push Operations

```bash
# Push an invoice (no-op mode)
curl -X POST http://localhost:3000/v1/integrations/xero/push/invoice \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "invoiceId": "inv_001",
    "operation": "create"
  }'
```

## Architecture

### Connector Interface

The `XeroConnector` interface defines all Xero operations:

```typescript
interface XeroConnector {
  // Push operations
  pushInvoice(invoice: XeroInvoice): Promise<XeroOperationResult>;
  pushPayment(payment: XeroPayment): Promise<XeroOperationResult>;
  
  // Pull operations
  pullContact(contactId: string): Promise<XeroContact>;
  pullAccountCodes(): Promise<XeroAccountCode[]>;
  
  // Health and status
  getHealth(): Promise<XeroHealthStatus>;
}
```

### Mapping Layer

The mapping layer converts between Pivotal Flow models and Xero DTOs:

```typescript
// Pivotal Flow -> Xero
const xeroInvoice = mapInvoiceToXero(pivotalInvoice);

// Xero -> Pivotal Flow
const pivotalContact = mapContactFromXero(xeroContact);
```

### Feature Flag

Xero integration is controlled by the `xero_integration_enabled` flag in organization settings.

## Development

### Adding New Operations

1. Add operation to `XeroConnector` interface
2. Implement in `NoOpXeroConnector`
3. Add mapping functions
4. Add unit tests
5. Update documentation

### Testing

```bash
# Run unit tests
npm test packages/integrations/xero

# Run integration tests
npm run test:integration packages/integrations/xero
```

## Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `XERO_CLIENT_ID` | OAuth client ID | Yes (when enabled) |
| `XERO_CLIENT_SECRET` | OAuth client secret | Yes (when enabled) |
| `XERO_REDIRECT_URI` | OAuth redirect URI | Yes (when enabled) |
| `XERO_TENANT_ID` | Xero tenant ID | Yes (when enabled) |

### Organization Settings

```json
{
  "xero_integration_enabled": true,
  "xero_settings": {
    "sync_frequency": "hourly",
    "auto_sync": true
  }
}
```

## Troubleshooting

### Integration Disabled

If the health check shows "disabled", check:

1. Environment variables are set
2. Feature flag is enabled for organization
3. Backend service is restarted

### Audit Logs

All Xero operations are logged to audit logs:

```sql
SELECT * FROM audit_logs 
WHERE resource = 'xero_integration' 
ORDER BY created_at DESC;
```

### Webhook Debugging

Webhook payloads are stored in JSONB for debugging:

```sql
SELECT * FROM xero_webhooks 
ORDER BY received_at DESC;
```
