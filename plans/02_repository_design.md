# Pivotal Flow - Repository Design & Structure

## 🏗️ **Monorepo Architecture Overview**

### **Repository Structure**
```
pivotal-flow/
├── apps/                          # Application packages
│   ├── backend/                   # Backend API service
│   ├── frontend/                  # React frontend application
│   └── admin/                     # Admin dashboard (future)
├── packages/                      # Shared packages
│   ├── shared/                    # Common types and utilities
│   ├── database/                  # Database schemas and migrations
│   ├── api-client/                # Generated API client
│   └── ui-components/             # Reusable UI component library
├── infra/                         # Infrastructure configuration
│   ├── docker/                    # Docker configurations
│   ├── k8s/                       # Kubernetes manifests
│   ├── terraform/                 # Infrastructure as code
│   └── monitoring/                # Monitoring stack configs
├── docs/                          # Documentation
│   ├── specs/                     # Specification documents
│   ├── api/                       # API documentation
│   └── guides/                    # Development guides
├── scripts/                       # Build and deployment scripts
├── tests/                         # End-to-end and integration tests
└── tools/                         # Development tools and utilities
```

---

## 📦 **Package Structure & Boundaries**

### **1. Apps Directory**

#### **Backend Application (`apps/backend/`)**
```
apps/backend/
├── src/
│   ├── config/                    # Configuration management
│   ├── middleware/                # Fastify middleware
│   ├── routes/                    # API route definitions
│   ├── services/                  # Business logic services
│   ├── repositories/              # Data access layer
│   ├── models/                    # Data models and schemas
│   ├── utils/                     # Utility functions
│   ├── types/                     # TypeScript type definitions
│   ├── events/                    # Event handling system
│   ├── auth/                      # Authentication & authorization
│   └── server.ts                  # Application entry point
├── prisma/                        # Database schema and migrations
├── tests/                         # Backend-specific tests
├── package.json                   # Backend dependencies
└── tsconfig.json                  # TypeScript configuration
```

**Package Boundaries**:
- **Internal Dependencies**: Can import from `packages/shared`, `packages/database`
- **External Dependencies**: Fastify, Prisma, validation libraries
- **Exports**: API endpoints, business logic services

#### **Frontend Application (`apps/frontend/`)**
```
apps/frontend/
├── src/
│   ├── components/                # React components
│   │   ├── ui/                    # Base UI components
│   │   ├── forms/                 # Form components
│   │   ├── layout/                # Layout components
│   │   └── business/              # Business-specific components
│   ├── pages/                     # Page components
│   ├── hooks/                     # Custom React hooks
│   ├── stores/                    # State management (Zustand)
│   ├── services/                  # API service layer
│   ├── utils/                     # Utility functions
│   ├── types/                     # TypeScript type definitions
│   ├── styles/                    # Global styles and Tailwind config
│   └── main.tsx                   # Application entry point
├── public/                        # Static assets
├── tests/                         # Frontend-specific tests
├── package.json                   # Frontend dependencies
└── tsconfig.json                  # TypeScript configuration
```

**Package Boundaries**:
- **Internal Dependencies**: Can import from `packages/shared`, `packages/ui-components`
- **External Dependencies**: React, Vite, Tailwind CSS, state management libraries
- **Exports**: React components, hooks, utilities

---

### **2. Packages Directory**

#### **Shared Package (`packages/shared/`)**
```
packages/shared/
├── src/
│   ├── types/                     # Common TypeScript types
│   │   ├── api/                   # API request/response types
│   │   ├── entities/              # Business entity types
│   │   ├── common/                # Common utility types
│   │   └── index.ts               # Type exports
│   ├── constants/                 # Application constants
│   ├── enums/                     # Enumerated values
│   ├── utils/                     # Shared utility functions
│   ├── validation/                # Validation schemas (Zod)
│   └── index.ts                   # Package exports
├── package.json                   # Package configuration
└── tsconfig.json                  # TypeScript configuration
```

**Package Boundaries**:
- **Internal Dependencies**: None (base package)
- **External Dependencies**: Zod for validation, date-fns for date handling
- **Exports**: Types, constants, utilities, validation schemas

#### **Database Package (`packages/database/`)**
```
packages/database/
├── src/
│   ├── schema/                    # Database schema definitions
│   ├── migrations/                # Database migration scripts
│   ├── seeds/                     # Seed data scripts
│   ├── indexes/                   # Database index definitions
│   ├── constraints/               # Database constraint definitions
│   └── index.ts                   # Package exports
├── prisma/                        # Prisma configuration
├── package.json                   # Package configuration
└── tsconfig.json                  # TypeScript configuration
```

