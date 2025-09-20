# D4: SDK Generation from OpenAPI Plan

## Analysis: SDK Generation Options Comparison

### Current State
- **Backend**: Fastify with OpenAPI 3.1.0 spec at `/api/openapi.json`
- **SDK**: Manual TypeScript client with Axios, manually maintained types
- **Frontend**: React with Zustand (no React Query currently)
- **Types**: Manually defined in `packages/sdk/src/types.ts`

### Option 1: openapi-typescript + openapi-fetch
**Pros:**
- ✅ Lightweight and focused on type generation
- ✅ Excellent TypeScript support with strict typing
- ✅ Works with any HTTP client (fetch, axios, etc.)
- ✅ No React Query dependency
- ✅ Simple setup and maintenance
- ✅ Good performance (small bundle size)
- ✅ Works with existing Axios-based client

**Cons:**
- ❌ No automatic React Query hooks generation
- ❌ Manual client implementation required
- ❌ Need to maintain both types and client separately

### Option 2: orval
**Pros:**
- ✅ Automatic React Query hooks generation
- ✅ Supports multiple output formats (axios, fetch, etc.)
- ✅ Comprehensive configuration options
- ✅ Good TypeScript support
- ✅ Can generate both types and clients

**Cons:**
- ❌ Larger bundle size and complexity
- ❌ Requires React Query dependency
- ❌ More complex configuration
- ❌ Potential overkill for current needs
- ❌ Less flexible for custom client implementations

### Option 3: Hybrid Approach (Recommended)
**Pros:**
- ✅ Best of both worlds
- ✅ Use openapi-typescript for type generation
- ✅ Keep existing manual client for flexibility
- ✅ Add React Query hooks generation separately
- ✅ Minimal changes to existing codebase
- ✅ Future-proof and extensible

**Cons:**
- ❌ Slightly more complex setup
- ❌ Need to maintain multiple generation scripts

## Recommendation: Hybrid Approach

**Rationale:**
1. **Minimal Disruption**: Current SDK is well-structured and working
2. **Type Safety**: openapi-typescript provides excellent type generation
3. **Flexibility**: Keep manual client for custom authentication/error handling
4. **Future-Ready**: Can add React Query hooks when frontend adopts it
5. **Performance**: Lightweight solution with small bundle size

## Implementation Plan

### Phase 1: Setup openapi-typescript
1. Install `openapi-typescript` as dev dependency
2. Create generation script that fetches `/api/openapi.json`
3. Generate types to `packages/sdk/src/gen/types.ts`
4. Update existing types to re-export generated types

### Phase 2: Update Client Generation
1. Create thin client wrapper using generated types
2. Maintain existing authentication and error handling
3. Generate client to `packages/sdk/src/gen/client.ts`
4. Update main client to use generated types

### Phase 3: CI Integration
1. Add `pnpm -w run sdk:generate` script
2. Add CI check for spec changes
3. Ensure generation runs on API changes

### Phase 4: Frontend Integration
1. Create example usage in `apps/frontend/src/lib/api.ts`
2. Verify TypeScript compilation
3. Test with existing frontend code

## Detailed Implementation

### 1. Package Dependencies
```json
{
  "devDependencies": {
    "openapi-typescript": "^7.0.0"
  }
}
```

### 2. Generation Script
```bash
# packages/sdk/scripts/generate.ts
#!/usr/bin/env tsx

import { generateTypes } from 'openapi-typescript';
import { writeFileSync } from 'fs';
import { join } from 'path';

const API_URL = process.env.API_URL || 'http://localhost:3000/api/openapi.json';

async function generateSDK() {
  console.log('🔄 Fetching OpenAPI spec from', API_URL);
  
  const types = await generateTypes(API_URL, {
    transform: {
      // Custom transformations if needed
    }
  });
  
  const typesPath = join(process.cwd(), 'src/gen/types.ts');
  writeFileSync(typesPath, types);
  
  console.log('✅ Generated types to', typesPath);
}

generateSDK().catch(console.error);
```

