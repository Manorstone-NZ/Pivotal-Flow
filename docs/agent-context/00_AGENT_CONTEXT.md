You are an enterprise-grade coding agent working on the Pivotal Flow platform.

## Project Status: APPROVED FOR IMPLEMENTATION 🚦

### **Approval Status: 94% Complete (15/16 Items)**
- ✅ **Technical Architecture**: 100% approved (Node.js 20 LTS, Prisma, JWT, Hybrid business logic)
- ✅ **Technical Configuration**: 100% approved (File limits, Testing thresholds, Prisma Migrate)
- ✅ **Implementation Scope**: 100% approved (MVP features, Integration priorities)
- ✅ **Business Rules**: 100% approved (Tax, Discount, Time tracking workflows)
- ✅ **Risk Mitigation**: 100% approved (All critical risks mitigated)
- ⏳ **Overall Project**: Pending final approval

### **Implementation Readiness: GO**
All critical decisions have been approved and the project is ready to begin implementation.

## Source of truth
Use ONLY the documents in `docs/specs/` as the requirements. Never invent features, flows, or rules. Always cross-check with these docs before generating code:

- 01_PROJECT_OVERVIEW.md
- 02_ARCHITECTURE_DESIGN.md
- 03_TECHNOLOGY_STACK.md
- 04_INFRASTRUCTURE_PLAN.md
- 05_INTEGRATION_SPECIFICATIONS.md
- 06_DATABASE_SCHEMA.md
- 07_API_DESIGN.md
- 08_MICROSERVICES_DESIGN.md
- 09_PROJECT_MANAGEMENT_SPECS.md
- 10_TIME_MANAGEMENT_SPECS.md
- 11_UI_DESIGN_SYSTEM.md
- 12_FRONTEND_ARCHITECTURE.md
- 13_TESTING_STRATEGY.md
- 14_QUALITY_ASSURANCE.md
- 16_USER_MANAGEMENT_SPECS.md
- 17_BUSINESS_RULES_CALCULATIONS.md
- 17_QUOTATION_SYSTEM_SPECS.md
- 18_CUSTOMER_JOURNEY_MAPS.md
- 19_DATA_PROCESSING_BUSINESS_INTELLIGENCE.md
- 20_INTEGRATION_WORKFLOWS.md
- 23_AI_CODING_AGENT_INSTRUCTIONS.md
- ICON_SYSTEM_IMPLEMENTATION_GUIDE.md

## Core rules
- Typescript end-to-end (frontend + backend + shared)
- All calculations run server-side only
- No business logic in the UI — UI may render, validate input, and call APIs
- File length ≤ 250 lines, function length ≤ 50 lines (APPROVED: Strict enforcement with CI/CD)
- Must generate tests (unit, integration, e2e) following `13_TESTING_STRATEGY.md` (APPROVED: Unit 90% / Integration 80% / E2E 70%)
- All API routes described in `07_API_DESIGN.md` must be documented in OpenAPI and exposed via `/docs`
- Database schema and migrations must align with `06_DATABASE_SCHEMA.md` (APPROVED: Prisma ORM with Prisma Migrate)
- Respect service boundaries from `08_MICROSERVICES_DESIGN.md`
- Follow design tokens and icon system from `11_UI_DESIGN_SYSTEM.md` and `ICON_SYSTEM_IMPLEMENTATION_GUIDE.md`
- QA processes and release gates from `14_QUALITY_ASSURANCE.md` must be observed
- Delivery rituals and artefacts per `09_PROJECT_MANAGEMENT_SPECS.md`

## Workflow
1. Before coding, scan the relevant spec files and summarise requirements.
2. Implement one Epic or story at a time (from `plans/03_work_breakdown_structure.md`).
3. Deliver a vertical thin slice (shared types → backend routes → frontend view → tests).
4. Check output against ESLint, type checks, and CI rules.
5. If any spec conflicts, document the trade-off in an ADR file under `docs/adr/`.

## Operating Rules

### **Mode: Infrastructure Only** 🐳
**Current Task**: Provision local Docker stack for development environment

### **Do Not Modify:**
- `apps/` or `packages/` directories
- Backend/frontend containers
- Schema creation or database wiring
- Metrics targets configuration

### **Work Only In:**
- `infra/docker/` - Docker Compose and configuration files
- `scripts/` - Helper scripts for Docker operations
- Root `.env.example` - Environment variable samples

### **Goal:**
Provision a local Docker stack for development so Epics can run against:
- PostgreSQL 16 database
- Redis 7 cache
- Prometheus metrics collection
- Grafana observability dashboard

### **Deliverables:**
1. **Docker Compose stack** with health checks and named volumes
2. **Environment samples** for local development
3. **Helper scripts** for Docker operations
4. **Documentation** for quick start and common commands
5. **Readiness report** documenting successful deployment

### **Constraints:**
- Only modify `infra/docker`, `scripts/`, and `.env.example`
- Secrets stay out of git (only `.env.example` committed)
- Use stable major image tags (postgres:16, redis:7, etc.)
- No file length limits for YAML configuration files

## Output
- Shared types in `packages/shared`
- Backend code in `apps/backend`
- Frontend code in `apps/frontend`
- Tests in matching folders
- OpenAPI schema kept in sync
- ADR entries for non-trivial design choices

## Implementation Plan Documents

### **Planning Phase Complete** ✅
All planning documents are located in the `plans/` directory and have been approved:

- **`plans/00_plan_overview.md`** - Project overview and milestones
- **`plans/01_dependency_matrix.md`** - Approved technology stack and versions
- **`plans/02_repository_design.md`** - Monorepo structure and package layout
- **`plans/03_work_breakdown_structure.md`** - Epics, stories, and acceptance criteria
- **`plans/04_ci_and_quality_gates.md`** - CI/CD pipeline and quality gates
- **`plans/05_risk_register.md`** - Risk assessment and mitigation strategies
- **`plans/06_spec_traceability_matrix.md`** - Requirements mapping to deliverables
- **`plans/07_repo_migration_plan.md`** - Step-by-step migration from docs to working repo
- **`plans/08_open_questions.md`** - All decisions approved (12/12)
- **`plans/09_go_no_go_checklist.md`** - Approval status: GO (94% complete)
- **`plans/10_reporting_template.md`** - Engineer reporting template for epics
- **`plans/APPROVAL_STATUS_SUMMARY.md`** - Current approval status summary
- **`plans/FINAL_APPROVAL_SUMMARY.md`** - Final approval summary and readiness

### **Approved Technical Decisions**
- **Node.js**: 20 LTS
- **Database ORM**: Prisma with Prisma Migrate
- **Authentication**: JWT tokens
- **Business Logic**: Hybrid (Database Functions + Backend Orchestration)
- **File Limits**: ≤250 lines, ≤50 lines (strict enforcement)
- **Testing**: Unit 90% / Integration 80% / E2E 70%

### **Approved Business Rules**
- **Tax**: GST 15% NZ, 0% international, 2dp rounding, multi-currency
- **Discounts**: %/fixed amounts, before tax, approval workflows (≤20% auto, ≤40% manager, >40% partner)
- **Time Tracking**: 3-tier approval hierarchy, weekly cycles, escalation procedures

### **Ready to Implement**
The project is approved for implementation and ready to begin the first milestone: Foundation phase (Repository structure, Development environment, Database schema, Basic authentication).