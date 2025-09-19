# 🚨 CRITICAL: TypeBox Schema Policy - DO NOT REVERT

## ⚠️ IMPORTANT INSTRUCTION FOR ALL AI AGENTS

**DO NOT REVERT ANY ROUTE SCHEMAS BACK TO MANUAL JSON SCHEMA OBJECTS**

This project uses **TypeBox schemas as the single source of truth** with automatic JSON Schema generation via `@fastify/type-provider-typebox`.

## ✅ Current Implementation Status

### ✅ COMPLETED - Backend Using TypeBox Schemas:
- **Auth Routes** (`apps/backend/src/modules/auth/`) - ✅ Using TypeBox schemas
- **Customers Routes** (`apps/backend/src/modules/customers/`) - ✅ Using TypeBox schemas
- **Quotes Routes** (`apps/backend/src/modules/quotes/`) - ✅ Using TypeBox schemas
- **Projects Routes** (`apps/backend/src/modules/projects/`) - ✅ Using TypeBox schemas
- **Users Routes** (`apps/backend/src/modules/users/`) - ✅ Using TypeBox schemas
- **Invoices Routes** (`apps/backend/src/modules/invoices/`) - ✅ Using TypeBox schemas
- **Rate Cards Routes** (`apps/backend/src/modules/rate-cards/`) - ✅ Using TypeBox schemas
- **Payments Routes** (`apps/backend/src/modules/payments/`) - ✅ Using TypeBox schemas
- **Currencies Routes** (`apps/backend/src/modules/currencies/`) - ✅ Using TypeBox schemas
- **Permissions Routes** (`apps/backend/src/modules/permissions/`) - ✅ Using TypeBox schemas
- **Files Routes** (`apps/backend/src/files/`) - ✅ Using TypeBox schemas

### ✅ COMPLETED - Frontend Using TypeBox Schemas:
- **Customer Forms** (`apps/frontend/src/components/customers/`) - ✅ Using TypeBox schemas
- **Contact Forms** (`apps/frontend/src/components/customers/`) - ✅ Using TypeBox schemas
- **API Contract Tests** (`apps/frontend/tests/contracts/`) - ✅ Using TypeBox schemas

## 🔧 Technical Implementation

### TypeBox Type Provider Setup:
```typescript
// apps/backend/src/server.ts
import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';

export const app = Fastify({
  // ... config
}).withTypeProvider<TypeBoxTypeProvider>();
```

### OpenAPI Integration:
```typescript
// TypeBox schemas automatically generate OpenAPI documentation
// No additional transform needed - @fastify/swagger handles TypeBox natively
await fastify.register(swagger, {
  openapi: {
    info: {
      title: 'Pivotal Flow API',
      version: '1.0.0'
    }
  }
});
```

### Frontend TypeBox Setup:
```typescript
// apps/frontend/package.json
"dependencies": {
  "@sinclair/typebox": "^0.34.41"
}

// Frontend component schema validation
import { Type, type Static } from '@sinclair/typebox';

const CustomerFormSchema = Type.Object({
  companyName: Type.String({ minLength: 1, maxLength: 255 }),
  email: Type.Optional(Type.String({ format: 'email' })),
  website: Type.Optional(Type.String({ format: 'uri' }))
});

type CustomerFormData = Static<typeof CustomerFormSchema>;
```

### Frontend Form Validation Integration:
```typescript
// Example: React Hook Form with TypeBox validation
import { useForm } from 'react-hook-form';
import { Type, type Static } from '@sinclair/typebox';

const FormSchema = Type.Object({
  companyName: Type.String({ minLength: 1 }),
  email: Type.Optional(Type.String({ format: 'email' }))
});

type FormData = Static<typeof FormSchema>;

const MyForm = () => {
  const { register, handleSubmit } = useForm<FormData>();
  // Form implementation
};
```

## 📋 Required Actions for All AI Agents

### ❌ FORBIDDEN ACTIONS:
1. **DO NOT** convert TypeBox schemas back to manual JSON Schema objects
2. **DO NOT** remove TypeBox type provider imports
3. **DO NOT** revert route schema definitions to `type: 'object'` format
4. **DO NOT** remove TypeBox schema imports from routes
5. **DO NOT** use Zod schemas in new code (backend or frontend)
6. **DO NOT** create frontend forms without TypeBox schema validation
7. **DO NOT** use manual type definitions when TypeBox `Static<>` types are available

### ✅ REQUIRED ACTIONS:
1. **ALWAYS** use TypeBox schemas in route definitions:
   ```typescript
   schema: {
     body: CreateCustomerBodySchema,  // ✅ TypeBox schema
     response: { 200: CustomerDetailResponseSchema }  // ✅ TypeBox schema
   }
   ```

