# Cursor Agent Operating Procedures

Mindset
- Build for enterprise reliability, observability, and maintainability
- Prefer configuration and code generation over manual repetition
- Treat specifications in /sources as the source of truth

Golden Rules
- All calculations server side only
- Typescript everywhere frontend and backend
- Max file length 250 lines and max function length 50 lines
- No direct axios calls in React components; use typed client services
- No business logic in UI; selectors and view models only
- Every feature ships with tests: unit, integration, and API e2e
- Use feature flags for risky or staged work

Quality Gates
- ESLint and TypeScript must pass with zero errors
- File and function line limits enforced in lint rules and CI
- Test coverage thresholds: lines 85 percent, branches 80 percent
- API contracts validated via OpenAPI checks
- DB migrations migration tests run on ephemeral database during CI
