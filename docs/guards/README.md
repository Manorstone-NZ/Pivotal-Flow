# JSONB Guards - Relational vs JSONB Enforcement

This document describes the guard system that enforces the relational versus JSONB rules for the Pivotal Flow application.

## **Core Rules Enforced**

- **Core monetary and status fields live in typed columns**
- **JSONB is sidecar only for optional metadata**
- **Write payloads with monetary or status fields inside metadata are rejected at HTTP layer**
- **Filters that target core fields through JSONB are rejected at repo layer**
- **CI scans code for illegal JSONB usage in SQL or raw strings**

## **Guard Components**

### **1. HTTP Layer Guard (`payloadGuardPlugin`)**

The Fastify plugin that intercepts all write requests to quote endpoints and validates that metadata JSONB doesn't contain forbidden fields.

**Forbidden Fields:**
- `subtotal`, `taxTotal`, `grandTotal`
- `unitPrice`, `discount`, `currency`
- `status`, `totals`, `amount`, `price`

**Usage:**
```typescript
// This will be rejected
POST /v1/quotes
{
  "metadata": {
    "subtotal": 1000  // ❌ Forbidden
  }
}

// This will be allowed
POST /v1/quotes
{
  "metadata": {
    "tags": ["urgent"],
    "notes": "Customer requested expedited processing"
  }
}
```

### **2. Repository Filter Guard (`guardTypedFilters`)**

Prevents filters from targeting core fields through metadata JSONB paths.

**Blocked Patterns:**
- `metadata.subtotal`
- `metadata->status`
- Any filter that tries to access core fields through JSONB

**Allowed Patterns:**
- `status: "draft"`
- `customerId: "abc-123"`
- `project.code: "PRJ-001"`

**Usage:**
```typescript
// This will be rejected
const filters = { "metadata.subtotal": 1000 }; // ❌ Forbidden

// This will be allowed
const filters = { status: "draft", customerId: "abc-123" }; // ✅ Allowed
```

### **3. Static Analysis Script**

The CI script that scans all code files for dangerous JSONB usage patterns.

**Scanned Patterns:**
- `metadata->>'subtotal'`
- `metadata->'status'`
- `jsonb_extract_path_text(metadata, 'unitPrice')`

## **Integration Points**

### **Quote Service**

The quote service automatically applies the filter guard in the `listQuotes` method:

```typescript
async listQuotes(pagination: PaginationOptions, filters: any = {}) {
  // Guard against JSONB filter misuse
  const check = guardTypedFilters(filters);
  if (!check.ok) {
    const e: any = new Error(check.reason);
    e.statusCode = 400;
    e.code = "JSONB_FILTER_FORBIDDEN";
    throw e;
  }
  // ... rest of method
}
```

### **Rate Card Service**

The rate card service includes JSONB validation in all create/update methods:

```typescript
// Validate that metadata JSONB doesn't contain business values
if (data.metadata) {
  validateMetadataJSONB(data.metadata, 'rate card metadata');
}
```

## **Testing**

### **Unit Tests**

Run the guard tests:
```bash
# Shared package tests
pnpm test --filter=@pivotal-flow/shared

# Backend plugin tests
cd apps/backend && pnpm test src/plugins/payloadGuard.test.ts
```

### **CI Checks**

The CI workflow automatically runs:
1. Static JSONB usage scan
2. Guard unit tests
3. Integration tests

## **Error Handling**

### **HTTP Layer Errors**

When forbidden fields are detected in metadata:
```json
{
  "statusCode": 400,
  "code": "JSONB_MONETARY_FORBIDDEN",
  "message": "Forbidden monetary or status field in metadata at metadata.subtotal",
  "details": [
    {
      "path": "metadata.subtotal",
      "key": "subtotal",
      "message": "Forbidden monetary or status field in metadata at metadata.subtotal"
    }
  ]
}
```

### **Repository Layer Errors**

When forbidden filters are detected:
```json
{
  "statusCode": 400,
  "code": "JSONB_FILTER_FORBIDDEN",
  "message": "Filter on metadata path is not allowed for core fields: metadata.subtotal"
}
```

## **Best Practices**

### **✅ Do's**

- Store core business data in typed columns
- Use JSONB for optional metadata like tags, notes, custom fields
- Use JSONB for feature flags and configuration
- Use JSONB for third-party integrations where schema is unknown

### **❌ Don'ts**

- Store monetary amounts in JSONB
- Store status fields in JSONB
- Filter core fields through JSONB paths
- Use JSONB as a workaround for missing columns

## **Migration Guide**

If you need to add new fields to existing entities:

1. **Core Business Fields**: Add as typed columns
2. **Optional Metadata**: Use JSONB with proper validation
3. **Update Guards**: Add new forbidden keys if needed
4. **Test**: Ensure guards catch violations

## **Troubleshooting**

### **Common Issues**

1. **Guard rejecting valid metadata**: Check if any nested objects contain forbidden keys
2. **Filter guard blocking queries**: Ensure you're not trying to filter through metadata paths
3. **CI failures**: Run the static analysis script locally to identify issues

### **Debug Mode**

Enable debug logging for guards:
```typescript
// In development, you can log guard violations
const violations = assertNoMonetaryInMetadata(metadata);
if (violations.length > 0) {
  console.log('Guard violations:', violations);
}
```

## **Future Enhancements**

- **Custom Guard Rules**: Allow per-entity guard configurations
- **Audit Logging**: Log all guard violations for compliance
- **Performance Metrics**: Track guard performance impact
- **Schema Validation**: Integrate with JSON Schema for metadata validation
