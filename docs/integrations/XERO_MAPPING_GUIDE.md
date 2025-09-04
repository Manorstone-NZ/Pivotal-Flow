# Xero Integration Mapping Guide

## Overview

This document describes the field mapping between Pivotal Flow and Xero for contacts, invoices, payments, tax, and currency. The mapping is optimized for New Zealand GST and multi-currency scenarios.

## Contact Mapping

### Pivotal Flow → Xero

| Pivotal Flow Field | Xero Field | Notes |
|-------------------|------------|-------|
| `id` | `contactId` | Primary identifier |
| `companyName` | `name` | Company name |
| `firstName` | `firstName` | Individual contact first name |
| `lastName` | `lastName` | Individual contact last name |
| `email` | `emailAddress` | Contact email |
| `phone` | `phoneNumber` | Contact phone |
| `address.line1` | `address.addressLine1` | Street address |
| `address.line2` | `address.addressLine2` | Additional address info |
| `address.city` | `address.city` | City |
| `address.region` | `address.region` | State/region |
| `address.postalCode` | `address.postalCode` | Postal code |
| `address.country` | `address.country` | Defaults to 'NZ' |
| `taxNumber` | `taxNumber` | GST number |
| `customerNumber` | `accountNumber` | Customer reference |
| `isActive` | `status` | 'ACTIVE' or 'ARCHIVED' |

### Xero → Pivotal Flow

| Xero Field | Pivotal Flow Field | Notes |
|------------|-------------------|-------|
| `contactId` | `id` | Primary identifier |
| `name` | `companyName` | Company name |
| `firstName` | `firstName` | Individual contact first name |
| `lastName` | `lastName` | Individual contact last name |
| `emailAddress` | `email` | Contact email |
| `phoneNumber` | `phone` | Contact phone |
| `address.addressLine1` | `address.line1` | Street address |
| `address.addressLine2` | `address.line2` | Additional address info |
| `address.city` | `address.city` | City |
| `address.region` | `address.region` | State/region |
| `address.postalCode` | `address.postalCode` | Postal code |
| `address.country` | `address.country` | Country |
| `taxNumber` | `taxNumber` | GST number |
| `accountNumber` | `customerNumber` | Customer reference |
| `status` | `isActive` | 'ACTIVE' = true, 'ARCHIVED' = false |

## Invoice Mapping

### Pivotal Flow → Xero

| Pivotal Flow Field | Xero Field | Notes |
|-------------------|------------|-------|
| `id` | `invoiceId` | Primary identifier |
| `invoiceNumber` | `invoiceNumber` | Invoice number |
| `customerId` | `contact.contactId` | Customer reference |
| `customerName` | `contact.name` | Customer name |
| `issueDate` | `date` | Invoice date (YYYY-MM-DD) |
| `dueDate` | `dueDate` | Due date (YYYY-MM-DD) |
| `status` | `status` | Status mapping (see below) |
| `subtotal` | `subtotal` | Subtotal amount |
| `taxAmount` | `totalTax` | Total tax amount |
| `total` | `total` | Total amount |
| `currency` | `currencyCode` | Currency code |
| `fxRate` | `currencyRate` | Exchange rate |
| `lineItems[].id` | `lineItems[].lineItemId` | Line item identifier |
| `lineItems[].description` | `lineItems[].description` | Item description |
| `lineItems[].quantity` | `lineItems[].quantity` | Quantity |
| `lineItems[].unitPrice` | `lineItems[].unitAmount` | Unit price |
| `lineItems[].lineTotal` | `lineItems[].lineAmount` | Line total |
| `lineItems[].accountCode` | `lineItems[].accountCode` | Account code |
| `lineItems[].taxRate` | `lineItems[].taxType` | Tax type mapping (see below) |
| `lineItems[].taxAmount` | `lineItems[].taxAmount` | Line tax amount |

### Xero → Pivotal Flow

| Xero Field | Pivotal Flow Field | Notes |
|------------|-------------------|-------|
| `invoiceId` | `id` | Primary identifier |
| `invoiceNumber` | `invoiceNumber` | Invoice number |
| `contact.contactId` | `customerId` | Customer reference |
| `contact.name` | `customerName` | Customer name |
| `date` | `issueDate` | Invoice date |
| `dueDate` | `dueDate` | Due date |
| `status` | `status` | Status mapping (see below) |
| `subtotal` | `subtotal` | Subtotal amount |
| `totalTax` | `taxAmount` | Total tax amount |
| `total` | `total` | Total amount |
| `currencyCode` | `currency` | Currency code |
| `currencyRate` | `fxRate` | Exchange rate |
| `lineItems[].lineItemId` | `lineItems[].id` | Line item identifier |
| `lineItems[].description` | `lineItems[].description` | Item description |
| `lineItems[].quantity` | `lineItems[].quantity` | Quantity |
| `lineItems[].unitAmount` | `lineItems[].unitPrice` | Unit price |
| `lineItems[].lineAmount` | `lineItems[].lineTotal` | Line total |
| `lineItems[].accountCode` | `lineItems[].accountCode` | Account code |
| `lineItems[].taxType` | `lineItems[].taxRate` | Tax type mapping (see below) |
| `lineItems[].taxAmount` | `lineItems[].taxAmount` | Line tax amount |

## Payment Mapping

### Pivotal Flow → Xero

| Pivotal Flow Field | Xero Field | Notes |
|-------------------|------------|-------|
| `id` | `paymentId` | Primary identifier |
| `invoiceId` | `invoice.invoiceId` | Invoice reference |
| `amount` | `amount` | Payment amount |
| `currency` | Default 'NZD' | Currency (default NZD) |
| `fxRate` | `currencyRate` | Exchange rate |
| `paymentDate` | `date` | Payment date (YYYY-MM-DD) |
| `paymentMethod` | `account.name` | Payment method |
| `reference` | `reference` | Payment reference |

