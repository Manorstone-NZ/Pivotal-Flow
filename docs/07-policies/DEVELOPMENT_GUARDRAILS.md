# Development Guardrails Policy

## Overview

This document defines the comprehensive guardrails and controls for Pivotal Flow development, ensuring consistent quality, security, and maintainability across all code contributions.

## Core Development Standards

### **TypeScript Requirements**
- **Strict Mode**: All TypeScript projects must use strict mode configuration
- **No `any` Types**: Explicit typing required for all variables, parameters, and return values
- **No Non-Null Assertions**: Prohibition of `!` operator except in specific, documented cases
- **Strict Null Checks**: All null/undefined handling must be explicit
- **Type Coverage**: Minimum 95% type coverage for all modules

### **Code Quality Standards**
- **ESLint Enforcement**: Zero tolerance for ESLint violations
- **Prettier Formatting**: Consistent code formatting across all files
- **No Console Logs**: No `console.log`, `console.error`, or similar in production code
- **Error Handling**: Comprehensive error handling with proper logging
- **Code Documentation**: JSDoc comments for all public APIs and complex functions

### **Testing Requirements**
- **Unit Tests**: Minimum 80% code coverage for all business logic
- **Integration Tests**: API endpoints and database operations
- **E2E Tests**: Critical user journeys with Playwright
- **Accessibility Tests**: Automated axe testing for all UI components
- **Performance Tests**: Core Web Vitals monitoring and thresholds

## CI/CD Pipeline Guardrails

### **Automated Quality Gates**

#### **Type Checking**
```yaml
# Required for all packages
pnpm --filter @pivotal-flow/shared type-check
pnpm --filter @pivotal-flow/backend type-check
```

#### **Linting & Formatting**
```yaml
# Zero tolerance enforcement
pnpm lint                    # ESLint validation
pnpm format:check           # Prettier formatting check
pnpm run qa:forbid          # Forbidden pattern detection
```

#### **Testing Requirements**
```yaml
# Comprehensive testing suite
pnpm test:unit              # Unit tests with coverage
pnpm test:e2e               # End-to-end testing
pnpm test:accessibility     # Accessibility validation
```

#### **Build Validation**
```yaml
# All packages must build successfully
pnpm --recursive build      # Full build validation
pnpm typecheck              # TypeScript compilation
```

### **Forbidden Patterns Detection**
The `qa:forbid` script automatically detects and fails builds for:
- Use of `any` type
- Non-null assertions (`!`)
- Console logging statements
- Unhandled promises
- Unsafe type assertions

## Security Guardrails

### **Authentication & Authorization**
- **PASETO + Opaque Tokens**: Mandatory use of secure token system
- **Argon2id Hashing**: Password hashing with configurable parameters
- **Session Management**: Redis-based session storage with activity tracking
- **Multi-Factor Authentication**: TOTP support for enhanced security
- **Token Binding**: IP and User-Agent validation for tokens

### **Data Protection**
- **Encryption in Transit**: TLS 1.3 for all communications
- **Encryption at Rest**: Sensitive data encryption in database
- **Input Validation**: TypeBox schema validation for all inputs
- **SQL Injection Prevention**: Parameterized queries with Drizzle ORM
- **XSS Protection**: Content Security Policy and input sanitization

### **Access Control**
- **Role-Based Access Control**: Granular permission system
- **Principle of Least Privilege**: Minimum necessary permissions
- **Audit Logging**: Complete audit trail for all user actions
- **Session Timeout**: Automatic session expiration and renewal

## Database Guardrails

### **Schema Management**
- **Drizzle ORM**: Type-safe database operations
- **Migration Safety**: Automated migration testing and rollback
- **Schema Validation**: Runtime schema validation
- **Data Integrity**: ACID compliance with proper transactions

### **Query Optimization**
- **Indexed Queries**: All queries must use appropriate indexes
- **Connection Pooling**: PgBouncer for efficient connection management
- **Query Analysis**: Regular query performance analysis
- **Slow Query Monitoring**: Automated detection and optimization

### **Backup & Recovery**
- **Automated Backups**: Daily automated backups
- **Point-in-Time Recovery**: Complete recovery capability
- **Backup Testing**: Regular backup restoration testing
- **Data Retention**: Automated data retention policies

## Frontend Guardrails

### **React Best Practices**
- **Functional Components**: Use of functional components and hooks
- **TypeScript Strict**: Strict TypeScript configuration
- **Component Testing**: Comprehensive component testing with React Testing Library
- **Performance Optimization**: Code splitting, lazy loading, memoization
- **Bundle Size Limits**: Maximum bundle size thresholds

### **UI/UX Standards**
- **Accessibility**: WCAG 2.1 AA compliance
- **Responsive Design**: Mobile-first responsive design
- **Browser Compatibility**: Support for all modern browsers
- **Performance Budget**: Core Web Vitals thresholds
- **Design System**: Consistent use of design system components