**Package Boundaries**:
- **Internal Dependencies**: Can import from `packages/shared`
- **External Dependencies**: Prisma, PostgreSQL client
- **Exports**: Database schemas, migration utilities, seed data

#### **UI Components Package (`packages/ui-components/`)**
```
packages/ui-components/
├── src/
│   ├── components/                # Reusable UI components
│   │   ├── Button/                # Button component
│   │   ├── Input/                 # Input component
│   │   ├── Modal/                 # Modal component
│   │   ├── Table/                 # Data table component
│   │   └── index.ts               # Component exports
│   ├── hooks/                     # Component-specific hooks
│   ├── utils/                     # Component utilities
│   ├── styles/                    # Component styles
│   └── index.ts                   # Package exports
├── package.json                   # Package configuration
└── tsconfig.json                  # TypeScript configuration
```

**Package Boundaries**:
- **Internal Dependencies**: Can import from `packages/shared`
- **External Dependencies**: React, Tailwind CSS, Headless UI
- **Exports**: React components, hooks, utilities

---

## 🔗 **Path Aliases & Import Strategy**

### **1. Backend Path Aliases**
```json
// apps/backend/tsconfig.json
{
  "compilerOptions": {
    "baseUrl": "./src",
    "paths": {
      "@/*": ["*"],
      "@config/*": ["config/*"],
      "@middleware/*": ["middleware/*"],
      "@routes/*": ["routes/*"],
      "@services/*": ["services/*"],
      "@repositories/*": ["repositories/*"],
      "@models/*": ["models/*"],
      "@utils/*": ["utils/*"],
      "@types/*": ["types/*"],
      "@events/*": ["events/*"],
      "@auth/*": ["auth/*"],
      "@shared/*": ["../../packages/shared/src/*"],
      "@database/*": ["../../packages/database/src/*"]
    }
  }
}
```

**Import Examples**:
```typescript
// Internal imports
import { UserService } from '@services/UserService';
import { validateUser } from '@utils/validation';

// Package imports
import { User, CreateUserRequest } from '@shared/types';
import { DatabaseConnection } from '@database/connection';
```

### **2. Frontend Path Aliases**
```json
// apps/frontend/tsconfig.json
{
  "compilerOptions": {
    "baseUrl": "./src",
    "paths": {
      "@/*": ["*"],
      "@components/*": ["components/*"],
      "@pages/*": ["pages/*"],
      "@hooks/*": ["hooks/*"],
      "@stores/*": ["stores/*"],
      "@services/*": ["services/*"],
      "@utils/*": ["utils/*"],
      "@types/*": ["types/*"],
      "@styles/*": ["styles/*"],
      "@shared/*": ["../../packages/shared/src/*"],
      "@ui/*": ["../../packages/ui-components/src/*"]
    }
  }
}
```

**Import Examples**:
```typescript
// Internal imports
import { UserList } from '@components/business/UserList';
import { useAuth } from '@hooks/useAuth';

// Package imports
import { User, CreateUserRequest } from '@shared/types';
import { Button, Modal } from '@ui/components';
```

### **3. Shared Package Path Aliases**
```json
// packages/shared/tsconfig.json
{
  "compilerOptions": {
    "baseUrl": "./src",
    "paths": {
      "@/*": ["*"],
      "@types/*": ["types/*"],
      "@constants/*": ["constants/*"],
      "@enums/*": ["enums/*"],
      "@utils/*": ["utils/*"],
      "@validation/*": ["validation/*"]
    }
  }
}
```

---

## 📁 **File Organization & Naming Conventions**

### **1. File Naming Standards**
```
# Component files
UserProfile.tsx                    # PascalCase for components
user-profile.module.css            # kebab-case for CSS modules
UserProfile.test.tsx               # Test files with .test suffix

# Service files
UserService.ts                     # PascalCase for services
user.service.ts                    # Alternative: kebab-case with .service suffix
user.service.test.ts               # Test files

# Type files
User.types.ts                      # PascalCase with .types suffix
user.types.ts                      # Alternative: kebab-case with .types suffix

# Utility files
dateUtils.ts                       # camelCase with descriptive suffix
validation.ts                      # Simple descriptive names
```

