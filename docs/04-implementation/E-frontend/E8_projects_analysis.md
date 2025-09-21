# E8 Projects UI Analysis

## Overview
Implementation of comprehensive Projects management UI with modern design patterns, accessibility compliance, and performance optimization. This epic builds on the new frontend design system to create a professional project management interface.

## API Contracts Analysis

### Current State
- **Projects API**: Not yet implemented in backend (permissions defined but routes missing)
- **Service Categories API**: Available at `/v1/reference/service-categories` (no auth required)
- **Access Control**: `projects.view_projects` permission required for all project operations

### Required API Endpoints
```
GET /v1/projects
├── Query Params: page, size, sort, filter, status?, customerId?, ownerId?
├── Response: PaginationEnvelope<Project>
└── Permission: projects.view_projects

GET /v1/projects/:id  
├── Response: Project (with customer, service categories, owner details)
└── Permission: projects.view_projects

GET /v1/reference/service-categories
├── Response: ServiceCategory[] (already available)
└── Permission: none (public reference data)
```

### Contract Validation Strategy
- Use generated SDK types with zod validation
- Implement response validation with `safeParse()`
- Stop development if contract mismatches detected
- Regenerate SDK if backend changes occur

## State Management Requirements

### Filter State
```typescript
interface ProjectFilters {
  page: number;
  size: number;
  sort: 'name' | 'status' | 'startDate' | 'endDate' | 'createdAt';
  sortOrder: 'asc' | 'desc';
  search?: string;
  status?: 'active' | 'completed' | 'on-hold' | 'cancelled';
  customerId?: string;
  ownerId?: string;
  serviceCategoryId?: string;
}
```

### Pagination State
```typescript
interface PaginationState {
  page: number;
  size: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}
```

### Project States
- **Active**: Currently running projects
- **Completed**: Finished projects
- **On-Hold**: Paused projects
- **Cancelled**: Terminated projects

## Access Control Requirements

### Permission Checks
- **View Projects**: `projects.view_projects` (required for all project access)
- **Create Projects**: `projects.create_projects` (for "Create Project" CTA)
- **Update Projects**: `projects.update_projects` (for edit functionality)
- **Delete Projects**: `projects.delete_projects` (for delete actions)

### Error States
- **403 Forbidden**: Show permission denied message with contact admin CTA
- **404 Not Found**: Show project not found with navigation back to list
- **500 Server Error**: Show generic error with retry option

### Empty States
- **No Projects**: Empty state card with "Create Project" CTA (disabled if no create permission)
- **No Search Results**: "No projects found" with clear filters option
- **Loading**: Skeleton table with proper aria-busy states

## Performance Budget

### Route Chunk Size
- **Target**: ≤ 50KB gzipped for initial route load
- **Strategy**: React.lazy code-splitting for all project pages
- **Monitoring**: Bundle analyzer integration

### Optimization Techniques
- Lazy load project detail components
- Virtual scrolling for large project lists
- Image optimization for project thumbnails
- Memoized filter components

## Accessibility Requirements

### Table Semantics
- Proper `<table>` structure with `<thead>`, `<tbody>`, `<tfoot>`
- `aria-sort` attributes on sortable column headers
- `aria-label` for table purpose and content
- `aria-rowcount` and `aria-rowindex` for screen readers

### Status Chips
- Color + text labels (not color-only)
- `aria-label` with full status description
- High contrast ratios (WCAG AA compliance)
- Focus indicators for interactive chips

### Focus Management
- Logical tab order through table and filters
- Skip links for main content
- Focus trap in modals/dialogs
- Focus restoration after navigation

### Screen Reader Support
- `aria-busy="true"` during loading states
- `aria-live` regions for dynamic updates
- Descriptive labels for all interactive elements
- Status announcements for filter changes

## Component Architecture

### Page Components
```
src/pages/Projects/
├── List.tsx              # Project list with table, filters, pagination
├── Details.tsx           # Project detail view with overview, status, linked data
└── index.ts              # Barrel exports
```

### Feature Components
```
src/features/projects/
├── api.ts                # API hooks with SDK integration
├── types.ts              # TypeScript interfaces
└── hooks.ts              # Custom React hooks
```

### UI Components
```
src/components/projects/
├── ProjectCard.tsx       # Card view for project grid
├── ProjectTable.tsx      # Data table with sorting, filtering
├── StatusChip.tsx        # Status indicator component
├── ProjectFilters.tsx    # Filter controls
├── ProjectPagination.tsx # Pagination controls
└── EmptyState.tsx        # Empty state component
```

