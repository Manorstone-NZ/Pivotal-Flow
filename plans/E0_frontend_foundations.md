# E0 Frontend Foundations Plan

## 🎯 **Executive Summary**

This document establishes the foundational architecture, standards, and implementation plan for the Pivotal Flow frontend application. The plan leverages our existing technology decisions (Tailwind CSS + Headless UI, custom components, CSS variables for design tokens) while establishing performance budgets, accessibility targets, and comprehensive testing strategies.

## 📋 **Current State Analysis**

### **Existing Infrastructure**
- **Framework**: React 18+ with TypeScript 5+
- **Build Tool**: Vite 5+ with optimized configuration
- **Styling**: CSS variables for design tokens (basic implementation)
- **State Management**: Zustand for local state
- **Testing**: Vitest + Playwright configured
- **API Integration**: Generated SDK from backend OpenAPI

### **Current Limitations**
- Minimal component library (only Button component)
- Basic routing with manual state management
- Limited design token system
- No accessibility testing framework
- No performance monitoring
- Missing comprehensive testing strategy

---

## 🏗️ **Information Architecture & Site Map**

### **Primary Navigation Structure**
```
Pivotal Flow Application
├── Authentication
│   ├── Login (/login)
│   ├── Register (/register)
│   └── Password Reset (/reset-password)
├── Dashboard (/dashboard)
│   ├── Overview
│   ├── Recent Activity
│   ├── Quick Actions
│   └── Analytics Widgets
├── Projects (/projects)
│   ├── Project List (/projects)
│   ├── Project Detail (/projects/:id)
│   ├── Project Create (/projects/new)
│   └── Project Edit (/projects/:id/edit)
├── Quotes (/quotes)
│   ├── Quote List (/quotes)
│   ├── Quote Detail (/quotes/:id)
│   ├── Quote Create (/quotes/new)
│   └── Quote Edit (/quotes/:id/edit)
├── Time Tracking (/time-tracking)
│   ├── Time Entries (/time-tracking/entries)
│   ├── Time Entry Create (/time-tracking/entries/new)
│   └── Time Reports (/time-tracking/reports)
├── Users (/users)
│   ├── User List (/users)
│   ├── User Detail (/users/:id)
│   ├── User Create (/users/new)
│   └── User Edit (/users/:id/edit)
├── Reports (/reports)
│   ├── Financial Reports (/reports/financial)
│   ├── Project Reports (/reports/projects)
│   ├── Time Reports (/reports/time)
│   └── Export Jobs (/reports/exports)
├── Settings (/settings)
│   ├── Profile (/settings/profile)
│   ├── Organization (/settings/organization)
│   ├── Preferences (/settings/preferences)
│   └── Integrations (/settings/integrations)
└── Admin (role-based)
    ├── Rate Cards (/admin/rate-cards)
    ├── Currencies (/admin/currencies)
    ├── Permissions (/admin/permissions)
    └── System Settings (/admin/system)
```

### **Route Planning**
```typescript
// Core route structure
const routes = [
  // Public routes
  { path: '/login', component: 'Login', public: true },
  { path: '/register', component: 'Register', public: true },
  
  // Protected routes with role-based access
  { path: '/dashboard', component: 'Dashboard', permissions: ['dashboard.view'] },
  { path: '/projects/*', component: 'Projects', permissions: ['projects.view_projects'] },
  { path: '/quotes/*', component: 'Quotes', permissions: ['quotes.view_quotes'] },
  { path: '/time-tracking/*', component: 'TimeTracking', permissions: ['time.view_time_entries'] },
  { path: '/users/*', component: 'Users', permissions: ['users.view_users'] },
  { path: '/reports/*', component: 'Reports', permissions: ['reports.view_reports'] },
  { path: '/settings/*', component: 'Settings', permissions: ['settings.view'] },
  { path: '/admin/*', component: 'Admin', permissions: ['admin.view'], roles: ['admin'] }
];
```

---

## 🎨 **App Shell Layout Architecture**

### **Layout Components Structure**
```
Layout/
├── AppShell.tsx              # Main application shell
├── Header/
│   ├── Header.tsx            # Top navigation bar
│   ├── UserMenu.tsx          # User dropdown menu
│   ├── Notifications.tsx     # Notification center
│   └── SearchBar.tsx         # Global search
├── Sidebar/
│   ├── Sidebar.tsx           # Main navigation sidebar
│   ├── Navigation.tsx        # Navigation menu items
│   ├── UserProfile.tsx       # User profile section
│   └── CollapsibleMenu.tsx   # Mobile collapsible menu
├── Main/
│   ├── MainContent.tsx       # Main content area
│   ├── Breadcrumbs.tsx       # Navigation breadcrumbs
│   └── PageHeader.tsx        # Page-specific headers
└── Footer/
    ├── Footer.tsx            # Application footer
    └── StatusBar.tsx         # System status indicators
```

