# E0 Frontend Foundations Plan

## Executive Summary

This document establishes the foundational architecture, standards, and implementation strategy for the Pivotal Flow frontend application. The plan leverages our existing technology decisions (React 18.3.1, TypeScript, Vite, Zustand) and integrates with the production-ready backend API.

## Current State Analysis

### Existing Infrastructure
- **Backend API**: Production-ready with 12 endpoints, TypeBox schemas, JWT authentication
- **Frontend Stack**: React 18.3.1, TypeScript 5.5.4, Vite 5.4.2, Zustand 4.5.4
- **Development Tools**: ESLint, Playwright, Vitest, Rollup Visualizer
- **Design System**: CSS custom properties with Pivotal Flow brand colors
- **API Integration**: Pivotal Flow SDK with authentication handling

### Available Backend Endpoints
```
Authentication: /login, /logout, /refresh, /me
User Management: /v1/users
Business Logic: /quotes, /rate-cards, /rate-cards/items
Reference Data: /currencies, /permissions, /payments
System: / (health check)
```

## Information Architecture & Site Map

### Primary Navigation Structure
```
Pivotal Flow App
├── Dashboard (/)
│   ├── Overview metrics
│   ├── Recent quotes
│   ├── Quick actions
│   └── System status
├── Quotes (/quotes)
│   ├── Quote list
│   ├── Create quote
│   ├── Quote details
│   └── Quote approval workflow
├── Rate Cards (/rate-cards)
│   ├── Rate card management
│   ├── Service pricing
│   └── Rate card items
├── Users (/users)
│   ├── User management
│   ├── Role assignment
│   └── Permission management
├── Payments (/payments)
│   ├── Payment processing
│   ├── Payment history
│   └── Payment reconciliation
└── Settings (/settings)
    ├── Profile management
    ├── System preferences
    └── Reference data
```

### Route Plan
```typescript
// Core application routes
const routes = [
  { path: '/', component: 'Dashboard', auth: true },
  { path: '/login', component: 'Login', auth: false },
  { path: '/quotes', component: 'Quotes', auth: true, permissions: ['quotes.view_quotes'] },
  { path: '/quotes/new', component: 'CreateQuote', auth: true, permissions: ['quotes.create_quotes'] },
  { path: '/quotes/:id', component: 'QuoteDetails', auth: true, permissions: ['quotes.view_quotes'] },
  { path: '/rate-cards', component: 'RateCards', auth: true, permissions: ['rate_cards.view_rate_cards'] },
  { path: '/users', component: 'Users', auth: true, permissions: ['users.view_users'] },
  { path: '/payments', component: 'Payments', auth: true, permissions: ['payments.view_payments'] },
  { path: '/settings', component: 'Settings', auth: true },
  { path: '/settings/profile', component: 'Profile', auth: true },
  { path: '*', component: 'NotFound', auth: false }
];
```

## App Shell Layout

### Layout Components
```typescript
// Main application shell
<AppShell>
  <AppHeader>
    <Logo />
    <Navigation />
    <UserMenu />
  </AppHeader>
  
  <AppSidebar>
    <NavigationMenu />
    <QuickActions />
  </AppSidebar>
  
  <AppMain>
    <Breadcrumbs />
    <PageContent />
  </AppMain>
  
  <AppFooter>
    <SystemStatus />
    <VersionInfo />
  </AppFooter>
</AppShell>

// Authentication layout
<AuthLayout>
  <AuthHeader />
  <AuthContent />
  <AuthFooter />
</AuthLayout>
```

### Responsive Breakpoints
```css
/* Mobile-first responsive design */
:root {
  --breakpoint-sm: 640px;   /* Mobile */
  --breakpoint-md: 768px;   /* Tablet */
  --breakpoint-lg: 1024px;  /* Desktop */
  --breakpoint-xl: 1280px;  /* Large desktop */
}
```

## Performance Budgets

### Bundle Size Targets
- **Initial Bundle**: ≤ 160KB gzipped
- **Vendor Chunk**: ≤ 100KB gzipped (React, React-DOM)
- **Utils Chunk**: ≤ 30KB gzipped (Zustand, utilities)
- **Route Chunks**: ≤ 50KB gzipped per route
- **Total Bundle**: ≤ 300KB gzipped

### Performance Metrics
- **Time to Interactive (TTI)**: < 2.5s on mid-tier devices
- **Largest Contentful Paint (LCP)**: < 2.5s
- **First Input Delay (FID)**: < 100ms
- **Cumulative Layout Shift (CLS)**: < 0.1
- **First Contentful Paint (FCP)**: < 1.8s

