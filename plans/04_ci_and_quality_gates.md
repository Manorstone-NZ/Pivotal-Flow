# Pivotal Flow - CI & Quality Gates

## 🚀 **Continuous Integration Overview**

### **CI Pipeline Architecture**
- **Trigger**: Push to main/develop branches, pull requests
- **Platform**: GitHub Actions with self-hosted runners
- **Strategy**: Monorepo-aware with parallel job execution
- **Quality Gates**: Automated checks at each stage
- **Deployment**: Automated deployment to staging, manual to production

---

## 🔄 **CI Pipeline Stages**

### **Stage 1: Code Quality & Validation**
**Duration**: 2-3 minutes  
**Parallel Execution**: Yes  
**Failure Action**: Block merge

#### **1.1 Type Checking**
```yaml
# .github/workflows/type-check.yml
name: Type Check
on: [push, pull_request]

jobs:
  type-check:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        package: [shared, database, ui-components, backend, frontend]
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'pnpm'
    
    - name: Install pnpm
      uses: pnpm/action-setup@v2
      with:
        version: 8
    
    - name: Install dependencies
      run: pnpm install --frozen-lockfile
    
    - name: Type check
      run: pnpm --filter ${{ matrix.package }} type-check
```

**Quality Gates**:
- [ ] TypeScript compilation succeeds
- [ ] No type errors in any package
- [ ] All path aliases resolve correctly
- [ ] Project references build successfully

#### **1.2 Linting & Code Style**
```yaml
# .github/workflows/lint.yml
name: Lint & Format
on: [push, pull_request]

jobs:
  lint:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'pnpm'
    
    - name: Install pnpm
      uses: pnpm/action-setup@v2
      with:
        version: 8
    
    - name: Install dependencies
      run: pnpm install --frozen-lockfile
    
    - name: Run ESLint
      run: pnpm lint
    
    - name: Check Prettier formatting
      run: pnpm format:check
    
    - name: Check file size limits
      run: pnpm check:file-sizes
```

**Quality Gates**:
- [ ] ESLint passes with zero errors
- [ ] Prettier formatting is consistent
- [ ] File sizes within limits (250 lines max)
- [ ] Function complexity within limits (50 lines max)

#### **1.3 Security Scanning**
```yaml
# .github/workflows/security-scan.yml
name: Security Scan
on: [push, pull_request]

jobs:
  security:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Run Snyk
      uses: snyk/actions/node@master
      env:
        SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
      with:
        args: --severity-threshold=high
    
    - name: Run Semgrep
      uses: returntocorp/semgrep-action@v1
      with:
        config: >-
          p/security-audit
          p/secrets
          p/owasp-top-ten
        output-format: sarif
        output-file: semgrep-results.sarif
    
    - name: Upload security results
      uses: github/codeql-action/upload-sarif@v3
      with:
        sarif_file: semgrep-results.sarif
```

**Quality Gates**:
- [ ] No high/critical security vulnerabilities
- [ ] No secrets or credentials in code
- [ ] OWASP Top 10 compliance
- [ ] Security best practices followed

---

### **Stage 2: Testing & Quality Assurance**
**Duration**: 5-8 minutes  
**Parallel Execution**: Yes  
**Failure Action**: Block merge

#### **2.1 Unit Testing**
```yaml
# .github/workflows/unit-tests.yml
name: Unit Tests
on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        package: [shared, database, ui-components, backend, frontend]
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'pnpm'
    
    - name: Install pnpm
      uses: pnpm/action-setup@v2
      with:
        version: 8
    
    - name: Install dependencies
      run: pnpm install --frozen-lockfile
    
    - name: Run unit tests
      run: pnpm --filter ${{ matrix.package }} test:unit
    
    - name: Generate coverage report
      run: pnpm --filter ${{ matrix.package }} test:coverage
    
    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        file: ./packages/${{ matrix.package }}/coverage/lcov.info
        flags: unittests
        name: codecov-${{ matrix.package }}
```

**Quality Gates**:
- [ ] All unit tests pass
- [ ] 90%+ test coverage achieved
- [ ] No test flakiness (consistent results)
- [ ] Coverage reports generated successfully

#### **2.2 Integration Testing**
```yaml
# .github/workflows/integration-tests.yml
name: Integration Tests
on: [push, pull_request]

jobs:
  integration-tests:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      
      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'pnpm'
    
    - name: Install pnpm
      uses: pnpm/action-setup@v2
      with:
        version: 8
    
    - name: Install dependencies
      run: pnpm install --frozen-lockfile
    
    - name: Setup test database
      run: pnpm db:setup:test
    
    - name: Run integration tests
      run: pnpm test:integration
    
    - name: Generate integration coverage
      run: pnpm test:integration:coverage
```

**Quality Gates**:
- [ ] All integration tests pass
- [ ] 80%+ integration test coverage
- [ ] Database operations work correctly
- [ ] External service integrations functional