### Xero → Pivotal Flow

| Xero Field | Pivotal Flow Field | Notes |
|------------|-------------------|-------|
| `paymentId` | `id` | Primary identifier |
| `invoice.invoiceId` | `invoiceId` | Invoice reference |
| `amount` | `amount` | Payment amount |
| Default 'NZD' | `currency` | Currency (default NZD) |
| `currencyRate` | `fxRate` | Exchange rate |
| `date` | `paymentDate` | Payment date |
| `account.name` | `paymentMethod` | Payment method |
| `reference` | `reference` | Payment reference |

## NZ GST and Multi-Currency Mapping

### Tax Rate Mapping

| Pivotal Flow Tax Rate | Xero Tax Type | Description |
|----------------------|---------------|-------------|
| 15.0% | `OUTPUT` | Standard NZ GST rate |
| 0.0% | `ZERO` | Zero-rated supplies |
| 0.0% | `EXEMPT` | Exempt supplies |
| 0.0% | `IMPORT` | Imported services |

### Currency Mapping

| Pivotal Flow Currency | Xero Currency Code | Description |
|----------------------|-------------------|-------------|
| `NZD` | `NZD` | New Zealand Dollar |
| `USD` | `USD` | US Dollar |
| `EUR` | `EUR` | Euro |
| `AUD` | `AUD` | Australian Dollar |
| `GBP` | `GBP` | British Pound |

### Account Code Mapping

| Pivotal Flow Service Category | Xero Account Code | Description |
|------------------------------|------------------|-------------|
| Consulting | `200` | Sales - Consulting |
| Development | `201` | Sales - Development |
| Support | `202` | Sales - Support |
| Training | `203` | Sales - Training |
| Hosting | `204` | Sales - Hosting |

## Status Mapping

### Invoice Status

| Pivotal Flow Status | Xero Status | Description |
|-------------------|-------------|-------------|
| `draft` | `DRAFT` | Draft invoice |
| `sent` | `SUBMITTED` | Sent to customer |
| `paid` | `PAID` | Fully paid |
| `overdue` | `AUTHORISED` | Past due date |
| `cancelled` | `VOIDED` | Cancelled/voided |

### Contact Status

| Pivotal Flow Status | Xero Status | Description |
|-------------------|-------------|-------------|
| `true` | `ACTIVE` | Active contact |
| `false` | `ARCHIVED` | Archived contact |

## Idempotency Strategy

### Push Operations

1. **Idempotency Key Generation**: Each push operation generates a unique idempotency key using the pattern:
   ```
   {operation}_{resourceId}_{organizationId}_{timestamp}
   ```

2. **Example Keys**:
   - `push_invoice_inv_001_org_acme_2024-01-30T10:30:00.000Z`
   - `push_payment_pay_001_org_acme_2024-01-30T10:30:00.000Z`
   - `push_contact_cont_001_org_acme_2024-01-30T10:30:00.000Z`

3. **Duplicate Detection**: The system checks for existing operations with the same idempotency key before processing.

4. **Response Consistency**: If a duplicate operation is detected, the system returns the same response as the original operation.

### Pull Operations

1. **Cache Strategy**: Pull operations use Redis caching with TTL to avoid unnecessary API calls.

2. **Cache Key Pattern**:
   ```
   xero_pull_{operation}_{resourceId}_{organizationId}
   ```

3. **Cache Invalidation**: Cache is invalidated when data is updated in either system.

## GST Number Handling

### NZ GST Number Validation

1. **Format**: NZ GST numbers are 8-9 digits
2. **Validation Regex**: `/^\d{8,9}$/`
3. **Xero Format**: Prefixed with 'NZ' (e.g., `NZ12345678`)

### GST Number Processing

```typescript
// Validate GST number
const isValid = validateNZGSTNumber('12345678'); // true

// Format for Xero
const formatted = formatNZGSTNumber('12345678'); // 'NZ12345678'
```

## Multi-Currency Considerations

### Exchange Rate Handling

1. **Rate Storage**: Exchange rates are stored in the `fxRate` field
2. **Rate Updates**: Rates should be updated regularly from a reliable source
3. **Historical Rates**: Consider storing historical rates for audit purposes

### Currency Conversion

1. **Base Currency**: NZD is the base currency for NZ organizations
2. **Conversion Timing**: Conversions should happen at the time of transaction
3. **Rounding**: Follow NZ accounting standards for currency rounding

## Error Handling

### Common Mapping Errors

1. **Missing Required Fields**: Log error and return validation failure
2. **Invalid Tax Rates**: Use default tax rate and log warning
3. **Currency Mismatch**: Use organization default currency
4. **Status Mapping**: Use safe default status

### Error Response Format

```json
{
  "success": false,
  "operationId": "op_123",
  "errors": [
    "Invalid tax rate: 25.0%",
    "Missing required field: contactId"
  ],
  "warnings": [
    "Using default currency: NZD"
  ],
  "timestamp": "2024-01-30T10:30:00.000Z"
}
```

## Testing Considerations

### Unit Tests

1. **Mapping Functions**: Test all mapping functions with various inputs
2. **Edge Cases**: Test with null values, empty strings, invalid formats
3. **NZ Context**: Test with NZ-specific scenarios (GST, currency)

### Integration Tests

1. **End-to-End**: Test complete push/pull cycles
2. **Idempotency**: Test duplicate operation handling
3. **Error Scenarios**: Test error handling and recovery

### Mock Data

1. **NZ Examples**: Use realistic NZ business data
2. **Currency Examples**: Include multi-currency scenarios
3. **GST Examples**: Include various GST scenarios (standard, zero-rated, exempt)
