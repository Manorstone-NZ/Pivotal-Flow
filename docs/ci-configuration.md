# CI Configuration for Pivotal Flow E5 QA Pipeline

## Overview
This configuration sets up comprehensive QA gates for the Pivotal Flow frontend application, ensuring code quality, test coverage, and accessibility compliance.

## Pipeline Stages

### 1. Unit Tests & Linting
- **TypeScript type checking**: Ensures type safety
- **ESLint**: Code quality and style enforcement
- **Vitest unit tests**: Component and hook testing with coverage
- **Coverage reporting**: Uploads to Codecov for tracking

### 2. E2E Tests
- **Playwright setup**: Multi-browser testing (Chromium, Firefox, WebKit)
- **Frontend build**: Production build verification
- **E2E test execution**: Critical user flow testing
- **Test artifacts**: Uploads test reports and screenshots

### 3. Docker Integration Tests
- **Docker Compose stack**: Full environment testing
- **Service health checks**: Ensures all services start correctly
- **Integration testing**: End-to-end functionality verification
- **Cleanup**: Proper resource cleanup after tests

### 4. Accessibility Testing
- **jest-axe integration**: WCAG AA compliance testing
- **Component accessibility**: Automated a11y testing
- **Keyboard navigation**: Focus management verification

### 5. Build & Deploy Preview
- **Production build**: Verifies build process works
- **Artifact upload**: Stores build artifacts for deployment
- **PR previews**: Enables preview deployments for pull requests

## QA Gates

### Required for Merge
- ✅ All unit tests passing
- ✅ TypeScript compilation successful
- ✅ ESLint passes without errors
- ✅ E2E tests passing
- ✅ Accessibility tests passing
- ✅ Docker integration tests successful

### Coverage Targets
- **Unit Tests**: 80%+ code coverage
- **E2E Tests**: Critical user flows covered
- **Accessibility**: WCAG AA compliance

## Environment Variables

### Required
- `NODE_VERSION`: Node.js version (20)
- `PNPM_VERSION`: pnpm version (8)
- `CI`: Set to true for CI environment

### Optional
- `CODECOV_TOKEN`: For coverage reporting
- `PLAYWRIGHT_BROWSERS_PATH`: Custom browser path

## Local Development

### Running Tests Locally
```bash
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e

# Docker integration
docker compose -f docker-compose.dev.yml up -d
pnpm test:e2e --project=chromium tests/e2e/smoke.spec.ts
```

### Pre-commit Hooks
```bash
# Install husky hooks
pnpm install

# Run pre-commit checks
pnpm lint
pnpm typecheck
pnpm test
```

## Troubleshooting

### Common Issues
1. **Playwright browser installation**: Ensure `pnpm exec playwright install --with-deps` runs
2. **Docker service startup**: Check service health endpoints
3. **Coverage reporting**: Verify Codecov token is set
4. **E2E test failures**: Check for timing issues and add proper waits

### Debug Commands
```bash
# Check service health
curl http://localhost:3000/health
curl http://localhost:5173

# View test results
pnpm test:e2e --reporter=html
```

## Performance Considerations
- **Parallel execution**: Tests run in parallel where possible
- **Caching**: pnpm store and node_modules caching
- **Artifact retention**: 30 days for test reports, 7 days for builds
- **Resource limits**: Appropriate memory and CPU limits for containers
