# Reports Module Notes

## CF5 Epic Implementation Notes

### Assumptions Made

1. **Fastify Schema Type Issues**: The FastifySchema type doesn't recognize `summary`, `tags`, and other OpenAPI properties. Used `as any` type assertion to bypass these TypeScript errors while maintaining the OpenAPI documentation structure.

2. **Audit Logger Compatibility**: The local `AuditLogger` class expects different property names than the shared `createAuditLogger` function:
   - `resource` → `entityType`
   - `resourceId` → `entityId` 
   - `details` → `metadata`

3. **Permission Service**: Used the local `PermissionService` instead of the shared one because the local service has additional methods required by the reports services.

4. **Fastify Logger Type Issues**: Used `(fastify.log as any).error()` to bypass TypeScript errors with the Fastify logger interface.

### Database Schema Alignment

- **Customers**: Use `companyName` instead of `name` (already fixed in CF4)
- **Users**: Use `displayName` instead of `name` (already fixed in CF4)
- **Payments**: `amount` field is `decimal` type requiring string comparison

### Repository DTOs

The reports service uses direct table queries rather than repository DTOs. This is acceptable for the current implementation since:
- The queries are complex aggregations that don't fit well into simple repository patterns
- The data shapes are specific to each report type
- Performance is critical for reporting queries

### Timer Usage

Currently using direct `Date.now()` calculations. Should be migrated to use shared timer utilities from `@pivotal-flow/shared` in future iterations.

### Audit Logging

All report generation and export operations are properly audited using the local `AuditLogger` class with correct event structure.

### Error Handling

- Permission denied errors return 403 status
- Not found errors return 404 status  
- Processing errors return 500 status
- All errors are logged with proper context

### Testing Strategy

- Unit tests should focus on individual report generation methods
- Integration tests should use seeded data to verify end-to-end functionality
- Mock the database layer for unit tests to avoid external dependencies
