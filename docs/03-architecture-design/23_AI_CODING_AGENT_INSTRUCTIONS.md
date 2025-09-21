# Pivotal Flow - AI Coding Agent Instructions

## 🎯 **AI Agent Instructions - How to Build & Compile the Application**

### **Your Mission**
Build and compile the Pivotal Flow application using the specifications from previous documents.

### **Technology Stack**
- React 18+, TypeScript 5+, Node.js 20+, Fastify 4+, PostgreSQL 16+
- Monorepo with frontend/backend services
- Prisma ORM, Vite 5+, Turborepo, Docker

---

## 🚀 **Quick Start Commands**

### **1. Environment Setup**
```bash
# Install tools
npm install -g pnpm typescript prisma eslint prettier

# Check versions
node --version  # Must be 20+
docker --version
docker compose version
```

### **2. Create Project Structure**
```bash
mkdir pivotal-flow && cd pivotal-flow
git init

# Create monorepo structure
mkdir -p apps/{frontend,backend} packages/{shared,ui} docs config scripts

# Initialize root package.json
pnpm init
pnpm add -D turbo typescript @types/node
```

### **3. Backend Setup**
```bash
cd apps/backend

# Create package.json with dependencies
pnpm add fastify @fastify/cors @fastify/helmet @fastify/jwt prisma @prisma/client bcryptjs jsonwebtoken zod dotenv
pnpm add -D typescript tsx vitest eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser

# Create tsconfig.json, .eslintrc.js, prisma/schema.prisma
# Install dependencies
pnpm install
```

### **4. Frontend Setup**
```bash
cd ../frontend

# Create package.json with dependencies
pnpm add react react-dom react-router-dom @tanstack/react-query zustand react-hook-form zod
pnpm add -D @vitejs/plugin-react typescript vite tailwindcss postcss autoprefixer

# Create vite.config.ts, tsconfig.json, tailwind.config.js
# Install dependencies
pnpm install
```

### **5. Docker Setup**
```bash
# Create docker-compose.yml with postgres, redis, backend, frontend
# Create Dockerfiles for backend and frontend
docker compose up -d
```

---

## 🔧 **Build Commands**

### **Development**
```bash
# Start all services
docker compose up -d

# Backend development
cd apps/backend
pnpm dev

# Frontend development
cd apps/frontend
pnpm dev
```

### **Production Build**
```bash
# Build all services
pnpm build

# Build individual services
cd apps/backend && pnpm build
cd apps/frontend && pnpm build

# Docker production build
docker compose -f docker-compose.prod.yml build
```

---

## 🧪 **Testing Commands**

```bash
# Run all tests
pnpm test

# Backend tests
cd apps/backend && pnpm test

# Frontend tests
cd apps/frontend && pnpm test

# Linting
pnpm lint

# Type checking
pnpm type-check
```

---

## 📋 **Implementation Checklist**

### **Phase 1: Core Setup (Week 1)**
- [ ] Project structure created
- [ ] Dependencies installed
- [ ] Basic configurations set
- [ ] Docker services running

### **Phase 2: Backend API (Week 2)**
- [ ] Database schema implemented
- [ ] Basic CRUD endpoints
- [ ] Authentication system
- [ ] API documentation

### **Phase 3: Frontend UI (Week 3)**
- [ ] Basic components
- [ ] Routing setup
- [ ] State management
- [ ] API integration

### **Phase 4: Testing & Quality (Week 4)**
- [ ] Unit tests passing
- [ ] Integration tests
- [ ] Linting clean
- [ ] Type checking passes

---

## 🎯 **Success Criteria**

- ✅ Application builds without errors
- ✅ Database connects successfully
- ✅ Backend API responds to requests
- ✅ Frontend loads and displays content
- ✅ All tests pass
- ✅ No linting errors
- ✅ Type checking passes

---

**Document Version**: 1.0  
**Last Updated**: January 2025  
**Next Review**: February 2025  
**AI Coding Agent Instructions Version**: 1.0.0