#### **2.3 End-to-End Testing**
```yaml
# .github/workflows/e2e-tests.yml
name: E2E Tests
on: [push, pull_request]

jobs:
  e2e-tests:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'pnpm'
    
    - name: Install pnpm
      uses: pnpm/action-setup@v2
      with:
        version: 8
    
    - name: Install dependencies
      run: pnpm install --frozen-lockfile
    
    - name: Install Playwright browsers
      run: pnpm playwright install --with-deps
    
    - name: Start application
      run: pnpm dev &
    
    - name: Wait for application
      run: npx wait-on http://localhost:3000 http://localhost:3002
    
    - name: Run E2E tests
      run: pnpm test:e2e
    
    - name: Upload test results
      uses: actions/upload-artifact@v3
      if: always()
      with:
        name: playwright-report
        path: playwright-report/
        retention-days: 30
```

**Quality Gates**:
- [ ] All E2E tests pass
- [ ] 70%+ E2E test coverage
- [ ] Critical user journeys work
- [ ] Cross-browser compatibility verified

---

### **Stage 3: Build & Artifact Creation**
**Duration**: 3-5 minutes  
**Parallel Execution**: Yes  
**Failure Action**: Block merge

#### **3.1 Application Builds**
```yaml
# .github/workflows/build.yml
name: Build Applications
on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        package: [shared, database, ui-components, backend, frontend]
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'pnpm'
    
    - name: Install pnpm
      uses: pnpm/action-setup@v2
      with:
        version: 8
    
    - name: Install dependencies
      run: pnpm install --frozen-lockfile
    
    - name: Build package
      run: pnpm --filter ${{ matrix.package }} build
    
    - name: Upload build artifacts
      uses: actions/upload-artifact@v3
      with:
        name: ${{ matrix.package }}-build
        path: packages/${{ matrix.package }}/dist/
        retention-days: 7
```

**Quality Gates**:
- [ ] All packages build successfully
- [ ] No build errors or warnings
- [ ] Build artifacts generated correctly
- [ ] Build performance within limits

#### **3.2 Docker Image Building**
```yaml
# .github/workflows/docker-build.yml
name: Docker Build
on: [push, pull_request]

jobs:
  docker-build:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v3
    
    - name: Build backend image
      uses: docker/build-push-action@v5
      with:
        context: ./apps/backend
        file: ./apps/backend/Dockerfile
        push: false
        tags: pivotalflow/backend:pr-${{ github.event.number }}
        cache-from: type=gha
        cache-to: type=gha,mode=max
    
    - name: Build frontend image
      uses: docker/build-push-action@v5
      with:
        context: ./apps/frontend
        file: ./apps/frontend/Dockerfile
        push: false
        tags: pivotalflow/frontend:pr-${{ github.event.number }}
        cache-from: type=gha
        cache-to: type=gha,mode=max
```

**Quality Gates**:
- [ ] Docker images build successfully
- [ ] No security vulnerabilities in base images
- [ ] Image sizes within acceptable limits
- [ ] Multi-stage builds optimized

---

### **Stage 4: Performance & Load Testing**
**Duration**: 5-10 minutes  
**Parallel Execution**: No  
**Failure Action**: Warning (non-blocking)

#### **4.1 Performance Testing**
```yaml
# .github/workflows/performance.yml
name: Performance Tests
on: [push, pull_request]

jobs:
  performance:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'pnpm'
    
    - name: Install pnpm
      uses: pnpm/action-setup@v2
      with:
        version: 8
    
    - name: Install dependencies
      run: pnpm install --frozen-lockfile
    
    - name: Start application
      run: pnpm dev &
    
    - name: Wait for application
      run: npx wait-on http://localhost:3000 http://localhost:3002
    
    - name: Run performance tests
      run: pnpm test:performance
    
    - name: Generate performance report
      run: pnpm test:performance:report
```

**Quality Gates**:
- [ ] API response times <200ms (95th percentile)
- [ ] Page load times <2s
- [ ] Memory usage within limits
- [ ] CPU usage optimized

#### **4.2 Load Testing**
```yaml
# .github/workflows/load-test.yml
name: Load Tests
on: [push, pull_request]

jobs:
  load-test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'pnpm'
    
    - name: Install pnpm
      uses: pnpm/action-setup@v2
      with:
        version: 8
    
    - name: Install dependencies
      run: pnpm install --frozen-lockfile
    
    - name: Start application
      run: pnpm dev &
    
    - name: Wait for application
      run: npx wait-on http://localhost:3000 http://localhost:3002
    
    - name: Run load tests
      run: pnpm test:load
    
    - name: Generate load test report
      run: pnpm test:load:report
```

**Quality Gates**:
- [ ] System handles 100+ concurrent users
- [ ] Response times remain stable under load
- [ ] No memory leaks detected
- [ ] Graceful degradation under stress

---

## 🚦 **Quality Gates & Thresholds**

### **Code Quality Gates**
| Metric | Threshold | Action | Enforcement |
|--------|-----------|---------|-------------|
| TypeScript Errors | 0 | Block merge | CI pipeline |
| ESLint Errors | 0 | Block merge | CI pipeline |
| File Size | ≤250 lines | Block merge | Pre-commit hook |
| Function Size | ≤50 lines | Block merge | Pre-commit hook |
| Cyclomatic Complexity | ≤10 | Warning | Code review |

