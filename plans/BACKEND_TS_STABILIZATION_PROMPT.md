# Backend TypeScript Stabilization Agent

## 🎯 **Mission: Fix Backend TypeScript Errors to Unblock Frontend Development**

You are the **Backend TypeScript Stabilization Agent**. Your mission is to resolve all TypeScript compilation errors in the backend to unblock frontend development for the FE1 Frontend Delivery epic.

## 📊 **Current State**

**Critical Issue**: 100+ TypeScript compilation errors blocking frontend development
**Root Cause**: Incomplete TypeBox migration from Zod
**Impact**: Frontend development cannot proceed until backend is stable

## 🚨 **Priority Errors to Fix**

### **1. TypeBox Migration Issues**
- **File**: `apps/backend/src/lib/pagination.ts`
- **Errors**: 50+ TypeBox syntax errors
- **Issue**: Incorrect TypeBox syntax (e.g., `Type.optional` should be `Type.Optional`)
- **Fix**: Update all TypeBox schema definitions to correct syntax

### **2. Zod References Still Present**
- **Files**: Multiple route files still importing/using Zod
- **Errors**: `Cannot find name 'z'` throughout codebase
- **Fix**: Complete migration from Zod to TypeBox

### **3. Service Layer Typing Issues**
- **Files**: `apps/backend/src/modules/quotes/service.ts`, `apps/backend/src/modules/rate-cards/service.ts`
- **Errors**: Mock implementations need proper typing
- **Fix**: Add proper TypeScript types to service methods

### **4. Schema Validation Errors**
- **Files**: Multiple route files
- **Errors**: TypeBox schema validation syntax errors
- **Fix**: Correct TypeBox schema definitions

## 🛠 **Technical Requirements**

### **TypeScript Compliance**
- **Zero compilation errors**: `pnpm -w typecheck` must pass
- **Strict typing**: No `any` types allowed
- **TypeBox syntax**: Correct TypeBox schema definitions
- **Service typing**: Proper return types for all service methods

### **Contract Safety**
- **Contract tests must remain green**: E7 contract safety cannot be broken
- **API compatibility**: Maintain existing API contracts
- **Schema validation**: TypeBox validation must work correctly

## 📋 **Implementation Plan**

### **Phase 1: TypeBox Syntax Fixes (Priority 1)**
1. **Fix `apps/backend/src/lib/pagination.ts`**
   - Replace `Type.optional` with `Type.Optional`
   - Replace `Type.string` with `Type.String`
   - Replace `Type.number` with `Type.Number`
   - Replace `Type.boolean` with `Type.Boolean`
   - Replace `Type.enum` with `Type.Union`
   - Fix all TypeBox schema definitions

2. **Fix TypeBox format references**
   - Replace `Type.uuid` with `Type.String({ format: 'uuid' })`
   - Replace `Type.datetime` with `Type.String({ format: 'date-time' })`
   - Replace `Type.email` with `Type.String({ format: 'email' })`

### **Phase 2: Complete Zod Migration (Priority 2)**
1. **Remove all Zod imports**
   - Find and replace all `import { z } from 'zod'`
   - Replace with `import { Type } from '@sinclair/typebox'`

2. **Update schema definitions**
   - Replace `z.object()` with `Type.Object()`
   - Replace `z.string()` with `Type.String()`
   - Replace `z.number()` with `Type.Number()`
   - Replace `z.boolean()` with `Type.Boolean()`
   - Replace `z.array()` with `Type.Array()`

3. **Fix error handling**
   - Remove `z.ZodError` references
   - Update error handling to use TypeBox validation

### **Phase 3: Service Layer Typing (Priority 3)**
1. **Fix QuoteService typing**
   - Add proper return types for all methods
   - Fix mock implementation types
   - Ensure type compatibility with tests

2. **Fix RateCardService typing**
   - Add proper return types for all methods
   - Fix mock implementation types
   - Ensure type compatibility with tests

### **Phase 4: Test Compatibility (Priority 4)**
1. **Fix integration tests**
   - Update test expectations to match new service types
   - Fix mock data types
   - Ensure all tests pass

2. **Fix service tests**
   - Update test assertions
   - Fix mock implementations
   - Ensure type compatibility

## 🔧 **Development Commands**

### **Backend Development**
```bash
# Start backend server
cd apps/backend && pnpm dev

# Run TypeScript check
pnpm -w typecheck

# Run backend tests
cd apps/backend && pnpm test

# Run contract tests
cd apps/frontend && pnpm vitest run tests/contracts/api-contracts.test.ts
```

### **Quality Gates**
- `pnpm -w typecheck` - Zero TypeScript errors
- `pnpm -w lint` - Zero ESLint violations
- Contract tests - All passing
- Backend tests - All passing

## 📁 **Key Files to Fix**

### **High Priority**
1. `apps/backend/src/lib/pagination.ts` - 50+ TypeBox syntax errors
2. `apps/backend/src/modules/quotes/service.ts` - Service typing issues
3. `apps/backend/src/modules/rate-cards/service.ts` - Service typing issues
4. `apps/backend/src/routes/health.ts` - TypeBox schema errors
5. `apps/backend/src/routes/metrics.ts` - Zod references
6. `apps/backend/src/routes/perf.ts` - Zod references

### **Medium Priority**
1. `apps/backend/src/modules/approvals/routes.ts` - Zod references
2. `apps/backend/src/plugins/cache.plugin.ts` - Zod references
3. `apps/backend/src/modules/quotes/routes.*.ts` - TypeBox imports
4. `apps/backend/src/modules/rate-cards/routes.*.ts` - TypeBox imports

### **Low Priority**
1. Test files with type compatibility issues
2. Unused imports and variables
3. Minor TypeScript warnings

## 🎯 **Success Criteria**

### **Must Have**
- ✅ Zero TypeScript compilation errors
- ✅ All contract tests passing
- ✅ Backend server starts without errors
- ✅ API endpoints respond correctly

### **Should Have**
- ✅ All backend tests passing
- ✅ Proper TypeScript types throughout
- ✅ Clean code with no unused imports
- ✅ Consistent TypeBox usage

### **Nice to Have**
- ✅ Improved error messages
- ✅ Better type safety
- ✅ Performance optimizations
- ✅ Code documentation

## 🚨 **Critical Constraints**

1. **Do NOT break contract tests** - E7 contract safety must remain intact
2. **Do NOT change API contracts** - Maintain existing API compatibility
3. **Do NOT remove functionality** - All existing features must work
4. **Do NOT introduce new dependencies** - Use existing TypeBox setup

## 📞 **Coordination**

- **Frontend Agent**: Working on components, Storybook, UX, accessibility, performance
- **Your Focus**: Backend TypeScript stabilization only
- **Communication**: Update when backend is stable and ready for frontend development

## 🚀 **Expected Outcome**

Once complete, the backend will be:
- ✅ TypeScript error-free
- ✅ Contract-safe with E7
- ✅ Ready for frontend development
- ✅ Properly typed throughout
- ✅ Maintainable and stable

**Timeline**: 2-4 hours to complete all fixes
**Priority**: CRITICAL - Blocking frontend development

---

*Backend TypeScript Stabilization Agent - Ready for deployment* 🛠️