### Storybook Stories
```
src/components/projects/
├── ProjectCard.stories.tsx
├── ProjectTable.stories.tsx
├── StatusChip.stories.tsx
├── ProjectFilters.stories.tsx
└── EmptyState.stories.tsx
```

## Testing Strategy

### Unit Tests (RTL)
- Component rendering with various props
- User interactions (clicks, keyboard navigation)
- Accessibility compliance checks
- Error boundary behavior

### Integration Tests
- API integration with mock responses
- Filter state management
- Pagination functionality
- Permission-based UI changes

### E2E Tests (Playwright)
```typescript
// tests/e2e/projects.smoke.spec.ts
test('Projects workflow', async ({ page }) => {
  // Login
  await page.goto('/login');
  await page.fill('[data-testid="email"]', 'admin@pivotalflow.com');
  await page.fill('[data-testid="password"]', 'password123!extra');
  await page.click('[data-testid="login-button"]');
  
  // Navigate to projects
  await page.goto('/projects');
  await expect(page.locator('h1')).toContainText('Projects');
  
  // Test filters
  await page.fill('[data-testid="search-input"]', 'test project');
  await page.selectOption('[data-testid="status-filter"]', 'active');
  
  // Open project details
  await page.click('[data-testid="project-row-0"]');
  await expect(page.locator('h1')).toContainText('Project Details');
  
  // Verify key fields
  await expect(page.locator('[data-testid="project-name"]')).toBeVisible();
  await expect(page.locator('[data-testid="project-status"]')).toBeVisible();
});
```

## Browser Visibility Requirements

### Development Environment
- **URL**: http://localhost:5173/projects
- **Detail URL**: http://localhost:5173/projects/:id
- **Verification**: Manual testing in Chrome, Firefox, Safari

### Docker Environment
- **URL**: http://localhost:5173/projects (in Docker stack)
- **Verification**: E2E tests in Docker environment
- **Performance**: Lighthouse audits in Docker

## Implementation Phases

### Phase 1: Backend API Implementation
1. Create projects module in backend
2. Implement CRUD routes with proper validation
3. Add service categories integration
4. Update SDK generation

### Phase 2: Frontend Foundation
1. Create project types and API hooks
2. Implement basic routing with code-splitting
3. Create core UI components
4. Add Storybook stories

### Phase 3: Advanced Features
1. Implement filtering and pagination
2. Add accessibility features
3. Create comprehensive tests
4. Performance optimization

### Phase 4: Polish & Validation
1. A11y audit and fixes
2. Performance budget validation
3. E2E test completion
4. Documentation updates

## Success Criteria

### Technical Requirements
- ✅ Route chunk ≤ 50KB gzipped
- ✅ Axe: no critical accessibility violations
- ✅ E2E smoke tests pass
- ✅ Contract tests remain green
- ✅ All Storybook stories render correctly

### User Experience
- ✅ Intuitive project list with search/filter
- ✅ Clear project detail view
- ✅ Responsive design across devices
- ✅ Fast loading and smooth interactions
- ✅ Accessible to screen readers

### Business Requirements
- ✅ Proper permission enforcement
- ✅ Professional, polished appearance
- ✅ Consistent with design system
- ✅ Production-ready code quality

## Risk Mitigation

### Contract Mismatch Detection
- **Stop Condition**: If API contract changes detected
- **Remedial Plan**: Regenerate SDK or adjust DTOs
- **Validation**: Automated contract testing

### Performance Issues
- **Monitoring**: Bundle size tracking
- **Fallback**: Progressive loading strategies
- **Optimization**: Code splitting and lazy loading

### Accessibility Compliance
- **Testing**: Automated axe-core integration
- **Manual**: Screen reader testing
- **Validation**: WCAG 2.1 AA compliance

## Dependencies

### Backend Dependencies
- Projects API implementation
- Service categories API (already available)
- Permission system integration

### Frontend Dependencies
- Generated SDK with project types
- Design system components
- Testing infrastructure (RTL, Playwright)

### External Dependencies
- React Query for data fetching
- React Router for navigation
- Tailwind CSS for styling
- Storybook for component development

## Next Steps

1. **Backend API**: Implement projects routes and validation
2. **SDK Update**: Regenerate SDK with project types
3. **Frontend Foundation**: Create basic project components
4. **Testing Setup**: Configure RTL and Playwright tests
5. **Iterative Development**: Build and test incrementally

This analysis provides the foundation for implementing a comprehensive, accessible, and performant Projects UI that meets all enterprise requirements while maintaining the high-quality design standards established in the new frontend system.