### **Test Coverage Gates**
| Test Type | Coverage Threshold | Action | Enforcement |
|-----------|-------------------|---------|-------------|
| Unit Tests | 90%+ | Block merge | CI pipeline |
| Integration Tests | 80%+ | Block merge | CI pipeline |
| E2E Tests | 70%+ | Block merge | CI pipeline |
| Performance Tests | Pass benchmarks | Warning | CI pipeline |

### **Security Gates**
| Security Check | Threshold | Action | Enforcement |
|----------------|-----------|---------|-------------|
| Dependency Vulnerabilities | 0 high/critical | Block merge | CI pipeline |
| Code Security Scan | 0 high/critical | Block merge | CI pipeline |
| Secrets Detection | 0 secrets | Block merge | CI pipeline |
| OWASP Compliance | Full compliance | Block merge | CI pipeline |

---

## 🔒 **Pre-Merge Safety Checks**

### **Automated Checks**
```yaml
# .github/workflows/pre-merge.yml
name: Pre-Merge Checks
on:
  pull_request:
    types: [opened, synchronize, reopened, ready_for_review]

jobs:
  pre-merge:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Run all quality checks
      run: |
        pnpm type-check
        pnpm lint
        pnpm test:unit
        pnpm test:integration
        pnpm test:e2e
        pnpm build
        pnpm test:performance
    
    - name: Check coverage thresholds
      run: pnpm check:coverage
    
    - name: Security scan
      run: pnpm security:scan
    
    - name: Performance check
      run: pnpm check:performance
```

**Pre-Merge Requirements**:
- [ ] All automated tests pass
- [ ] Coverage thresholds met
- [ ] Security scan clean
- [ ] Performance benchmarks met
- [ ] Code review approved
- [ ] No merge conflicts

---

## 📊 **Quality Metrics & Reporting**

### **Quality Dashboard Metrics**
```typescript
interface QualityMetrics {
  // Code Quality
  typescriptErrors: number;
  lintingErrors: number;
  fileSizeViolations: number;
  complexityViolations: number;
  
  // Test Coverage
  unitTestCoverage: number;
  integrationTestCoverage: number;
  e2eTestCoverage: number;
  totalTestCoverage: number;
  
  // Performance
  apiResponseTime: number;
  pageLoadTime: number;
  memoryUsage: number;
  cpuUsage: number;
  
  // Security
  securityVulnerabilities: number;
  codeSecurityScore: number;
  dependencySecurityScore: number;
  
  // Build Quality
  buildSuccessRate: number;
  buildTime: number;
  artifactSize: number;
}
```

### **Quality Reports**
```yaml
# Quality reporting configuration
quality:
  reports:
    - type: coverage
      format: html
      output: coverage/
      thresholds:
        unit: 90
        integration: 80
        e2e: 70
    
    - type: performance
      format: json
      output: performance/
      thresholds:
        api: 200
        page: 2000
    
    - type: security
      format: sarif
      output: security/
      thresholds:
        vulnerabilities: 0
        score: 100
    
    - type: build
      format: markdown
      output: build/
      thresholds:
        success_rate: 100
        build_time: 300
```

---

## 🚨 **Failure Handling & Rollback**

### **CI Failure Scenarios**
| Failure Type | Action | Rollback Strategy |
|--------------|---------|-------------------|
| Type Check Failures | Block merge | Fix TypeScript errors |
| Test Failures | Block merge | Fix failing tests |
| Build Failures | Block merge | Fix build configuration |
| Security Issues | Block merge | Address vulnerabilities |
| Performance Degradation | Warning | Investigate and optimize |

### **Rollback Procedures**
```yaml
# Rollback workflow
rollback:
  triggers:
    - ci_failure
    - deployment_failure
    - performance_degradation
  
  actions:
    - revert_merge
    - redeploy_previous_version
    - rollback_database_migrations
    - notify_team
  
  verification:
    - health_checks
    - smoke_tests
    - performance_verification
```

---

## 📋 **Implementation Checklist**

### **Phase 1: CI Pipeline Setup**
- [ ] GitHub Actions workflows configured
- [ ] Quality gates implemented
- [ ] Automated testing integrated
- [ ] Security scanning operational

### **Phase 2: Quality Enforcement**
- [ ] Pre-commit hooks configured
- [ ] Coverage thresholds enforced
- [ ] Performance benchmarks set
- [ ] Security policies implemented

### **Phase 3: Monitoring & Reporting**
- [ ] Quality dashboard operational
- [ ] Automated reporting configured
- [ ] Alert system implemented
- [ ] Metrics collection active

### **Phase 4: Optimization**
- [ ] CI pipeline performance optimized
- [ ] Quality gates refined
- [ ] Failure handling improved
- [ ] Rollback procedures tested

---

**Document Version**: 1.0  
**Last Updated**: January 2025  
**Next Review**: February 2025  
**CI & Quality Gates Version**: 1.0.0

