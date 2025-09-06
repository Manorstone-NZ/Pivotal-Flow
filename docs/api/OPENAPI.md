# OpenAPI Documentation

## Access Information

The Pivotal Flow API provides comprehensive OpenAPI documentation through Swagger UI and JSON schema endpoints.

### Endpoints

- **Swagger UI**: `http://localhost:3000/docs` (when `OPENAPI_ENABLE=true`)
- **OpenAPI JSON**: `http://localhost:3000/api/openapi.json` (always available)

### Environment Configuration

To enable the Swagger UI interface, set the following environment variable:

```bash
OPENAPI_ENABLE=true
```

### Server URLs

The OpenAPI specification uses the following server URLs:

- **Development**: `http://localhost:3000` (default)
- **Production**: Configured via `PUBLIC_API_URL` environment variable

### Authentication

The API uses JWT Bearer token authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Common Schemas

The OpenAPI specification includes standardized schemas for:

- **ErrorResponse**: Standardized error format with error codes and metadata
- **PaginationEnvelope**: Consistent pagination structure across all list endpoints

### Testing the Documentation

Run the smoke test to verify the OpenAPI endpoint is working:

```bash
pnpm run openapi:smoke
```

This will:
1. Fetch the OpenAPI JSON from `/api/openapi.json`
2. Validate it's valid JSON
3. Report success or failure

### Development Notes

- The OpenAPI plugin is registered after security plugins but before database plugins
- Swagger UI is only enabled when `OPENAPI_ENABLE=true` to avoid exposing documentation in production by default
- The JSON endpoint is always available for programmatic access and SDK generation