### 3. Package.json Scripts
```json
{
  "scripts": {
    "generate": "tsx scripts/generate.ts",
    "generate:watch": "tsx scripts/generate.ts --watch"
  }
}
```

### 4. Root Package.json Script
```json
{
  "scripts": {
    "sdk:generate": "pnpm --filter @pivotal-flow/sdk generate"
  }
}
```

### 5. CI Check Script
```bash
#!/bin/bash
# scripts/ci/check-sdk-generation.sh

echo "🔍 Checking if SDK is up to date with OpenAPI spec..."

# Generate SDK
pnpm sdk:generate

# Check if any files changed
if git diff --quiet packages/sdk/src/gen/; then
  echo "✅ SDK is up to date"
else
  echo "❌ SDK is out of date. Please run 'pnpm sdk:generate' and commit changes."
  exit 1
fi
```

### 6. Generated Types Integration
```typescript
// packages/sdk/src/gen/types.ts (generated)
export interface paths {
  '/auth/login': {
    post: {
      requestBody: {
        content: {
          'application/json': {
            email: string;
            password: string;
          };
        };
      };
      responses: {
        200: {
          content: {
            'application/json': {
              accessToken: string;
              user: User;
            };
          };
        };
      };
    };
  };
  // ... more paths
}

export interface components {
  schemas: {
    User: {
      id: string;
      email: string;
      displayName: string;
      // ... more fields
    };
    // ... more schemas
  };
}
```

### 7. Updated Client Implementation
```typescript
// packages/sdk/src/gen/client.ts
import type { paths } from './types.js';
import { PivotalFlowClient } from '../index.js';

export class GeneratedPivotalFlowClient extends PivotalFlowClient {
  // Use generated types for better type safety
  async login(data: paths['/auth/login']['post']['requestBody']['content']['application/json']) {
    return super.auth.login(data);
  }
  
  // ... other methods with generated types
}
```

### 8. Frontend Integration Example
```typescript
// apps/frontend/src/lib/api.ts
import { PivotalFlowClient } from '@pivotal-flow/sdk';
import type { paths } from '@pivotal-flow/sdk/gen/types';

const client = new PivotalFlowClient({
  baseURL: 'http://localhost:3000/api/v1',
  getAccessToken: () => localStorage.getItem('accessToken'),
});

// Example usage with generated types
export async function loginUser(email: string, password: string) {
  const response = await client.auth.login({ email, password });
  return response; // Fully typed response
}
```

## Acceptance Criteria

### ✅ Generation Works
- `pnpm -w run sdk:generate` successfully fetches spec and generates types
- Generated types are properly formatted and valid TypeScript
- No compilation errors in SDK package

### ✅ Build Stays Green
- `pnpm -w build` passes without errors
- All existing tests continue to pass
- No breaking changes to existing API

### ✅ Frontend Integration
- Example usage compiles in `apps/frontend/src/lib/api.ts`
- TypeScript can infer types from generated SDK
- No runtime errors in frontend

### ✅ CI Integration
- CI check fails when spec changes but SDK not regenerated
- Generation script runs reliably in CI environment
- Proper error handling for network issues

## Risk Mitigation

### NodeNext/verbatimModuleSyntax Issues
**Risk**: Import/export issues with generated code
**Mitigation**: 
- Use `import type` for type-only imports
- Configure openapi-typescript with proper module settings
- Test with strict TypeScript settings

### Network Dependencies
**Risk**: Generation fails if backend is down
**Mitigation**:
- Cache spec locally for offline generation
- Provide fallback to local spec file
- Clear error messages for network issues

### Type Conflicts
**Risk**: Generated types conflict with existing types
**Mitigation**:
- Use namespace separation
- Gradual migration approach
- Maintain backward compatibility

## Timeline