### **2. Directory Organization**
```
# Feature-based organization
src/
├── features/                      # Feature-based organization
│   ├── users/                     # User management feature
│   │   ├── components/            # User-specific components
│   │   ├── services/              # User business logic
│   │   ├── types/                 # User type definitions
│   │   └── utils/                 # User utilities
│   ├── projects/                  # Project management feature
│   └── quotes/                    # Quotation system feature

# Layer-based organization (alternative)
src/
├── layers/                        # Layer-based organization
│   ├── presentation/              # UI components and pages
│   ├── business/                  # Business logic and services
│   ├── data/                      # Data access and repositories
│   └── infrastructure/            # Configuration and utilities
```

---

## 🔒 **Access Control & Boundaries**

### **1. Package Access Matrix**
| Package | Can Import From | Can Be Imported By | Restrictions |
|---------|----------------|-------------------|--------------|
| `packages/shared` | None | All packages | Base package, no external deps |
| `packages/database` | `packages/shared` | `apps/backend` | Database operations only |
| `packages/ui-components` | `packages/shared` | `apps/frontend` | UI components only |
| `apps/backend` | `packages/shared`, `packages/database` | None | Backend application |
| `apps/frontend` | `packages/shared`, `packages/ui-components` | None | Frontend application |

### **2. Import Restrictions**
```typescript
// ✅ Allowed imports
import { User } from '@shared/types';                    // Shared types
import { Button } from '@ui/components';                 // UI components
import { DatabaseConnection } from '@database/connection'; // Database utilities

// ❌ Forbidden imports
import { UserService } from '@backend/services';         // Backend services in frontend
import { UserComponent } from '@frontend/components';    // Frontend components in backend
import { DatabaseSchema } from '@database/schema';       // Database in frontend
```

---

## 📊 **File Size & Complexity Limits**

### **1. File Size Limits**
```
# Maximum file sizes
- TypeScript files: 250 lines
- React components: 200 lines
- Service files: 300 lines
- Test files: 400 lines
- Configuration files: 100 lines

# Enforcement
- ESLint rule: max-lines
- Pre-commit hook validation
- CI/CD pipeline checks
```

### **2. Function Complexity Limits**
```
# Maximum function sizes
- Business logic functions: 50 lines
- Utility functions: 30 lines
- Component functions: 40 lines
- Test functions: 60 lines

# Enforcement
- ESLint rule: max-lines-per-function
- Code review process
- Automated complexity analysis
```

---

## 🚀 **Build & Development Configuration**

### **1. Root Package Configuration**
```json
// package.json (root)
{
  "name": "pivotal-flow",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "dev": "pnpm run --parallel dev",
    "build": "pnpm run --recursive build",
    "test": "pnpm run --recursive test",
    "lint": "pnpm run --recursive lint",
    "type-check": "pnpm run --recursive type-check",
    "clean": "pnpm run --recursive clean"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "eslint": "^8.54.0",
    "prettier": "^3.1.0",
    "husky": "^8.0.0",
    "lint-staged": "^15.1.0"
  }
}
```

### **2. Workspace Configuration**
```yaml
# pnpm-workspace.yaml
packages:
  - 'apps/*'
  - 'packages/*'
  - 'tools/*'
  - 'scripts/*'
```

### **3. TypeScript Project References**
```json
// tsconfig.base.json (root)
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "node",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "references": [
    { "path": "./packages/shared" },
    { "path": "./packages/database" },
    { "path": "./packages/ui-components" },
    { "path": "./apps/backend" },
    { "path": "./apps/frontend" }
  ]
}
```

---

## 📋 **Implementation Checklist**

### **Phase 1: Repository Structure**
- [ ] Create monorepo directory structure
- [ ] Set up pnpm workspaces
- [ ] Configure TypeScript project references
- [ ] Set up path aliases for all packages

### **Phase 2: Package Configuration**
- [ ] Configure individual package.json files
- [ ] Set up TypeScript configurations
- [ ] Configure ESLint and Prettier
- [ ] Set up build and test scripts

### **Phase 3: Development Environment**
- [ ] Configure development scripts
- [ ] Set up hot reloading
- [ ] Configure debugging tools
- [ ] Set up code quality tools

### **Phase 4: CI/CD Integration**
- [ ] Configure build pipelines
- [ ] Set up testing automation
- [ ] Configure deployment scripts
- [ ] Set up monitoring and alerting

---

**Document Version**: 1.0  
**Last Updated**: January 2025  
**Next Review**: February 2025  
**Repository Design Version**: 1.0.0

