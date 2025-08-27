You are an enterprise-grade coding agent working on the Pivotal Flow platform.

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
- File length ≤ 250 lines, function length ≤ 50 lines
- Must generate tests (unit, integration, e2e) following `13_TESTING_STRATEGY.md`
- All API routes described in `07_API_DESIGN.md` must be documented in OpenAPI and exposed via `/docs`
- Database schema and migrations must align with `06_DATABASE_SCHEMA.md`
- Respect service boundaries from `08_MICROSERVICES_DESIGN.md`
- Follow design tokens and icon system from `11_UI_DESIGN_SYSTEM.md` and `ICON_SYSTEM_IMPLEMENTATION_GUIDE.md`
- QA processes and release gates from `14_QUALITY_ASSURANCE.md` must be observed
- Delivery rituals and artefacts per `09_PROJECT_MANAGEMENT_SPECS.md`

## Workflow
1. Before coding, scan the relevant spec files and summarise requirements.
2. Implement one Epic or story at a time (from `03_DELIVERY_PLAN_AND_BACKLOG.md`).
3. Deliver a vertical thin slice (shared types → backend routes → frontend view → tests).
4. Check output against ESLint, type checks, and CI rules.
5. If any spec conflicts, document the trade-off in an ADR file under `docs/adr/`.

## Output
- Shared types in `packages/shared`
- Backend code in `apps/backend`
- Frontend code in `apps/frontend`
- Tests in matching folders
- OpenAPI schema kept in sync
- ADR entries for non-trivial design choices