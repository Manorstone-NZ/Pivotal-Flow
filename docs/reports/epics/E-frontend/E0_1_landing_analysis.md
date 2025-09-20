# E0.1 Landing Page Analysis

## Overview
Create a high-performance, accessible landing page for Pivotal Flow that serves both unauthenticated users (marketing-lite + sign-in) and authenticated users (dashboard shortcut tiles). The landing page will be the primary entry point at `/` with live system status integration and elegant visual design.

## Current State Analysis

### ✅ Existing Infrastructure
- **Routing**: React Router v6 with code-split lazy loading (`AppRouter.tsx`)
- **Authentication**: Zustand-based auth store with `useAuth()` hook
- **API Client**: Axios-based client with SDK integration (`packages/sdk`)
- **Health Endpoints**: Backend `/health` endpoint with comprehensive status checks
- **Design System**: Complete CSS custom properties and design tokens
- **Performance**: Route-level code splitting and performance monitoring
- **Testing**: Vitest (unit), Playwright (E2E), Storybook (components)

### 🔍 Key Findings

#### Routing Architecture
- Current router redirects `*` to `/` which then redirects to `/dashboard` via `RequireAuth`
- All routes are protected by `RequireAuth` wrapper
- Need to add public `/` route that renders landing page regardless of auth state

#### Authentication State Management
- `useAuth()` hook provides: `isAuthenticated`, `user`, `isLoading`, `login()`, `logout()`
- Auth state persisted in localStorage via Zustand persist
- Current login flow redirects authenticated users to `/dashboard`

#### Backend Health Integration
- Health endpoint: `GET /api/v1/health` returns comprehensive status
- Response schema includes: `status`, `timestamp`, `uptime`, `version`, `checks` (database, redis, metrics)
- Each check has: `status`, `message`, `timestamp`
- Perfect for live status widget integration

#### Design System
- Complete CSS custom properties in `tokens.css`
- Brand colors: Primary `#D15300`, Secondary `#8B4513`, Accent `#FF6B35`
- Surface background: `#F5E6CC` (warm cream)
- Typography: Inter font family with comprehensive scale
- Spacing, shadows, animations all tokenized

#### SDK Integration
- `PivotalFlowClient` class with TypeScript support
- Axios-based with request/response interceptors
- Token refresh handling built-in
- Health endpoint available via SDK

## Implementation Plan

### 1. Route & Guarding Strategy
**Files to modify:**
- `apps/frontend/src/router/AppRouter.tsx`

**Changes:**
- Add public `/` route that renders `LandingPage` component
- Keep existing protected routes unchanged
- Ensure `/login` remains auth entry point
- Landing page will handle auth state internally

### 2. Landing Page Architecture
**New folder structure:**
```
apps/frontend/src/pages/Landing/
├── Landing.tsx                 # Main landing page component
├── sections/
│   ├── Hero.tsx               # Hero section with headline/CTAs
│   ├── FeatureGrid.tsx       # 5 feature cards (Quotes, Rate Cards, etc.)
│   ├── LiveStatus.tsx        # Backend health status widget
│   └── Footer.tsx            # Footer with version/links
├── Landing.stories.tsx        # Storybook stories
└── Landing.test.tsx          # Unit tests
```

### 3. Component Specifications

#### Hero.tsx
- **Headline**: "Pivotal Flow"
- **Subheadline**: "Quotes → Invoices → Payments, flawlessly connected."
- **CTAs**: 
  - Unauthenticated: "Sign In" button
  - Authenticated: "Continue to Dashboard" + quick tiles
- **Accessibility**: Proper heading hierarchy, aria-describedby, keyboard focus order

#### FeatureGrid.tsx
- **5 Cards**: Quotes, Rate Cards, Invoices, Time & Approvals, Users
- **Each Card**: SVG icon, short description, CTA button
- **Semantic HTML**: `<article role="article">` with accessible headings
- **Responsive**: 1/2/3 columns based on screen size

#### LiveStatus.tsx
- **Data Source**: `GET /api/v1/health` via SDK
- **Display**: Aggregated status (OK/degraded) with tooltip breakdown
- **Caching**: 30s in-memory cache to avoid spam
- **Error Handling**: Graceful degradation, non-PII error messages
- **Accessibility**: `aria-live="polite"` for status announcements

#### Footer.tsx
- **Version Info**: Build/version from `X-App-Version` header or env var
- **Links**: Docs, Changelog, Status
- **Semantic**: `<footer>` element
- **Motion**: Respects `prefers-reduced-motion`