### Optimization Strategies
```typescript
// Code splitting by route
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Quotes = lazy(() => import('./pages/Quotes'));
const Users = lazy(() => import('./pages/Users'));

// Preload critical resources
<link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossorigin />
<link rel="preload" href="/api/v1/me" as="fetch" crossorigin />

// Image optimization
<img 
  src="/images/logo.webp" 
  alt="Pivotal Flow" 
  loading="lazy"
  decoding="async"
/>
```

## Accessibility Targets

### WCAG AA Compliance
- **Color Contrast**: Minimum 4.5:1 for normal text, 3:1 for large text
- **Keyboard Navigation**: Full keyboard accessibility for all interactive elements
- **Screen Reader Support**: Proper ARIA labels, roles, and descriptions
- **Focus Management**: Visible focus indicators and logical tab order

### Accessibility Implementation
```typescript
// Focus management
const useFocusManagement = () => {
  const focusRef = useRef<HTMLElement>(null);
  
  useEffect(() => {
    if (focusRef.current) {
      focusRef.current.focus();
    }
  }, []);
  
  return focusRef;
};

// ARIA attributes
<button
  aria-label="Create new quote"
  aria-describedby="quote-help-text"
  aria-expanded={isExpanded}
>
  Create Quote
</button>

// Screen reader announcements
<div aria-live="polite" aria-atomic="true">
  {announcement}
</div>
```

### Keyboard Navigation
- **Tab Order**: Logical flow through interactive elements
- **Skip Links**: Jump to main content, navigation
- **Keyboard Shortcuts**: Common actions (Ctrl+N for new quote)
- **Focus Rings**: Visible focus indicators on all focusable elements

## Folder Structure

```
apps/frontend/src/
├── app/                    # App-level configuration
│   ├── App.tsx            # Main app component
│   ├── AppProvider.tsx    # Context providers
│   └── router.tsx         # Route configuration
├── pages/                 # Page components
│   ├── Dashboard/
│   ├── Quotes/
│   ├── Users/
│   ├── Settings/
│   └── Auth/
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components
│   │   ├── Button/
│   │   ├── Input/
│   │   ├── Modal/
│   │   └── Table/
│   ├── layout/           # Layout components
│   │   ├── AppShell/
│   │   ├── AppHeader/
│   │   └── AppSidebar/
│   └── forms/            # Form components
│       ├── QuoteForm/
│       └── UserForm/
├── features/             # Feature-specific modules
│   ├── auth/            # Authentication feature
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── types/
│   ├── quotes/          # Quote management feature
│   ├── users/           # User management feature
│   └── payments/        # Payment processing feature
├── lib/                 # Shared utilities
│   ├── api/             # API client and services
│   ├── auth/            # Authentication utilities
│   ├── validation/      # Form validation schemas
│   ├── utils/           # General utilities
│   └── constants/       # Application constants
├── hooks/               # Custom React hooks
│   ├── useAuth.ts
│   ├── useApi.ts
│   └── useLocalStorage.ts
├── styles/              # Global styles and themes
│   ├── globals.css      # Global styles
│   ├── tokens.css       # Design tokens
│   └── components.css   # Component styles
├── routes/              # Route definitions
│   ├── index.ts
│   └── types.ts
├── i18n/                # Internationalization
│   ├── en.json
│   └── index.ts
└── tests/               # Test files
    ├── __mocks__/
    ├── fixtures/
    └── utils/
```

## Code Standards

### ESLint Configuration
```javascript
// eslint.config.js
export default [
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true }
      }
    },
    rules: {
      // TypeScript rules
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/explicit-function-return-type': 'warn',
      '@typescript-eslint/no-explicit-any': 'error',
      
      // React rules
      'react/jsx-uses-react': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      
      // Accessibility rules
      'jsx-a11y/alt-text': 'error',
      'jsx-a11y/aria-props': 'error',
      'jsx-a11y/aria-proptypes': 'error',
      'jsx-a11y/aria-unsupported-elements': 'error',
      'jsx-a11y/role-has-required-aria-props': 'error',
      'jsx-a11y/role-supports-aria-props': 'error',
      
      // Import organization
      'import/order': ['error', {
        'groups': ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
        'newlines-between': 'always',
        'alphabetize': { 'order': 'asc', 'caseInsensitive': true }
      }]
    }
  }
];
```

### File Naming Conventions
```
Components: PascalCase (Button.tsx, UserForm.tsx)
Hooks: camelCase with 'use' prefix (useAuth.ts, useLocalStorage.ts)
Utilities: camelCase (apiClient.ts, validation.ts)
Types: PascalCase (User.ts, Quote.ts)
Constants: UPPER_SNAKE_CASE (API_ENDPOINTS.ts, ERROR_MESSAGES.ts)
Pages: PascalCase (Dashboard.tsx, QuoteDetails.tsx)
```

