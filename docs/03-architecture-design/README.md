# Architecture & Design

This section contains technical architecture and system design documentation for Pivotal Flow.

## Contents

- High-level architecture diagrams and specifications
- System design documentation
- API design and documentation
- Security architecture and threat models
- Database design and schema
- Integration specifications

## Documents

### System Architecture
- [Current Architecture Status](./CURRENT_ARCHITECTURE_STATUS.md) - **CONFIRMED** Current system architecture and security model
- [System Architecture](./system-architecture.md) - Comprehensive technical architecture overview
- [Authentication System](./AUTHENTICATION_SYSTEM.md) - PASETO + Opaque token security architecture
- [Multi-Tenant RBAC](./MULTI_TENANT_RBAC.md) - Multi-tenant security and access control

### API Design
- [API Design](./07_API_DESIGN.md) - RESTful API specifications and standards
- [OpenAPI Documentation](./OPENAPI.md) - Complete API documentation
- [Paging and Filters](./PAGING_AND_FILTERS.md) - API pagination and filtering standards

### Database Design
- [Database Schema Reference](./DATABASE_SCHEMA_REFERENCE.md) - Complete database schema documentation
- [Database Schema](./06_DATABASE_SCHEMA.md) - Database design specifications
- [JSONB Decision Matrix](./JSONB_DECISION_MATRIX_IMPLEMENTATION.md) - JSONB implementation decisions

### Architecture Decision Records
- [Database Indexes](./00_deck_indexes.md) - Database indexing strategy
- [Query Tuning](./01_query_tuning.md) - Database query optimization
- [Rounding and Tax](./02_rounding_and_tax.md) - Financial calculation rules
- [Multi-Currency](./03_multi_currency.md) - Currency handling architecture

### Microservices & Integration
- [Microservices Design](./08_MICROSERVICES_DESIGN.md) - Microservices architecture
- [Integration Specifications](./05_INTEGRATION_SPECIFICATIONS.md) - External system integrations
- [Integration Workflows](./20_INTEGRATION_WORKFLOWS.md) - Integration process workflows

### Frontend Architecture
- [Frontend Architecture](./12_FRONTEND_ARCHITECTURE.md) - React application architecture
- [UI Design System](./11_UI_DESIGN_SYSTEM.md) - User interface design system
- [Icon System Implementation](./ICON_SYSTEM_IMPLEMENTATION_GUIDE.md) - Icon system architecture

### Testing & Quality
- [Testing Strategy](./13_TESTING_STRATEGY.md) - Comprehensive testing approach
- [Quality Assurance](./14_QUALITY_ASSURANCE.md) - QA processes and standards

### Business Logic
- [Business Rules & Calculations](./17_BUSINESS_RULES_CALCULATIONS.md) - Business logic specifications
- [Quotation System Specs](./17_QUOTATION_SYSTEM_SPECS.md) - Quote management specifications
- [Customer Journey Maps](./18_CUSTOMER_JOURNEY_MAPS.md) - User experience flows
- [Data Processing & BI](./19_DATA_PROCESSING_BUSINESS_INTELLIGENCE.md) - Analytics architecture

### Project Management
- [Project Management Specs](./09_PROJECT_MANAGEMENT_SPECS.md) - Project management features
- [Time Management Specs](./10_TIME_MANAGEMENT_SPECS.md) - Time tracking specifications
- [User Management Specs](./16_USER_MANAGEMENT_SPECS.md) - User administration features

### Implementation Status
- [F1 Implementation Status](./F1_IMPLEMENTATION_STATUS_REPORT.md) - Multi-tenant implementation progress
- [F1 Phase 2 Complete](./F1_PHASE_2_COMPLETE_REPORT.md) - Phase 2 completion summary
- [F1 Multitenant Safety Analysis](./F1_multitenant_safety_analysis.md) - Security analysis
- [Implementation Summary](./IMPLEMENTATION_SUMMARY.md) - Overall implementation status

### Infrastructure
- [Infrastructure Plan](./04_INFRASTRUCTURE_PLAN.md) - Infrastructure design and requirements
- [Technology Stack](./03_TECHNOLOGY_STACK.md) - Technology choices and rationale

### Specialized Documentation
- [Xero Mapping Guide](./XERO_MAPPING_GUIDE.md) - Xero integration mapping
- [Company Name Update](./COMPANY_NAME_UPDATE_SUMMARY.md) - Branding updates
- [License Update Summary](./LICENSE_UPDATE_SUMMARY.md) - Licensing changes
- [AI Coding Agent Instructions](./23_AI_CODING_AGENT_INSTRUCTIONS.md) - AI development guidelines
- [Background Jobs](./BACKGROUND_JOBS.md) - Background job processing architecture
- [Token Security Comparison](./Token-Security-Comparison.md) - JWT vs PASETO security analysis

### API Documentation
- [Backend API Documentation](./backend/QUOTES_API_DOCUMENTATION.md) - Detailed API specs

## Audience

**Primary:** Architects, developers, security reviewers, technical leads
**Secondary:** DevOps engineers, QA engineers, business analysts

---

*Last Updated: December 2024*
*Next Review: March 2025*