2. **ALWAYS** import TypeBox schemas from `./schemas.ts` or `./typeboxSchemas.ts`:
   ```typescript
   import { 
     CreateCustomerBodySchema,
     CustomerDetailResponseSchema,
     CustomerIdParamSchema
   } from './schemas.js';
   ```

3. **ALWAYS** create TypeBox schemas for params, body, querystring and responses:
   ```typescript
   // In typeboxSchemas.ts or schemas.ts
   import { Type, type Static } from '@sinclair/typebox';
   
   export const CustomerIdParamSchema = Type.Object({
     id: Type.String()
   });
   
   export const CreateCustomerBodySchema = Type.Object({
     companyName: Type.String({ minLength: 1, maxLength: 255 }),
     email: Type.Optional(Type.String({ format: 'email' }))
   });
   
   export const CustomerResponseSchema = Type.Object({
     id: Type.String(),
     companyName: Type.String(),
     createdAt: Type.String({ format: 'date-time' })
   });
   
   // TypeScript types inferred from schemas
   export type CreateCustomerBody = Static<typeof CreateCustomerBodySchema>;
   export type CustomerResponse = Static<typeof CustomerResponseSchema>;
   ```

4. **ALWAYS** use TypeBox schemas in frontend forms and components:
   ```typescript
   // Frontend form component
   import { Type, type Static } from '@sinclair/typebox';
   
   const CustomerFormSchema = Type.Object({
     companyName: Type.String({ minLength: 1, maxLength: 255 }),
     email: Type.Optional(Type.String({ format: 'email' }))
   });
   
   type CustomerFormData = Static<typeof CustomerFormSchema>;
   
   const CustomerForm: React.FC = () => {
     const { register, handleSubmit } = useForm<CustomerFormData>();
     // Component implementation
   };
   ```

5. **ALWAYS** use TypeBox for frontend API contract testing:
   ```typescript
   // Frontend API contract tests
   import { Type } from '@sinclair/typebox';
   
   const ApiResponseSchema = Type.Object({
     success: Type.Boolean(),
     data: Type.Array(CustomerSchema)
   });
   
   // Test API response matches schema
   expect(response.data).toMatchSchema(ApiResponseSchema);
   ```

6. **ALWAYS** use proper TypeBox validation patterns:
   ```typescript
   // String validation
   Type.String({ minLength: 1, maxLength: 255 })
   Type.String({ format: 'email' })
   Type.String({ format: 'uri' })
   Type.String({ format: 'date-time' })
   
   // Number validation
   Type.Number({ minimum: 1, maximum: 100 })
   Type.Integer({ minimum: 0 })
   
   // Optional fields
   Type.Optional(Type.String())
   
   // Arrays
   Type.Array(Type.String())
   
   // Unions/Enums
   Type.Union([
     Type.Literal('active'),
     Type.Literal('inactive')
   ])
   
   // Partial schemas
   Type.Partial(CreateCustomerBodySchema)
   
   // Intersections
   Type.Intersect([
     BaseSchema,
     Type.Object({ additionalField: Type.String() })
   ])
   ```

## 🎯 Benefits of TypeBox Implementation

### Backend Benefits:
1. **Single Source of Truth**: TypeBox schemas define both validation and types
2. **Automatic JSON Schema**: Fastify automatically uses TypeBox schemas
3. **Type Safety**: Full TypeScript support with `Static<>` type inference
4. **OpenAPI Generation**: Native OpenAPI documentation from TypeBox schemas
5. **Runtime Validation**: TypeBox provides robust runtime validation
6. **Performance**: TypeBox is faster than Zod for validation
7. **Maintainability**: Changes to schemas automatically propagate everywhere
8. **JSON Schema Compatible**: TypeBox generates standard JSON Schema

### Frontend Benefits:
1. **Consistent Validation**: Same schema library across backend and frontend
2. **Type Safety**: `Static<>` types ensure frontend/backend type consistency
3. **Form Validation**: Direct integration with React Hook Form and other libraries
4. **API Contract Testing**: Validate API responses match expected schemas
5. **Reduced Bundle Size**: TypeBox is lighter than alternatives like Zod
6. **Runtime Safety**: Catch type mismatches at runtime, not just compile time
7. **Schema Reuse**: Share validation logic between client and server
8. **Developer Experience**: Consistent API across full stack

## 🔍 How to Identify Manual JSON Schema (DO NOT USE):

```typescript
// ❌ FORBIDDEN - Manual JSON Schema
schema: {
  body: {
    type: 'object',
    required: ['companyName'],
    properties: {
      companyName: { type: 'string', minLength: 1 },
      email: { type: 'string', format: 'email' }
    }
  }
}

// ✅ REQUIRED - TypeBox Schema
schema: {
  body: CreateCustomerBodySchema,
  response: { 200: CustomerDetailResponseSchema }
}
```

## 📁 File Organization Standards