### **Responsive Breakpoints**
```css
:root {
  --breakpoint-sm: 640px;   /* Mobile */
  --breakpoint-md: 768px;   /* Tablet */
  --breakpoint-lg: 1024px;  /* Desktop */
  --breakpoint-xl: 1280px;  /* Large Desktop */
  --breakpoint-2xl: 1536px; /* Extra Large */
}
```

### **Layout Behavior**
- **Mobile (< 768px)**: Collapsible sidebar, full-width content
- **Tablet (768px - 1024px)**: Fixed sidebar, responsive content
- **Desktop (> 1024px)**: Fixed sidebar, multi-column layouts

---

## ⚡ **Performance Budgets**

### **Core Web Vitals Targets**
| Metric | Target | Measurement |
|--------|--------|-------------|
| **LCP (Largest Contentful Paint)** | < 2.5s | 75th percentile |
| **FID (First Input Delay)** | < 100ms | 75th percentile |
| **CLS (Cumulative Layout Shift)** | < 0.1 | 75th percentile |
| **TTI (Time to Interactive)** | < 2.5s | Mid-tier device |
| **FCP (First Contentful Paint)** | < 1.8s | Mid-tier device |

### **Bundle Size Budgets**
| Asset Type | Budget | Gzipped |
|------------|--------|---------|
| **Initial Bundle** | ≤ 160KB | ≤ 50KB |
| **Vendor Bundle** | ≤ 200KB | ≤ 60KB |
| **Route Chunks** | ≤ 100KB | ≤ 30KB |
| **Total App Size** | ≤ 2MB | ≤ 600KB |

### **Performance Monitoring**
```typescript
// Performance monitoring configuration
const performanceConfig = {
  budgets: {
    bundleSize: 160 * 1024, // 160KB
    gzipSize: 50 * 1024,    // 50KB
    tti: 2500,              // 2.5s
    lcp: 2500,              // 2.5s
    cls: 0.1                // 0.1
  },
  monitoring: {
    enabled: true,
    sampling: 0.1, // 10% of users
    endpoints: {
      metrics: '/api/v1/metrics',
      errors: '/api/v1/errors'
    }
  }
};
```

---

## ♿ **Accessibility Targets**

### **WCAG 2.1 AA Compliance**
- **Level**: WCAG 2.1 AA (minimum)
- **Target**: 100% compliance for all components
- **Testing**: Automated + manual testing

### **Accessibility Requirements**
| Requirement | Target | Implementation |
|-------------|--------|---------------|
| **Keyboard Navigation** | 100% keyboard accessible | Focus management, tab order |
| **Screen Reader Support** | Full ARIA support | Semantic HTML, ARIA labels |
| **Color Contrast** | 4.5:1 minimum | Design token validation |
| **Focus Indicators** | Visible focus rings | Custom focus styles |
| **Alternative Text** | All images have alt text | Automated validation |

### **Accessibility Testing Strategy**
```typescript
// Accessibility testing configuration
const a11yConfig = {
  rules: {
    'color-contrast': 'error',
    'keyboard-navigation': 'error',
    'aria-labels': 'error',
    'semantic-html': 'error'
  },
  tools: [
    'axe-core',
    'jest-axe',
    'playwright-axe',
    'lighthouse-ci'
  ],
  manual: [
    'Screen reader testing',
    'Keyboard-only navigation',
    'Voice control testing'
  ]
};
```

---

## 📁 **Folder Structure**