### 4. Authentication Integration
- Use existing `useAuth()` hook for state management
- **Unauthenticated State**: Show "Sign In" CTA, feature highlights
- **Authenticated State**: Show "Continue to Dashboard" + quick access tiles
- **No Auto-redirect**: Let users read updates before proceeding

### 5. Styling & Motion
- **Design Tokens**: Use existing CSS custom properties
- **Motion**: Respect `prefers-reduced-motion` media query
- **Responsive**: Hero stacks under 640px, feature grid adapts
- **Dark Mode**: Support via existing theme system

### 6. Performance Considerations
- **Code Splitting**: Landing page as separate chunk
- **Bundle Budget**: ≤160KB gzipped for initial route
- **Images**: WebP format, lazy loading for off-screen
- **SVG**: Inline where possible to avoid additional requests

### 7. Testing Strategy

#### Unit Tests (RTL)
- `Landing.test.tsx`: Render tests, accessibility checks
- `LiveStatus.test.tsx`: OK/failure branches, aria-live announcements
- Button accessibility and keyboard navigation

#### E2E Tests (Playwright)
- `landing.smoke.spec.ts`:
  - Visit `/` unauthenticated → see Sign In CTA
  - Login → revisit `/` → see Continue tiles
  - LiveStatus functionality and error handling

#### Storybook
- Stories for each section with controls
- A11y addon enabled, no critical violations
- Interactive demos for different auth states

### 8. Browser & Docker Visibility
- **Dev**: `pnpm -w --filter apps/frontend dev` → `http://localhost:5173/`
- **Docker**: Ensure Nginx routes `/` to frontend container
- **Update**: `infra/docker/docker-compose.app.dev.yml` if needed

### 9. Security Considerations
- **CSP**: Respect nonces if present in production
- **PII Protection**: Never leak sensitive data in status widget
- **Error Handling**: Generic error messages for public consumption

## Risk Assessment

### 🟢 Low Risk
- Route addition (non-breaking change)
- Component creation (isolated)
- Design token usage (existing system)

### 🟡 Medium Risk
- Bundle size impact (monitor with budget)
- Health endpoint integration (contract dependency)
- Auth state handling (existing patterns)

### 🔴 High Risk
- **Contract Mismatch**: If `/health` endpoint changes
- **CSP Violations**: If inline styles/scripts blocked
- **Performance Regression**: If bundle exceeds budget

## Success Criteria

### ✅ Functional Requirements
- `/` route renders in dev and Docker
- LiveStatus shows backend health or degrades gracefully
- Auth state properly reflected in UI
- All CTAs functional and accessible

### ✅ Quality Requirements
- Storybook stories present, no a11y violations
- Playwright smoke tests passing
- Bundle within performance budget
- No TypeScript/ESLint violations
- Zero `any`/non-null assertions

### ✅ Performance Requirements
- Initial route ≤160KB gzipped
- Lighthouse/axe checks pass
- Core Web Vitals within budget

## Implementation Order

1. **Route Setup** - Add public `/` route
2. **Component Structure** - Create folder structure and basic components
3. **Hero Section** - Headline, CTAs, auth awareness
4. **Feature Grid** - 5 feature cards with responsive design
5. **Live Status** - Health endpoint integration with caching
6. **Footer** - Version info and links
7. **Styling** - Design tokens, responsive, motion
8. **Testing** - Unit tests, E2E tests, Storybook
9. **Performance** - Bundle analysis and optimization
10. **Documentation** - Update contributing guide

## Dependencies

### External
- Backend `/health` endpoint (contract dependency)
- SDK health method availability
- Docker Nginx configuration

### Internal
- Existing auth store and hooks
- Design token system
- Performance monitoring components
- Testing infrastructure

## Stop Conditions

1. **Contract Mismatch**: If `/health` endpoint differs from expected
   - Action: Create `plans/landing_contract_gap.md` with proposed fix
   - Options: Regenerate SDK or adjust DTOs

2. **CSP Violations**: If inline styles/scripts blocked
   - Action: Wire nonces (dev + prod) and update page to nonce-compliant

3. **Performance Budget Exceeded**: If bundle >160KB gzipped
   - Action: Optimize components, reduce dependencies, code split further

## Next Steps

1. Create route and basic component structure
2. Implement Hero section with auth awareness
3. Add FeatureGrid with responsive design
4. Integrate LiveStatus with health endpoint
5. Complete Footer and styling
6. Add comprehensive testing
7. Performance optimization and validation
8. Documentation updates

This analysis provides a comprehensive roadmap for implementing a production-ready landing page that integrates seamlessly with the existing Pivotal Flow architecture while meeting all performance, accessibility, and security requirements.