### **State Management**
- **React Query**: Server state management
- **Zustand**: Client state management
- **Error Boundaries**: Comprehensive error handling
- **Loading States**: Proper loading and error state management

## API Guardrails

### **RESTful Design**
- **HTTP Standards**: Proper HTTP status codes and methods
- **API Versioning**: Semantic versioning for API changes
- **Rate Limiting**: Per-user and per-endpoint rate limits
- **Error Handling**: Consistent error response structure
- **Documentation**: OpenAPI 3.0 specification

### **Validation & Security**
- **TypeBox Schemas**: Runtime schema validation
- **Input Sanitization**: Comprehensive input validation
- **CORS Protection**: Strict origin validation
- **Authentication**: Bearer token authentication
- **Authorization**: Role-based endpoint protection

### **Performance Standards**
- **Response Times**: Sub-200ms for 95% of requests
- **Caching Strategy**: Redis caching for frequently accessed data
- **Database Optimization**: Efficient queries and connection pooling
- **Monitoring**: Comprehensive API performance monitoring

## Operational Guardrails

### **Docker Standards**
- **Multi-Stage Builds**: Optimized container images
- **Security Scanning**: Automated vulnerability scanning
- **Minimal Base Images**: Alpine Linux for reduced attack surface
- **Health Checks**: Comprehensive health check endpoints
- **Resource Limits**: Proper CPU and memory limits

### **Environment Management**
- **Environment Separation**: Clear dev/staging/production separation
- **Configuration Management**: Environment-specific configuration
- **Secrets Management**: Secure secrets storage and rotation
- **Infrastructure as Code**: Docker Compose and configuration management

### **Monitoring & Logging**
- **Structured Logging**: JSON-formatted logs with correlation IDs
- **Metrics Collection**: Prometheus metrics for all services
- **Alerting**: Proactive alerting for critical issues
- **Dashboards**: Grafana dashboards for system monitoring

## Quality Assurance Guardrails

### **Code Review Process**
- **Mandatory Reviews**: All changes require peer review
- **Review Criteria**: Security, performance, maintainability
- **Automated Checks**: CI/CD pipeline validation
- **Documentation**: Updated documentation for all changes

### **Testing Strategy**
- **Test Pyramid**: Unit, integration, and E2E test balance
- **Test Automation**: Automated test execution in CI/CD
- **Test Data**: Safe and realistic test data management
- **Performance Testing**: Load testing and benchmarking

### **Continuous Improvement**
- **Metrics Tracking**: Code quality metrics and trends
- **Regular Reviews**: Monthly quality review and improvement
- **Training**: Regular developer training and certification
- **Tool Updates**: Regular updates to development tools

## Enforcement Mechanisms

### **Automated Enforcement**
- **Pre-commit Hooks**: Local validation before commits
- **CI/CD Pipeline**: Automated validation in build pipeline
- **Quality Gates**: Blocking deployments for quality failures
- **Security Scanning**: Automated security vulnerability detection

### **Manual Enforcement**
- **Code Reviews**: Human validation of all changes
- **Regular Audits**: Monthly code quality audits
- **Training Programs**: Developer education and certification
- **Incident Response**: Quality issue resolution procedures

## Compliance & Reporting

### **Quality Metrics**
- **Code Coverage**: Minimum 80% test coverage
- **Type Coverage**: Minimum 95% TypeScript coverage
- **Security Score**: Automated security assessment
- **Performance Metrics**: Core Web Vitals compliance

### **Regular Reporting**
- **Weekly Quality Reports**: Code quality trends and issues
- **Monthly Security Reviews**: Security assessment and remediation
- **Quarterly Architecture Reviews**: System architecture evaluation
- **Annual Compliance Audit**: Comprehensive compliance assessment

## Exceptions & Escalation

### **Exception Process**
- **Documented Exceptions**: All exceptions must be documented
- **Approval Required**: Senior developer approval for exceptions
- **Time-Limited**: Exceptions must have resolution timeline
- **Regular Review**: Exception review and remediation

### **Escalation Procedures**
- **Quality Issues**: Escalation to technical lead
- **Security Concerns**: Immediate escalation to security team
- **Performance Problems**: Escalation to DevOps team
- **Compliance Violations**: Escalation to governance team

---

## Quick Reference

### **Essential Commands**
```bash
# Quality checks
pnpm qa:check              # Full quality check
pnpm qa:forbid             # Forbidden pattern detection
pnpm typecheck             # TypeScript validation
pnpm lint                  # ESLint validation
pnpm test:unit             # Unit tests
pnpm test:e2e              # E2E tests

# Build validation
pnpm build                 # Full build
pnpm ci:full               # Complete CI pipeline
pnpm ci:comprehensive      # Comprehensive testing
```

### **Quality Thresholds**
- **Type Coverage**: ≥95%
- **Test Coverage**: ≥80%
- **Build Time**: <5 minutes
- **Bundle Size**: <2MB (frontend)
- **API Response**: <200ms (95th percentile)

---

*Policy Owner: Development Team*
*Last Updated: December 2024*
*Next Review: March 2025*