### **Proposed Structure**
```
apps/frontend/src/
├── app/                     # Application-level components
│   ├── App.tsx             # Main app component
│   ├── AppShell.tsx        # Application shell
│   └── ErrorBoundary.tsx   # Global error boundary
├── pages/                  # Page components
│   ├── Dashboard/
│   ├── Projects/
│   ├── Quotes/
│   ├── TimeTracking/
│   ├── Users/
│   ├── Reports/
│   ├── Settings/
│   └── auth/
├── components/             # Reusable components
│   ├── ui/                # Base UI components
│   │   ├── Button/
│   │   ├── Input/
│   │   ├── Modal/
│   │   ├── Table/
│   │   └── ...
│   ├── forms/             # Form components
│   ├── layout/            # Layout components
│   └── features/          # Feature-specific components
├── features/              # Feature modules
│   ├── auth/
│   ├── projects/
│   ├── quotes/
│   └── time-tracking/
├── lib/                   # Utilities and libraries
│   ├── api/               # API client and hooks
│   ├── auth/              # Authentication utilities
│   ├── validation/        # Form validation schemas
│   ├── utils/             # General utilities
│   └── constants/          # Application constants
├── hooks/                 # Custom React hooks
│   ├── useAuth.ts
│   ├── useProjects.ts
│   └── useLocalStorage.ts
├── stores/                # State management
│   ├── authStore.ts
│   ├── uiStore.ts
│   └── projectStore.ts
├── styles/                # Global styles
│   ├── globals.css
│   ├── tokens.css
│   └── components.css
├── routes/                # Routing configuration
│   ├── AppRoutes.tsx
│   ├── ProtectedRoute.tsx
│   └── PublicRoute.tsx
├── i18n/                  # Internationalization
│   ├── locales/
│   ├── translations/
│   └── i18n.ts
└── tests/                 # Test files
    ├── __mocks__/
    ├── fixtures/
    ├── utils/
    └── setup.ts
```

---

## 📏 **Code Standards**

### **ESLint Configuration**
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
    plugins: {
      '@typescript-eslint': typescript,
      'react': react,
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
      'import': importPlugin
    },
    rules: {
      // TypeScript rules
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      
      // React rules
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      
      // Accessibility rules
      'jsx-a11y/alt-text': 'error',
      'jsx-a11y/aria-props': 'error',
      'jsx-a11y/aria-proptypes': 'error',
      'jsx-a11y/aria-unsupported-elements': 'error',
      'jsx-a11y/role-has-required-aria-props': 'error',
      'jsx-a11y/role-supports-aria-props': 'error',
      
      // Import rules
      'import/order': ['error', {
        'groups': ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
        'newlines-between': 'always',
        'alphabetize': { 'order': 'asc', 'caseInsensitive': true }
      }],
      'import/no-unresolved': 'error',
      'import/no-cycle': 'error'
    }
  }
];
```

### **File Naming Conventions**
- **Components**: PascalCase (`Button.tsx`, `UserProfile.tsx`)
- **Hooks**: camelCase with `use` prefix (`useAuth.ts`, `useLocalStorage.ts`)
- **Utilities**: camelCase (`formatDate.ts`, `validateEmail.ts`)
- **Constants**: UPPER_SNAKE_CASE (`API_ENDPOINTS.ts`, `ROUTE_PATHS.ts`)
- **Types**: PascalCase (`User.ts`, `ProjectTypes.ts`)
- **Tests**: Same as source with `.test` suffix (`Button.test.tsx`)

### **Import Order**
```typescript
// 1. React and React-related imports
import React from 'react';
import { useState, useEffect } from 'react';

// 2. Third-party libraries
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

// 3. Internal imports (absolute paths)
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';

// 4. Relative imports
import './Component.css';
import { ComponentProps } from './types';
```

---

## 🧪 **Testing Pyramid**

### **Unit Testing (90%+ Coverage)**
```typescript
// Component testing with React Testing Library
describe('Button Component', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('handles accessibility requirements', () => {
    const { container } = render(<Button>Click me</Button>);
    expect(await axe(container)).toHaveNoViolations();
  });
});

