# Pivotal Flow Backend - Comprehensive Test Suite

## Overview

This document describes the comprehensive test suite for the Pivotal Flow backend application. The test suite is designed to validate that we are not breaking features of the app and ensure high code quality and reliability.

## Test Architecture

### Test Types

1. **Unit Tests** (`service.layer.test.ts`)
   - Test individual service methods in isolation
   - Mock external dependencies
   - Focus on business logic validation
   - Fast execution (< 1 second per test)

2. **Integration Tests** (`database.integration.test.ts`, `api.functionality.test.ts`)
   - Test interactions between components
   - Use real database and Redis connections
   - Validate data persistence and retrieval
   - Test API endpoints with real HTTP requests

3. **End-to-End Tests** (`e2e.workflow.test.ts`)
   - Test complete user workflows
   - Validate entire feature functionality
   - Test error scenarios and recovery
   - Performance testing under load

### Test Categories

- **API Tests**: HTTP endpoint functionality, authentication, validation
- **Database Tests**: Data persistence, transactions, constraints
- **Service Tests**: Business logic, calculations, error handling
- **Workflow Tests**: Complete user journeys, status transitions

## Test Setup

### Prerequisites

- PostgreSQL running on `localhost:5433`
- Redis running on `localhost:6379`
- Node.js 20+ with pnpm

### Environment Configuration

```bash
# Test environment variables
NODE_ENV=test
DATABASE_URL=postgresql://pivotal:pivotal@localhost:5433/pivotal_test
REDIS_URL=redis://localhost:6379/1
```

### Test Database Setup

The test suite automatically:
- Connects to a separate test database
- Creates necessary tables
- Cleans up data between tests
- Isolates test data from production

## Running Tests

### Quick Start

```bash
# Run all tests
pnpm test:all

# Run specific test types
pnpm test:unit
pnpm test:integration
pnpm test:e2e

# Run with coverage
pnpm test:coverage

# Run in watch mode
pnpm test:watch
```

### CI/CD Integration

```bash
# Run tests for CI/CD pipeline
pnpm test:ci
```

### Test Runner Script

The custom test runner provides detailed reporting:

```bash
# Run with detailed reporting
tsx scripts/test-runner.ts all

# Run specific test types
tsx scripts/test-runner.ts unit
tsx scripts/test-runner.ts integration
tsx scripts/test-runner.ts e2e
```

## Test Coverage

### API Functionality Tests

#### Health & Infrastructure
- ✅ Health endpoint returns correct status
- ✅ API information endpoint
- ✅ Metrics endpoint functionality
- ✅ Prometheus metrics collection

#### Authentication
- ✅ Public routes accessible without auth
- ✅ Protected routes require authentication
- ✅ Valid JWT tokens accepted
- ✅ Invalid tokens rejected
- ✅ Rate limiting on auth endpoints

#### User Management
- ✅ User creation with validation
- ✅ User listing with pagination
- ✅ User retrieval by ID
- ✅ User data validation

#### Quote Management
- ✅ Quote creation with line items
- ✅ Quote listing and filtering
- ✅ Quote retrieval by ID
- ✅ Quote updates
- ✅ Quote status transitions
- ✅ Business rule validation

#### Error Handling
- ✅ Validation error responses
- ✅ Not found error handling
- ✅ Unauthorized access handling
- ✅ Rate limiting enforcement

### Database Integration Tests

#### Database Connectivity
- ✅ PostgreSQL connection
- ✅ Redis connection
- ✅ Transaction handling
- ✅ Connection pooling

#### User Service Integration
- ✅ User data persistence
- ✅ Role assignments
- ✅ Password hashing
- ✅ User search and filtering

#### Quote Service Integration
- ✅ Quote and line item creation
- ✅ Status transitions
- ✅ Data relationships
- ✅ Constraint validation

#### Cache Integration
- ✅ User data caching
- ✅ Cache expiration
- ✅ Cache invalidation
- ✅ Redis operations

#### Data Integrity
- ✅ Foreign key constraints
- ✅ Unique constraints
- ✅ Soft deletes
- ✅ Data validation

#### Performance Tests
- ✅ Bulk operations
- ✅ Concurrent operations
- ✅ Query optimization
- ✅ Connection management

### Service Layer Tests

#### Quote Service
- ✅ Total calculations
- ✅ Discount handling
- ✅ Data validation
- ✅ Quote number generation
- ✅ Status transition validation

#### User Service
- ✅ Data validation
- ✅ Password security
- ✅ Password verification
- ✅ Search functionality

#### Permission Service
- ✅ Permission checking
- ✅ Role-based access
- ✅ Policy overrides
- ✅ Security validation

#### Business Logic Validation
- ✅ Business rules enforcement
- ✅ Monetary calculations
- ✅ Currency conversions
- ✅ Validation logic

#### Error Handling
- ✅ Service error handling
- ✅ Meaningful error messages
- ✅ Error categorization
- ✅ Recovery mechanisms

### End-to-End Workflow Tests

#### Complete Quote Workflow
- ✅ Quote creation
- ✅ Quote updates
- ✅ Status transitions (draft → pending → approved → sent → accepted)
- ✅ Final state validation

#### User Management Workflow
- ✅ User creation
- ✅ User listing
- ✅ User retrieval
- ✅ Data consistency

#### Authentication Workflow
- ✅ User registration
- ✅ Login process
- ✅ Protected endpoint access
- ✅ Token validation

#### Error Recovery Scenarios
- ✅ Invalid operations
- ✅ Malformed requests
- ✅ Concurrent operations
- ✅ Error handling

#### Performance Under Load
- ✅ Concurrent requests
- ✅ Bulk operations
- ✅ Response times
- ✅ Resource usage

## Test Data Management

### Test Utilities

The test suite provides utilities for creating test data:

```typescript
// Create test user
const user = await testUtils.createTestUser({
  email: 'test@example.com',
  displayName: 'Test User'
});

// Create test organization
const org = await testUtils.createTestOrganization({
  name: 'Test Organization'
});

// Create test customer
const customer = await testUtils.createTestCustomer(org.id, {
  name: 'Test Customer'
});

// Generate JWT token
const token = testUtils.generateTestToken(user.id, org.id, ['admin']);

// Make authenticated request
const response = await testUtils.makeAuthenticatedRequest('/v1/quotes', {
  method: 'POST',
  payload: quoteData
});
```

### Data Cleanup

- Tests automatically clean up data between runs
- Each test starts with a clean database state
- Redis cache is cleared between tests
- No test data persists between test runs

## Test Configuration

### Vitest Configuration

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./src/__tests__/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    },
    testTimeout: 30000,
    hookTimeout: 30000
  }
});
```

### Test Setup

The test setup file (`src/__tests__/setup.ts`) handles:
- Database initialization
- Redis connection setup
- Test data cleanup
- Global test utilities
- Environment configuration

## Continuous Integration

### GitHub Actions Integration

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: pivotal
          POSTGRES_DB: pivotal_test
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
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm install -g pnpm
      - run: pnpm install
      - run: pnpm test:ci
```

### Pre-commit Hooks

```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "pnpm lint && pnpm test:unit",
      "pre-push": "pnpm test:all"
    }
  }
}
```

## Monitoring and Reporting

### Test Reports

The test runner generates detailed reports including:
- Test execution time
- Pass/fail statistics
- Code coverage metrics
- Performance benchmarks
- Error summaries

### Coverage Reports

- HTML coverage reports in `coverage/` directory
- JSON coverage data for CI integration
- Coverage thresholds enforcement
- Missing coverage identification

### Performance Metrics

- Response time tracking
- Database query performance
- Memory usage monitoring
- Concurrent request handling

## Best Practices

### Test Writing Guidelines

1. **Arrange-Act-Assert Pattern**
   ```typescript
   it('should calculate quote totals correctly', async () => {
     // Arrange
     const lineItems = [...];
     
     // Act
     const totals = quoteService.calculateQuoteTotals(lineItems, 0.15);
     
     // Assert
     expect(totals.subtotal).toBe(1250);
     expect(totals.taxAmount).toBe(187.5);
   });
   ```

2. **Descriptive Test Names**
   - Use clear, descriptive test names
   - Include the expected behavior
   - Mention the scenario being tested

3. **Test Isolation**
   - Each test should be independent
   - No shared state between tests
   - Clean up after each test

4. **Mock External Dependencies**
   - Mock external APIs
   - Use test databases
   - Isolate network calls

### Test Data Management

1. **Use Test Factories**
   - Create reusable test data builders
   - Maintain consistent test data
   - Avoid hardcoded values

2. **Clean Up Data**
   - Always clean up test data
   - Use database transactions
   - Reset state between tests

3. **Use Realistic Data**
   - Use realistic test scenarios
   - Test edge cases
   - Validate business rules

### Error Testing

1. **Test Error Scenarios**
   - Invalid input validation
   - Network failures
   - Database errors
   - Authentication failures

2. **Validate Error Messages**
   - Check error message content
   - Verify error codes
   - Test error recovery

3. **Test Edge Cases**
   - Boundary conditions
   - Null/undefined values
   - Empty data
   - Invalid formats

## Troubleshooting

### Common Issues

1. **Database Connection Issues**
   ```bash
   # Check PostgreSQL is running
   sudo systemctl status postgresql
   
   # Check Redis is running
   sudo systemctl status redis
   
   # Verify connection strings
   echo $DATABASE_URL
   echo $REDIS_URL
   ```

2. **Test Timeout Issues**
   - Increase test timeout in vitest config
   - Check for hanging database connections
   - Verify Redis connection pool

3. **Coverage Issues**
   - Check coverage thresholds
   - Identify uncovered code paths
   - Add tests for missing coverage

4. **Performance Issues**
   - Monitor database query performance
   - Check Redis connection pooling
   - Optimize test data setup

### Debug Mode

```bash
# Run tests with debug output
DEBUG=* pnpm test:all

# Run specific test with verbose output
pnpm test --reporter=verbose --run src/__tests__/api.functionality.test.ts
```

## Future Enhancements

### Planned Improvements

1. **Visual Regression Testing**
   - API response validation
   - Schema validation
   - Response format consistency

2. **Load Testing**
   - Stress testing
   - Performance benchmarking
   - Scalability validation

3. **Security Testing**
   - Authentication bypass testing
   - Authorization testing
   - Input validation testing

4. **Contract Testing**
   - API contract validation
   - Schema evolution testing
   - Backward compatibility

### Test Automation

1. **Automated Test Generation**
   - Generate tests from OpenAPI specs
   - Auto-generate test data
   - Coverage-driven test generation

2. **Intelligent Test Selection**
   - Run only affected tests
   - Parallel test execution
   - Test dependency management

3. **Continuous Testing**
   - Real-time test execution
   - Automated test maintenance
   - Performance regression detection

## Conclusion

This comprehensive test suite ensures that the Pivotal Flow backend maintains high quality and reliability. By covering unit, integration, and end-to-end scenarios, we can confidently make changes without breaking existing functionality.

The test suite provides:
- ✅ **Confidence**: Know that changes don't break existing features
- ✅ **Documentation**: Tests serve as living documentation
- ✅ **Refactoring Safety**: Safe to refactor with test coverage
- ✅ **Regression Prevention**: Catch issues before they reach production
- ✅ **Performance Monitoring**: Track performance over time

Regular test execution and monitoring ensures the application remains stable and performant as it evolves.