- **D4.1**: Setup openapi-typescript and basic generation (1 day)
- **D4.2**: Integrate generated types with existing client (1 day)
- **D4.3**: Add CI checks and frontend integration (1 day)
- **D4.4**: Testing and refinement (1 day)

**Total**: 4 days

## Success Metrics

1. **Type Safety**: 100% of API endpoints have generated types
2. **Build Time**: No increase in build time
3. **Bundle Size**: No increase in SDK bundle size
4. **Developer Experience**: Improved autocomplete and type checking
5. **Maintenance**: Reduced manual type maintenance

## Future Enhancements

1. **React Query Hooks**: Add orval for React Query hooks when frontend adopts it
2. **Multiple Clients**: Generate different client implementations (fetch, axios, etc.)
3. **Validation**: Add runtime validation using generated schemas
4. **Documentation**: Auto-generate API documentation from types
5. **Testing**: Generate mock data and test utilities

---

**Decision**: Proceed with Hybrid Approach using openapi-typescript for type generation while maintaining existing client architecture.

---

## ✅ IMPLEMENTATION COMPLETED

**Status**: ✅ **COMPLETED** - SDK generation from OpenAPI specification successfully implemented

### What Was Accomplished:

1. **✅ Phase 1: Setup openapi-typescript**: 
   - Installed `openapi-typescript@7.9.1` as dev dependency
   - Created generation script at `packages/sdk/scripts/generate.ts`
   - Added `pnpm sdk:generate` command to root package.json

2. **✅ Phase 2: Generate types and integrate with existing client**:
   - Generated types successfully from `/api/openapi.json` endpoint
   - Created `GeneratedPivotalFlowClient` class extending base client
   - Types are generated to `packages/sdk/src/gen/types.ts`
   - Made axios instance protected for inheritance
   - SDK builds successfully with generated types

3. **✅ Phase 3: Add CI integration and checks**:
   - Created CI check script at `scripts/ci/check-sdk-generation.sh`
   - Added `pnpm ci:sdk` command to root package.json
   - CI check verifies SDK is up to date with OpenAPI spec
   - Git diff detection ensures changes are committed

4. **✅ Phase 4: Frontend integration and testing**:
   - Added SDK as dependency to frontend package
   - Created example usage in `apps/frontend/src/lib/api.ts`
   - Fixed JSX file extensions (.js → .jsx) for proper Vite compilation
   - Frontend compiles successfully with SDK integration

### Key Features Delivered:

- **Automatic Type Generation**: Types are generated from live OpenAPI spec
- **Type Safety**: Generated types provide full TypeScript intellisense
- **CI Integration**: Automated checks ensure SDK stays in sync
- **Frontend Ready**: Example usage demonstrates integration patterns
- **Backward Compatible**: Existing client continues to work alongside generated client

### Acceptance Criteria Met:

✅ `pnpm -w run sdk:generate` works  
✅ `pnpm -w build` stays green (frontend builds successfully)  
✅ Example usage compiles in `apps/frontend/src/lib/api.ts`  
✅ CI check `pnpm ci:sdk` passes  
✅ Generated types are properly exported from SDK package  

### Usage Examples:

```typescript
// Generate types from OpenAPI spec
pnpm sdk:generate

// Use generated types in frontend
import { PivotalFlowClient } from '@pivotal-flow/sdk';

const client = new PivotalFlowClient({
  baseURL: 'http://localhost:3000/api/v1',
  getAccessToken: () => localStorage.getItem('accessToken')
});

// Type-safe API calls
const quotes = await client.quotes.list();
const newQuote = await client.quotes.create({
  customerId: 'customer-123',
  title: 'Website Development Quote',
  // ... other fields with full type safety
});
```

### Next Steps:

The SDK generation system is now ready for production use. Future enhancements could include:
- React Query hooks generation with `orval`
- More comprehensive type transformations
- Automated SDK versioning based on API changes