// Hook testing
describe('useAuth', () => {
  it('returns user data when authenticated', () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.user).toBeDefined();
    expect(result.current.isAuthenticated).toBe(true);
  });
});
```

### **Integration Testing (80%+ Coverage)**
```typescript
// API integration testing
describe('Project API Integration', () => {
  it('fetches projects successfully', async () => {
    const mockProjects = [{ id: '1', name: 'Test Project' }];
    server.use(
      rest.get('/api/v1/projects', (req, res, ctx) => {
        return res(ctx.json({ data: mockProjects }));
      })
    );

    render(<ProjectsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Project')).toBeInTheDocument();
    });
  });
});
```

### **E2E Testing (70%+ Coverage)**
```typescript
// Playwright E2E tests
test('user can create a new project', async ({ page }) => {
  await page.goto('/projects');
  await page.click('[data-testid="create-project-button"]');
  
  await page.fill('[data-testid="project-name"]', 'New Project');
  await page.fill('[data-testid="project-description"]', 'Project description');
  await page.click('[data-testid="save-project"]');
  
  await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
  await expect(page).toHaveURL(/\/projects\/\d+/);
});
```

### **Visual Testing**
```typescript
// Visual regression testing with Chromatic/Percy
describe('Button Visual Tests', () => {
  it('renders primary button correctly', () => {
    render(<Button variant="primary">Primary Button</Button>);
    expect(screen.getByRole('button')).toMatchSnapshot();
  });
});
```

---

## 🚀 **Implementation Phases**

### **Phase 1: Foundation Setup (Week 1-2)**
- [ ] **Project Structure**: Set up folder structure and routing
- [ ] **Design System**: Implement comprehensive design tokens
- [ ] **Component Library**: Create base UI components (Button, Input, Modal, etc.)
- [ ] **State Management**: Set up Zustand stores and React Query
- [ ] **Authentication**: Implement auth flow and protected routes

### **Phase 2: Core Features (Week 3-4)**
- [ ] **Dashboard**: Create dashboard with analytics widgets
- [ ] **Projects**: Implement project CRUD operations
- [ ] **Quotes**: Build quote management interface
- [ ] **Time Tracking**: Create time entry forms and reports
- [ ] **User Management**: Build user administration interface

### **Phase 3: Advanced Features (Week 5-6)**
- [ ] **Reports**: Implement reporting dashboard
- [ ] **Settings**: Create settings and preferences pages
- [ ] **Admin Panel**: Build administrative interfaces
- [ ] **Search**: Implement global search functionality
- [ ] **Notifications**: Add notification system

### **Phase 4: Polish & Optimization (Week 7-8)**
- [ ] **Performance**: Optimize bundle size and loading times
- [ ] **Accessibility**: Complete WCAG 2.1 AA compliance
- [ ] **Testing**: Achieve target coverage percentages
- [ ] **Documentation**: Complete component documentation
- [ ] **Deployment**: Set up production deployment pipeline

---

## ✅ **"Done" Gates**

### **Development Gates**
- [ ] **TypeScript**: No type errors, strict mode enabled
- [ ] **ESLint**: No linting errors, all rules passing
- [ ] **Prettier**: Code formatting consistent
- [ ] **Import Order**: Imports properly organized

### **Testing Gates**
- [ ] **Unit Tests**: 90%+ coverage for components and utilities
- [ ] **Integration Tests**: 80%+ coverage for API integrations
- [ ] **E2E Tests**: 70%+ coverage for critical user journeys
- [ ] **Accessibility Tests**: All components pass axe-core validation
- [ ] **Visual Tests**: No visual regressions detected

### **Performance Gates**
- [ ] **Bundle Size**: Initial bundle ≤ 160KB gzipped
- [ ] **Core Web Vitals**: LCP < 2.5s, FID < 100ms, CLS < 0.1
- [ ] **Lighthouse Score**: Performance ≥ 90, Accessibility ≥ 95
- [ ] **Bundle Analysis**: No duplicate dependencies or unused code

### **Quality Gates**
- [ ] **Accessibility**: WCAG 2.1 AA compliance verified
- [ ] **Cross-browser**: Chrome, Firefox, Safari compatibility
- [ ] **Mobile Responsive**: All breakpoints tested
- [ ] **Error Handling**: Graceful error states implemented
- [ ] **Loading States**: Skeleton screens and loading indicators

---

## 📊 **Success Metrics**

### **Performance Metrics**
- **Initial Load Time**: < 2.5s on 3G connection
- **Time to Interactive**: < 2.5s on mid-tier device
- **Bundle Size**: < 160KB gzipped initial bundle
- **Lighthouse Score**: ≥ 90 performance, ≥ 95 accessibility

### **Quality Metrics**
- **Test Coverage**: 90%+ unit, 80%+ integration, 70%+ E2E
- **Accessibility**: 100% WCAG 2.1 AA compliance
- **Type Safety**: 100% TypeScript coverage, no `any` types
- **Code Quality**: 0 ESLint errors, consistent formatting

### **User Experience Metrics**
- **Error Rate**: < 1% JavaScript errors
- **Accessibility**: 100% keyboard navigation support
- **Mobile Experience**: 100% responsive design
- **Cross-browser**: 100% compatibility across target browsers

---

## 🔄 **Next Steps**

1. **Review & Approval**: Stakeholder review of this foundation plan
2. **Tool Setup**: Configure development tools and CI/CD pipeline
3. **Design System**: Implement comprehensive design token system
4. **Component Library**: Build base UI components with accessibility
5. **Feature Development**: Begin implementation following the phased approach

---

**Document Version**: 1.0  
**Created**: January 2025  
**Next Review**: February 2025  
**Status**: Ready for Implementation
