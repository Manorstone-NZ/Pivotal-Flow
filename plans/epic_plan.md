Epic A – Foundations

These must be completed sequentially in order.

A.1 Infrastructure & Schema – Provision Docker stack, PostgreSQL schema, and Prisma migrations.

A.2 Backend Skeleton – Fastify server with Redis, Prometheus metrics, structured logging.

A.3 Authentication – Secure JWT auth, Argon2 passwords, refresh rotation, audit logging.

A.4 User Management – Multi-tenant Users API with RBAC, validation, audit trail.

A.5 Enhanced Database Ops – Repository layer, transactions, indexes, safe caching, performance metrics.

A.6 Caching & Performance – Redis caching expansion, query optimisation, bundle/code split.

A.7 Monitoring & Ops – Grafana dashboards, alerts, structured logs, backup/restore strategy.



Epic B – Core Business Features

Each builds on Users + DB foundations.

B.1 Customers & Contacts – Customer entities and contacts, scoped to organisation.

B.2 Projects & Services – Project tracking linked to customers and service categories.

B.3 Quotes & Rate Cards – Quotation engine with line items, rate cards, multi-currency.

B.4 Invoicing – Invoice generation, line items, totals, and payment status.

B.5 Time Tracking – Time entries linked to users and projects with approval workflow.



Epic C – Business Intelligence & Reporting

Dependent on stable DB + business data.

C.1 Data Processing – ETL pipelines from core DB into analytics schema.

C.2 BI Dashboards – Qlik/Prometheus/Grafana dashboards for business KPIs.

C.3 Audit & Compliance Reports – Exportable logs, compliance views, reporting APIs.



Epic D – Integrations

Dependent on authentication, users, and business modules.

D.1 External Identity – SSO, SAML, OAuth, LDAP/AD integration.

D.2 Finance Systems – SAP/LIMS/ODS integrations for billing and commitments.

D.3 Third-Party APIs – Webhooks, customer portal integrations, external services.



Epic E – Frontend & UX

Runs in parallel once backend skeleton and APIs exist.

E.1 Design System – Tailwind tokens, Headless UI, Heroicons, consistent UX.

E.2 Frontend Architecture – React + Vite + state management, CI/CD with lint/test gates.

E.3 Feature Screens – Customers, projects, quotes, invoices, dashboards.

E.4 User Journeys – Role-based flows, customer portal, polished end-to-end UX.

Dependency Flow (simplified)
A.1 → A.2 → A.3 → A.4 → A.5 → A.6
                   ↘ B.1 → B.2 → B.3 → B.4
                        ↘ B.5
A.2 → A.7 (parallel ops/monitoring)
B.* + A.5 → C.1 → C.2 → C.3
A.3 + A.4 → D.1
B.3 + B.4 → D.2
B.*       → D.3
A.3–A.4 + B.* → E.1–E.4

Notes for Agents

Always consult this roadmap before starting a new epic.

Do not attempt an epic until its prerequisites are marked complete.

Output reports to plans/<epic>_report.md for traceability.

Stop at Go/No-Go checkpoints after each epic before starting the next.