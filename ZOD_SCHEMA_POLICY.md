# 🚨 CRITICAL: Zod Schema Policy - DO NOT REVERT

## ⚠️ IMPORTANT INSTRUCTION FOR ALL AI AGENTS

**DO NOT REVERT ANY ROUTE SCHEMAS BACK TO MANUAL JSON SCHEMA OBJECTS**

This project now uses **Zod schemas as the single source of truth** with automatic JSON Schema generation via `fastify-type-provider-zod`.

## ✅ Current Implementation Status

### ✅ COMPLETED - Using Zod Schemas:
- **Approvals Routes** (`apps/backend/src/modules/approvals/routes.ts`) - ✅ Using Zod schemas
- **Portal Routes** (`apps/backend/src/modules/portal/routes.ts`) - ✅ Using Zod schemas  
- **Reports Routes** (`apps/backend/src/modules/reports/routes.ts`) - ✅ Using Zod schemas
- **Files Routes** (`apps/backend/src/files/routes.ts`) - ✅ Using Zod schemas

### ⚠️ PARTIALLY REVERTED - Needs Fixing:
- **Allocations Routes** (`apps/backend/src/modules/allocations/routes.ts`) - ❌ Reverted to manual JSON Schema

## 🔧 Technical Implementation

### Zod Type Provider Setup:
```typescript
// apps/backend/src/index.ts
import { validatorCompiler, serializerCompiler, type ZodTypeProvider } from 'fastify-type-provider-zod';

const app = Fastify().withTypeProvider<ZodTypeProvider>();
app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);
```

### OpenAPI Integration:
```typescript
// apps/backend/src/plugins/openapi.js
import { jsonSchemaTransform } from 'fastify-type-provider-zod';

await fastify.register(swagger, {
  transform: jsonSchemaTransform
});
```

## 📋 Required Actions for All AI Agents

### ❌ FORBIDDEN ACTIONS:
1. **DO NOT** convert Zod schemas back to manual JSON Schema objects
2. **DO NOT** remove Zod type provider imports
3. **DO NOT** revert route schema definitions to `type: 'object'` format
4. **DO NOT** remove `jsonSchemaTransform` from OpenAPI plugin

### ✅ REQUIRED ACTIONS:
1. **ALWAYS** use Zod schemas in route definitions:
   ```typescript
   schema: {
     body: CreateAllocationBodySchema,  // ✅ Zod schema
     response: { 200: ResourceAllocationResponseSchema }  // ✅ Zod schema
   }
   ```

2. **ALWAYS** import Zod schemas from `./schemas.js`:
   ```typescript
   import { 
     CreateAllocationBodySchema,
     ResourceAllocationResponseSchema,
     ProjectIdParamsSchema
   } from './schemas.js';
   ```

3. **ALWAYS** create Zod schemas for params and responses:
   ```typescript
   // In schemas.ts
   export const ProjectIdParamsSchema = z.object({
     projectId: z.string().min(1, 'Project ID is required')
   });
   
   export const AllocationSuccessResponseSchema = z.object({
     success: z.boolean(),
     data: ResourceAllocationResponseSchema
   });
   ```

## 🎯 Benefits of Zod Implementation

1. **Single Source of Truth**: Zod schemas define both validation and types
2. **Automatic JSON Schema**: Fastify automatically converts Zod to JSON Schema
3. **Type Safety**: Full TypeScript support with automatic type inference
4. **OpenAPI Generation**: Automatic OpenAPI documentation from Zod schemas
5. **Runtime Validation**: Zod provides robust runtime validation
6. **Maintainability**: Changes to schemas automatically propagate everywhere

## 🔍 How to Identify Manual JSON Schema (DO NOT USE):

```typescript
// ❌ FORBIDDEN - Manual JSON Schema
schema: {
  body: {
    type: 'object',
    required: ['userId', 'role'],
    properties: {
      userId: { type: 'string', format: 'uuid' },
      role: { type: 'string' }
    }
  }
}

// ✅ REQUIRED - Zod Schema
schema: {
  body: CreateAllocationBodySchema,
  response: { 200: ResourceAllocationResponseSchema }
}
```

## 🚨 Emergency Contact

If you encounter any issues with this policy or need clarification, **DO NOT** make changes that revert Zod schemas. Instead, ask for guidance while maintaining the current Zod implementation.

---

**Last Updated**: 2025-01-07  
**Status**: ACTIVE - All AI agents must follow this policy  
**Priority**: CRITICAL - Violations will cause system failures