### Backend Schema File Naming:
- Use `typeboxSchemas.ts` for modules with complex schemas
- Use `schemas.ts` for simpler modules
- Always export both schemas and TypeScript types

### Frontend Schema File Naming:
- Use component-level schemas directly in form components
- Use `schemas.ts` for shared frontend validation schemas
- Use `contracts/` directory for API contract testing schemas

### Backend Schema File Structure:
```typescript
// Import TypeBox
import { Type, type Static } from '@sinclair/typebox';

// Define schemas (export const)
export const RequestSchema = Type.Object({...});
export const ResponseSchema = Type.Object({...});

// Define TypeScript types (export type)
export type Request = Static<typeof RequestSchema>;
export type Response = Static<typeof ResponseSchema>;
```

### Frontend Component Schema Structure:
```typescript
// Frontend form component with inline schema
import { Type, type Static } from '@sinclair/typebox';

const FormSchema = Type.Object({
  companyName: Type.String({ minLength: 1, maxLength: 255 }),
  email: Type.Optional(Type.String({ format: 'email' }))
});

type FormData = Static<typeof FormSchema>;

export const CustomerForm: React.FC = () => {
  const { register, handleSubmit } = useForm<FormData>();
  // Component implementation
};
```

### Route File Structure:
```typescript
// Import schemas
import { 
  CreateBodySchema,
  ResponseSchema,
  ParamsSchema 
} from './schemas.js';

// Use in route definition
fastify.post('/', {
  schema: {
    body: CreateBodySchema,
    params: ParamsSchema,
    response: { 200: ResponseSchema }
  }
}, async (request, reply) => {
  // TypeScript types are automatically inferred
  const { companyName } = request.body; // ✅ Typed
  const { id } = request.params; // ✅ Typed
});
```

## 🚨 Common Patterns and Best Practices

### Response Wrapper Patterns:
```typescript
// Standard success response
export const StandardSuccessResponseSchema = Type.Object({
  success: Type.Boolean(),
  message: Type.Optional(Type.String())
});

// Data response with pagination
export const PaginatedResponseSchema = <T>(dataSchema: T) => Type.Object({
  success: Type.Boolean(),
  data: Type.Array(dataSchema),
  pagination: Type.Object({
    page: Type.Number(),
    limit: Type.Number(),
    total: Type.Number(),
    pages: Type.Number()
  })
});

// Error response
export const ErrorResponseSchema = Type.Object({
  success: Type.Literal(false),
  error: Type.String(),
  message: Type.String(),
  code: Type.Optional(Type.String())
});
```

### Parameter Validation:
```typescript
// URL parameters
export const IdParamSchema = Type.Object({
  id: Type.String()
});

// Query parameters
export const ListQuerySchema = Type.Object({
  page: Type.Optional(Type.Number({ minimum: 1 })),
  limit: Type.Optional(Type.Number({ minimum: 1, maximum: 100 })),
  search: Type.Optional(Type.String()),
  sortBy: Type.Optional(Type.String()),
  sortOrder: Type.Optional(Type.Union([
    Type.Literal('asc'),
    Type.Literal('desc')
  ]))
});
```

### Frontend-Backend Schema Consistency:
```typescript
// ✅ GOOD: Frontend form schema matches backend validation
// Backend schema (apps/backend/src/modules/customers/schemas.ts)
export const CreateCustomerBodySchema = Type.Object({
  companyName: Type.String({ minLength: 1, maxLength: 255 }),
  email: Type.Optional(Type.String({ format: 'email' }))
});

// Frontend form schema (apps/frontend/src/components/customers/CustomerForm.tsx)
const CustomerFormSchema = Type.Object({
  companyName: Type.String({ minLength: 1, maxLength: 255 }),
  email: Type.Optional(Type.String({ format: 'email' }))
});

// Both use identical validation rules for consistency
```

### Frontend API Integration:
```typescript
// Frontend API call with TypeBox validation
import { Type, type Static } from '@sinclair/typebox';

const ApiResponseSchema = Type.Object({
  success: Type.Boolean(),
  data: CustomerResponseSchema,
  message: Type.Optional(Type.String())
});

type ApiResponse = Static<typeof ApiResponseSchema>;

const createCustomer = async (data: CustomerFormData): Promise<ApiResponse> => {
  const response = await api.post('/customers', data);
  // Validate response matches expected schema
  return response.data;
};
```

## 🚨 Emergency Contact

If you encounter any issues with this policy or need clarification, **DO NOT** make changes that revert TypeBox schemas. Instead, ask for guidance while maintaining the current TypeBox implementation.

---

**Last Updated**: 2025-01-19  
**Status**: ACTIVE - All AI agents must follow this policy  
**Priority**: CRITICAL - Violations will cause system failures  
**Migration**: Replaces ZOD_SCHEMA_POLICY.md - TypeBox is now the standard
