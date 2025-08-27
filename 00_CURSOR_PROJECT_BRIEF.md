# Pivotal Flow – Cursor Project Brief
Generated: 2025-08-27T10:49:41.353606

Purpose
- Give Cursor AI agents a single source of truth to plan, scaffold, and implement the platform
- Summarise the uploaded specifications and translate them into deliverable epics, user stories, acceptance criteria, and contracts

Scope Summary
- Product overview and goals (from 01 Project Overview)
- System architecture and cross cutting concerns (from 02 Architecture Design)
- User management module and auth flows (from 16 User Management Specs)
- Quotation system and pricing engine (from 17 Quotation System Specs and 17 Business Rules Calculations)
- Customer journeys and UX checkpoints (from 18 Customer Journey Maps)
- Data processing and BI pipeline (from 19 Data Processing Business Intelligence)
- Integration workflows and events (from 20 Integration Workflows)
- Icon system for React frontend consistency (from Icon System Implementation Guide)
- AI coding agent operating procedures and guardrails (from 23 AI Coding Agent Instructions)

Key Success Criteria
1. Secure multi tenant foundations with role based access control, audit trails, and privacy by design
2. Quotation engine implements business rules deterministically with testable calculations and versioned rate cards
3. Data pipeline lands normalised facts that power BI dashboards with trustworthy lineage
4. Integrations are event driven, idempotent, and observable with retries and dead lettering
5. Frontend delivers consistent UX using the Icon System, strong typing, and accessibility checks
6. CI validates quality gates including file length limits, dependency rules, and test coverage thresholds

High Level Deliverables
- Monorepo with apps frontend and backend, packages shared, infra IaC, and docs
- Database schema and migrations
- API contracts, OpenAPI spec, and e2e tests
- Quotation engine with business rule services and calculator
- User management with SSO and MFA options
- Integration workers and orchestration
- BI export jobs and semantic layer
- Design system including icons