### Import Organization
```typescript
// 1. React and external libraries
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// 2. Internal utilities and types
import { apiClient } from '@/lib/api';
import { User, Quote } from '@/lib/types';

// 3. Components
import { Button } from '@/components/ui/Button';
import { QuoteForm } from '@/components/forms/QuoteForm';

// 4. Hooks
import { useAuth } from '@/hooks/useAuth';

// 5. Styles
import './QuotePage.css';
```

## Testing Pyramid

### Unit Tests (70%)
```typescript
// Component testing with Vitest + React Testing Library
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button Component', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});

// Hook testing
import { renderHook, act } from '@testing-library/react';
import { useAuth } from './useAuth';

describe('useAuth Hook', () => {
  it('returns initial auth state', () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.isAuthenticated).toBe(false);
  });
});
```

### Integration Tests (20%)
```typescript
// API integration testing
import { apiClient } from '@/lib/api';

describe('API Client', () => {
  it('authenticates user successfully', async () => {
    const credentials = { email: 'test@example.com', password: 'password' };
    const response = await apiClient.auth.login(credentials);
    expect(response.accessToken).toBeDefined();
  });

  it('handles authentication errors', async () => {
    const invalidCredentials = { email: 'invalid', password: 'wrong' };
    await expect(apiClient.auth.login(invalidCredentials)).rejects.toThrow();
  });
});
```

### End-to-End Tests (10%)
```typescript
// Playwright E2E tests
import { test, expect } from '@playwright/test';

test('user can create a quote', async ({ page }) => {
  await page.goto('/login');
  await page.fill('[data-testid="email"]', 'test@example.com');
  await page.fill('[data-testid="password"]', 'password');
  await page.click('[data-testid="login-button"]');
  
  await page.goto('/quotes/new');
  await page.fill('[data-testid="quote-title"]', 'Test Quote');
  await page.click('[data-testid="create-quote"]');
  
  await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
});
```

### Visual Regression Tests
```typescript
// Component visual testing
import { render } from '@testing-library/react';
import { Button } from './Button';

test('Button visual regression', async () => {
  const { container } = render(<Button variant="primary">Click me</Button>);
  await expect(container).toMatchSnapshot();
});
```

### Accessibility Tests
```typescript
// Automated accessibility testing
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { QuoteForm } from './QuoteForm';

expect.extend(toHaveNoViolations);

test('QuoteForm has no accessibility violations', async () => {
  const { container } = render(<QuoteForm />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

## "Done" Gates

### Pre-commit Gates
```bash
# Type checking
npm run typecheck

# Linting
npm run lint

# Unit tests
npm run test

# Build verification
npm run build
```

### Pre-deployment Gates
```bash
# Full test suite
npm run test:coverage

# E2E smoke tests
npm run test:e2e

# Accessibility audit
npm run test:a11y

# Bundle size check
npm run analyze
```

### Quality Metrics
- **Type Coverage**: 100% TypeScript coverage
- **Test Coverage**: ≥ 80% code coverage
- **Lint Score**: 0 ESLint errors, < 10 warnings
- **Bundle Size**: Within performance budgets
- **Accessibility**: 0 WCAG AA violations
- **E2E Tests**: All critical user journeys passing

## Implementation Phases

### Phase 1: Foundation (Week 1)
- [ ] Set up folder structure
- [ ] Configure ESLint and TypeScript
- [ ] Implement authentication flow
- [ ] Create base UI components
- [ ] Set up routing

### Phase 2: Core Features (Week 2-3)
- [ ] Dashboard implementation
- [ ] Quote management
- [ ] User management
- [ ] Rate card management

### Phase 3: Advanced Features (Week 4)
- [ ] Payment processing
- [ ] Settings and preferences
- [ ] Error handling and loading states
- [ ] Performance optimization

### Phase 4: Polish (Week 5)
- [ ] Accessibility improvements
- [ ] Visual polish and animations
- [ ] Comprehensive testing
- [ ] Documentation

## Success Criteria

### Technical Metrics
- ✅ All "Done" gates passing
- ✅ Performance budgets met
- ✅ WCAG AA compliance
- ✅ 100% TypeScript coverage
- ✅ Zero ESLint errors

### User Experience Metrics
- ✅ Intuitive navigation
- ✅ Responsive design across devices
- ✅ Fast page loads
- ✅ Accessible to all users
- ✅ Error-free user journeys

### Business Metrics
- ✅ All backend endpoints integrated
- ✅ Authentication system working
- ✅ Core business workflows functional
- ✅ Ready for production deployment

---

**Next Steps**: Begin Phase 1 implementation with folder structure setup and authentication integration.