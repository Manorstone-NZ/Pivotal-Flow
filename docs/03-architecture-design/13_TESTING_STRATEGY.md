# Pivotal Flow - Testing Strategy & Quality Assurance

## 🧪 **Testing Strategy Overview**

### **Testing Philosophy**
Our testing strategy follows the **Testing Pyramid** approach with comprehensive coverage across all layers:
- **Unit Tests**: 90%+ coverage for all business logic
- **Integration Tests**: 80%+ coverage for API endpoints and database operations
- **E2E Tests**: 70%+ coverage for critical user journeys
- **Performance Tests**: Load testing and performance benchmarking
- **Security Tests**: Automated security scanning and penetration testing

### **Testing Goals**
1. **Quality Assurance**: Ensure code meets enterprise-grade standards
2. **Regression Prevention**: Catch bugs before they reach production
3. **Documentation**: Tests serve as living documentation
4. **Confidence**: Enable safe deployments and refactoring
5. **Compliance**: Meet security and regulatory requirements

---

## 🏗️ **Testing Architecture**

### **1. Testing Stack**
```typescript
// Testing Framework Configuration
{
  "unit": {
    "framework": "Vitest",
    "coverage": "90%+",
    "targets": ["src/**/*.{ts,tsx}", "!src/**/*.d.ts"]
  },
  "integration": {
    "framework": "Jest + Supertest",
    "coverage": "80%+",
    "targets": ["src/**/*.test.ts", "src/**/*.spec.ts"]
  },
  "e2e": {
    "framework": "Playwright",
    "coverage": "70%+",
    "browsers": ["chromium", "firefox", "webkit"]
  },
  "performance": {
    "framework": "k6 + Artillery",
    "targets": ["API endpoints", "Database queries", "Frontend rendering"]
  },
  "security": {
    "tools": ["Semgrep", "Snyk", "OWASP ZAP"],
    "scanning": "Automated + Manual"
  }
}
```

### **2. Test Environment Setup**
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/coverage/**'
      ],
      thresholds: {
        global: {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});

// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/test/**',
    '!src/**/*.config.*'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts']
};
```

---

## 🧩 **Unit Testing Strategy**

### **1. Component Testing (React)**
```typescript
// src/components/ui/Button/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Button } from './Button';

describe('Button Component', () => {
  it('renders with correct text content', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('applies correct variant classes', () => {
    const { rerender } = render(<Button variant="primary">Button</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-primary-600');

    rerender(<Button variant="secondary">Button</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-gray-100');
  });

  it('handles click events correctly', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('disables button when disabled prop is true', () => {
    render(<Button disabled>Button</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('shows loading state when loading prop is true', () => {
    render(<Button loading>Button</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Button className="custom-class">Button</Button>);
    expect(screen.getByRole('button')).toHaveClass('custom-class');
  });
});
```

### **2. Service Layer Testing**
```typescript
// src/services/ProjectService.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProjectService } from './ProjectService';
import { ProjectRepository } from '@/repositories/ProjectRepository';
import { EventBus } from '@/events/EventBus';
import { Logger } from '@/utils/Logger';

// Mock dependencies
vi.mock('@/repositories/ProjectRepository');
vi.mock('@/events/EventBus');
vi.mock('@/utils/Logger');

describe('ProjectService', () => {
  let projectService: ProjectService;
  let mockProjectRepository: vi.Mocked<ProjectRepository>;
  let mockEventBus: vi.Mocked<EventBus>;
  let mockLogger: vi.Mocked<Logger>;

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockProjectRepository = new ProjectRepository() as vi.Mocked<ProjectRepository>;
    mockEventBus = new EventBus() as vi.Mocked<EventBus>;
    mockLogger = new Logger() as vi.Mocked<Logger>;
    
    projectService = new ProjectService(
      mockProjectRepository,
      mockEventBus,
      mockLogger
    );
  });

  describe('createProject', () => {
    it('creates project successfully', async () => {
      const projectData = {
        name: 'Test Project',
        description: 'Test Description',
        customer_id: 'customer-123',
        start_date: new Date('2025-01-01'),
        end_date: new Date('2025-12-31'),
        budget: 50000,
        currency: 'USD'
      };

      const expectedProject = {
        id: 'project-123',
        ...projectData,
        status: 'planning',
        created_at: new Date(),
        updated_at: new Date()
      };

      mockProjectRepository.create.mockResolvedValue(expectedProject);
      mockProjectRepository.save.mockResolvedValue(expectedProject);

      const result = await projectService.createProject(projectData);

      expect(result).toEqual(expectedProject);
      expect(mockProjectRepository.create).toHaveBeenCalledWith(projectData);
      expect(mockProjectRepository.save).toHaveBeenCalledWith(expectedProject);
      expect(mockEventBus.publish).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'PROJECT_CREATED',
          data: { projectId: expectedProject.id }
        })
      );
    });

    it('throws error when project creation fails', async () => {
      const projectData = { name: 'Test Project' };
      const error = new Error('Database connection failed');

      mockProjectRepository.create.mockRejectedValue(error);

      await expect(projectService.createProject(projectData)).rejects.toThrow('Database connection failed');
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to create project',
        expect.objectContaining({ error, projectData })
      );
    });

    it('validates required fields', async () => {
      const invalidProjectData = { name: '' };

      await expect(projectService.createProject(invalidProjectData)).rejects.toThrow('Project name is required');
    });
  });

  describe('updateProject', () => {
    it('updates project successfully', async () => {
      const projectId = 'project-123';
      const updates = { name: 'Updated Project Name' };
      const existingProject = {
        id: projectId,
        name: 'Old Name',
        status: 'active'
      };
      const updatedProject = { ...existingProject, ...updates };

      mockProjectRepository.findById.mockResolvedValue(existingProject);
      mockProjectRepository.update.mockResolvedValue(updatedProject);

      const result = await projectService.updateProject(projectId, updates);

      expect(result).toEqual(updatedProject);
      expect(mockProjectRepository.findById).toHaveBeenCalledWith(projectId);
      expect(mockProjectRepository.update).toHaveBeenCalledWith(projectId, updates);
    });

    it('throws error when project not found', async () => {
      const projectId = 'non-existent';
      const updates = { name: 'New Name' };

      mockProjectRepository.findById.mockResolvedValue(null);

      await expect(projectService.updateProject(projectId, updates)).rejects.toThrow('Project not found');
    });
  });
});
```

### **3. Utility Function Testing**
```typescript
// src/utils/validation.test.ts
import { describe, it, expect } from 'vitest';
import { validateEmail, validatePassword, validateProjectData } from './validation';

describe('Validation Utils', () => {
  describe('validateEmail', () => {
    it('validates correct email formats', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name+tag@domain.co.uk')).toBe(true);
      expect(validateEmail('123@numbers.com')).toBe(true);
    });

    it('rejects invalid email formats', () => {
      expect(validateEmail('invalid-email')).toBe(false);
      expect(validateEmail('@domain.com')).toBe(false);
      expect(validateEmail('user@')).toBe(false);
      expect(validateEmail('')).toBe(false);
      expect(validateEmail('user@domain')).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('validates strong passwords', () => {
      expect(validatePassword('StrongPass123!')).toBe(true);
      expect(validatePassword('Complex@Password2024')).toBe(true);
    });

    it('rejects weak passwords', () => {
      expect(validatePassword('weak')).toBe(false);
      expect(validatePassword('12345678')).toBe(false);
      expect(validatePassword('password')).toBe(false);
      expect(validatePassword('Password')).toBe(false);
      expect(validatePassword('Password123')).toBe(false);
    });
  });

  describe('validateProjectData', () => {
    it('validates complete project data', () => {
      const validData = {
        name: 'Test Project',
        description: 'Test Description',
        customer_id: 'customer-123',
        start_date: '2025-01-01',
        end_date: '2025-12-31',
        budget: 50000
      };

      const result = validateProjectData(validData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('reports validation errors', () => {
      const invalidData = {
        name: '',
        description: 'Test Description',
        customer_id: '',
        start_date: 'invalid-date',
        end_date: '2025-01-01',
        budget: -1000
      };

      const result = validateProjectData(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Project name is required');
      expect(result.errors).toContain('Customer ID is required');
      expect(result.errors).toContain('Invalid start date format');
      expect(result.errors).toContain('Budget must be positive');
    });
  });
});
```

---

## 🔗 **Integration Testing Strategy**

### **1. API Endpoint Testing**
```typescript
// src/api/projects/projects.test.ts
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '@/app';
import { createTestDatabase, clearTestDatabase } from '@/test/helpers/database';
import { createTestUser, generateAuthToken } from '@/test/helpers/auth';

describe('Projects API', () => {
  let testDb: any;
  let authToken: string;
  let testUser: any;

  beforeAll(async () => {
    testDb = await createTestDatabase();
    testUser = await createTestUser();
    authToken = generateAuthToken(testUser);
  });

  afterAll(async () => {
    await clearTestDatabase();
    await testDb.destroy();
  });

  beforeEach(async () => {
    await clearTestDatabase();
  });

  describe('GET /api/v1/projects', () => {
    it('returns projects list for authenticated user', async () => {
      // Create test projects
      const projects = [
        { name: 'Project Alpha', status: 'active' },
        { name: 'Project Beta', status: 'completed' }
      ];

      for (const project of projects) {
        await testDb('projects').insert({
          ...project,
          organization_id: testUser.organization_id,
          created_by: testUser.id
        });
      }

      const response = await request(app)
        .get('/api/v1/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0].name).toBe('Project Alpha');
      expect(response.body.data[1].name).toBe('Project Beta');
      expect(response.body.pagination.total).toBe(2);
    });

    it('filters projects by status', async () => {
      // Create test projects with different statuses
      await testDb('projects').insert([
        { name: 'Active Project', status: 'active', organization_id: testUser.organization_id, created_by: testUser.id },
        { name: 'Completed Project', status: 'completed', organization_id: testUser.organization_id, created_by: testUser.id }
      ]);

      const response = await request(app)
        .get('/api/v1/projects?status=active')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].status).toBe('active');
    });

    it('paginates results correctly', async () => {
      // Create 25 test projects
      const projects = Array.from({ length: 25 }, (_, i) => ({
        name: `Project ${i + 1}`,
        status: 'active',
        organization_id: testUser.organization_id,
        created_by: testUser.id
      }));

      await testDb('projects').insert(projects);

      const response = await request(app)
        .get('/api/v1/projects?page=2&limit=10')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data).toHaveLength(10);
      expect(response.body.pagination.page).toBe(2);
      expect(response.body.pagination.limit).toBe(10);
      expect(response.body.pagination.total).toBe(25);
    });

    it('returns 401 for unauthenticated requests', async () => {
      await request(app)
        .get('/api/v1/projects')
        .expect(401);
    });
  });

  describe('POST /api/v1/projects', () => {
    it('creates new project successfully', async () => {
      const projectData = {
        name: 'New Project',
        description: 'Project Description',
        customer_id: 'customer-123',
        start_date: '2025-01-01',
        end_date: '2025-12-31',
        budget: 50000,
        currency: 'USD'
      };

      const response = await request(app)
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send(projectData)
        .expect(201);

      expect(response.body.project.name).toBe(projectData.name);
      expect(response.body.project.status).toBe('planning');
      expect(response.body.project.organization_id).toBe(testUser.organization_id);
      expect(response.body.project.created_by).toBe(testUser.id);

      // Verify project was saved to database
      const savedProject = await testDb('projects')
        .where('id', response.body.project.id)
        .first();
      
      expect(savedProject).toBeTruthy();
      expect(savedProject.name).toBe(projectData.name);
    });

    it('validates required fields', async () => {
      const invalidData = { name: '' };

      const response = await request(app)
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.errors).toContain('Project name is required');
    });

    it('validates date ranges', async () => {
      const invalidData = {
        name: 'Test Project',
        start_date: '2025-12-31',
        end_date: '2025-01-01'
      };

      const response = await request(app)
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.errors).toContain('End date must be after start date');
    });
  });

  describe('PUT /api/v1/projects/:id', () => {
    it('updates existing project', async () => {
      // Create test project
      const [projectId] = await testDb('projects').insert({
        name: 'Original Name',
        status: 'planning',
        organization_id: testUser.organization_id,
        created_by: testUser.id
      });

      const updates = { name: 'Updated Name', status: 'active' };

      const response = await request(app)
        .put(`/api/v1/projects/${projectId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updates)
        .expect(200);

      expect(response.body.project.name).toBe('Updated Name');
      expect(response.body.project.status).toBe('active');

      // Verify database was updated
      const updatedProject = await testDb('projects')
        .where('id', projectId)
        .first();
      
      expect(updatedProject.name).toBe('Updated Name');
      expect(updatedProject.status).toBe('active');
    });

    it('returns 404 for non-existent project', async () => {
      const updates = { name: 'Updated Name' };

      await request(app)
        .put('/api/v1/projects/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updates)
        .expect(404);
    });
  });
});
```

### **2. Database Integration Testing**
```typescript
// src/repositories/ProjectRepository.test.ts
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { ProjectRepository } from './ProjectRepository';
import { createTestDatabase, clearTestDatabase } from '@/test/helpers/database';
import { createTestUser, createTestOrganization } from '@/test/helpers/testData';

describe('ProjectRepository', () => {
  let repository: ProjectRepository;
  let testDb: any;
  let testUser: any;
  let testOrg: any;

  beforeAll(async () => {
    testDb = await createTestDatabase();
    testOrg = await createTestOrganization();
    testUser = await createTestUser(testOrg.id);
    repository = new ProjectRepository(testDb);
  });

  afterAll(async () => {
    await clearTestDatabase();
    await testDb.destroy();
  });

  beforeEach(async () => {
    await clearTestDatabase();
  });

  describe('create', () => {
    it('creates project with all required fields', async () => {
      const projectData = {
        name: 'Test Project',
        description: 'Test Description',
        organization_id: testOrg.id,
        customer_id: 'customer-123',
        start_date: new Date('2025-01-01'),
        end_date: new Date('2025-12-31'),
        budget: 50000,
        currency: 'USD',
        project_manager_id: testUser.id
      };

      const project = await repository.create(projectData);

      expect(project.id).toBeDefined();
      expect(project.name).toBe(projectData.name);
      expect(project.organization_id).toBe(testOrg.id);
      expect(project.created_at).toBeInstanceOf(Date);
      expect(project.updated_at).toBeInstanceOf(Date);
    });

    it('sets default values correctly', async () => {
      const projectData = {
        name: 'Test Project',
        organization_id: testOrg.id,
        customer_id: 'customer-123',
        start_date: new Date('2025-01-01'),
        end_date: new Date('2025-12-31'),
        budget: 50000
      };

      const project = await repository.create(projectData);

      expect(project.status).toBe('planning');
      expect(project.priority).toBe('medium');
      expect(project.currency).toBe('USD');
      expect(project.tags).toEqual([]);
    });
  });

  describe('findById', () => {
    it('finds project by ID', async () => {
      const projectData = {
        name: 'Test Project',
        organization_id: testOrg.id,
        customer_id: 'customer-123',
        start_date: new Date('2025-01-01'),
        end_date: new Date('2025-12-31'),
        budget: 50000
      };

      const createdProject = await repository.create(projectData);
      const foundProject = await repository.findById(createdProject.id);

      expect(foundProject).toBeDefined();
      expect(foundProject?.id).toBe(createdProject.id);
      expect(foundProject?.name).toBe(projectData.name);
    });

    it('returns null for non-existent project', async () => {
      const project = await repository.findById('non-existent-id');
      expect(project).toBeNull();
    });
  });

  describe('findByOrganization', () => {
    it('finds all projects for organization', async () => {
      const projects = [
        { name: 'Project Alpha', organization_id: testOrg.id, customer_id: 'customer-1', start_date: new Date(), end_date: new Date(), budget: 10000 },
        { name: 'Project Beta', organization_id: testOrg.id, customer_id: 'customer-2', start_date: new Date(), end_date: new Date(), budget: 20000 }
      ];

      for (const projectData of projects) {
        await repository.create(projectData);
      }

      const foundProjects = await repository.findByOrganization(testOrg.id);

      expect(foundProjects).toHaveLength(2);
      expect(foundProjects[0].name).toBe('Project Alpha');
      expect(foundProjects[1].name).toBe('Project Beta');
    });

    it('filters by status', async () => {
      const projects = [
        { name: 'Active Project', status: 'active', organization_id: testOrg.id, customer_id: 'customer-1', start_date: new Date(), end_date: new Date(), budget: 10000 },
        { name: 'Completed Project', status: 'completed', organization_id: testOrg.id, customer_id: 'customer-2', start_date: new Date(), end_date: new Date(), budget: 20000 }
      ];

      for (const projectData of projects) {
        await repository.create(projectData);
      }

      const activeProjects = await repository.findByOrganization(testOrg.id, { status: 'active' });

      expect(activeProjects).toHaveLength(1);
      expect(activeProjects[0].status).toBe('active');
    });
  });

  describe('update', () => {
    it('updates project fields', async () => {
      const project = await repository.create({
        name: 'Original Name',
        organization_id: testOrg.id,
        customer_id: 'customer-123',
        start_date: new Date(),
        end_date: new Date(),
        budget: 10000
      });

      const updates = { name: 'Updated Name', status: 'active' };
      const updatedProject = await repository.update(project.id, updates);

      expect(updatedProject.name).toBe('Updated Name');
      expect(updatedProject.status).toBe('active');
      expect(updatedProject.updated_at.getTime()).toBeGreaterThan(project.updated_at.getTime());
    });

    it('preserves unchanged fields', async () => {
      const project = await repository.create({
        name: 'Test Project',
        organization_id: testOrg.id,
        customer_id: 'customer-123',
        start_date: new Date(),
        end_date: new Date(),
        budget: 10000
      });

      const updates = { status: 'active' };
      const updatedProject = await repository.update(project.id, updates);

      expect(updatedProject.name).toBe('Test Project');
      expect(updatedProject.budget).toBe(10000);
      expect(updatedProject.status).toBe('active');
    });
  });

  describe('delete', () => {
    it('soft deletes project', async () => {
      const project = await repository.create({
        name: 'Test Project',
        organization_id: testOrg.id,
        customer_id: 'customer-123',
        start_date: new Date(),
        end_date: new Date(),
        budget: 10000
      });

      await repository.delete(project.id);

      const deletedProject = await repository.findById(project.id);
      expect(deletedProject).toBeNull();

      // Check soft delete
      const rawProject = await testDb('projects').where('id', project.id).first();
      expect(rawProject.deleted_at).toBeDefined();
    });
  });
});
```

---

## 🌐 **End-to-End Testing Strategy**

### **1. Playwright Configuration**
```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  
  use: {
    baseURL: process.env.TEST_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] }
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] }
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] }
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] }
    }
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000
  }
});
```

### **2. E2E Test Examples**
```typescript
// tests/e2e/auth.spec.ts
import { test, expect } from '@playwright/test';
import { createTestUser, deleteTestUser } from '../helpers/testData';

test.describe('Authentication', () => {
  let testUser: any;

  test.beforeAll(async () => {
    testUser = await createTestUser();
  });

  test.afterAll(async () => {
    await deleteTestUser(testUser.id);
  });

  test('user can login successfully', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('[data-testid="email-input"]', testUser.email);
    await page.fill('[data-testid="password-input"]', testUser.password);
    await page.click('[data-testid="login-button"]');

    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
  });

  test('user cannot login with invalid credentials', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('[data-testid="email-input"]', 'invalid@example.com');
    await page.fill('[data-testid="password-input"]', 'wrongpassword');
    await page.click('[data-testid="login-button"]');

    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Invalid credentials');
    await expect(page).toHaveURL('/login');
  });

  test('user can logout successfully', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', testUser.email);
    await page.fill('[data-testid="password-input"]', testUser.password);
    await page.click('[data-testid="login-button"]');

    // Verify logged in
    await expect(page).toHaveURL('/dashboard');

    // Logout
    await page.click('[data-testid="user-menu"]');
    await page.click('[data-testid="logout-button"]');

    await expect(page).toHaveURL('/login');
    await expect(page.locator('[data-testid="login-form"]')).toBeVisible();
  });
});

// tests/e2e/projects.spec.ts
import { test, expect } from '@playwright/test';
import { createTestUser, createTestProject, deleteTestUser, deleteTestProject } from '../helpers/testData';

test.describe('Project Management', () => {
  let testUser: any;
  let testProject: any;

  test.beforeAll(async () => {
    testUser = await createTestUser();
  });

  test.afterAll(async () => {
    await deleteTestUser(testUser.id);
  });

  test.beforeEach(async () => {
    testProject = await createTestProject(testUser.organization_id);
  });

  test.afterEach(async () => {
    await deleteTestProject(testProject.id);
  });

  test('user can create new project', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', testUser.email);
    await page.fill('[data-testid="password-input"]', testUser.password);
    await page.click('[data-testid="login-button"]');

    // Navigate to projects
    await page.goto('/projects');
    await page.click('[data-testid="create-project-button"]');

    // Fill project form
    await page.fill('[data-testid="project-name-input"]', 'New Test Project');
    await page.fill('[data-testid="project-description-input"]', 'Project description');
    await page.fill('[data-testid="project-budget-input"]', '50000');
    await page.selectOption('[data-testid="project-customer-select"]', 'customer-123');
    await page.fill('[data-testid="project-start-date"]', '2025-01-01');
    await page.fill('[data-testid="project-end-date"]', '2025-12-31');

    // Submit form
    await page.click('[data-testid="save-project-button"]');

    // Verify success
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    await expect(page).toHaveURL(/\/projects\/\d+/);
    await expect(page.locator('[data-testid="project-name"]')).toContainText('New Test Project');
  });

  test('user can edit existing project', async ({ page }) => {
    // Login and navigate to project
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', testUser.email);
    await page.fill('[data-testid="password-input"]', testUser.password);
    await page.click('[data-testid="login-button"]');

    await page.goto(`/projects/${testProject.id}`);

    // Edit project
    await page.click('[data-testid="edit-project-button"]');
    await page.fill('[data-testid="project-name-input"]', 'Updated Project Name');
    await page.click('[data-testid="save-project-button"]');

    // Verify changes
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="project-name"]')).toContainText('Updated Project Name');
  });

  test('user can delete project', async ({ page }) => {
    // Login and navigate to project
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', testUser.email);
    await page.fill('[data-testid="password-input"]', testUser.password);
    await page.click('[data-testid="login-button"]');

    await page.goto(`/projects/${testProject.id}`);

    // Delete project
    await page.click('[data-testid="delete-project-button"]');
    await page.click('[data-testid="confirm-delete-button"]');

    // Verify redirect to projects list
    await expect(page).toHaveURL('/projects');
    await expect(page.locator('[data-testid="success-message"]')).toContainText('Project deleted successfully');
  });
});
```

---

## 📊 **Performance Testing Strategy**

### **1. k6 Load Testing**
```typescript
// tests/performance/api-load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '2m', target: 10 },  // Ramp up to 10 users
    { duration: '5m', target: 10 },  // Stay at 10 users
    { duration: '2m', target: 50 },  // Ramp up to 50 users
    { duration: '5m', target: 50 },  // Stay at 50 users
    { duration: '2m', target: 0 },   // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests must complete below 500ms
    http_req_failed: ['rate<0.1'],    // Error rate must be below 10%
    errors: ['rate<0.1']
  }
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3002';
let authToken = null;

export function setup() {
  // Login to get auth token
  const loginRes = http.post(`${BASE_URL}/api/v1/auth/login`, {
    email: 'test@example.com',
    password: 'testpassword'
  });

  if (loginRes.status === 200) {
    const body = JSON.parse(loginRes.body);
    authToken = body.access_token;
  }

  return { authToken };
}

export default function(data) {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${data.authToken}`
  };

  // Test projects endpoint
  const projectsRes = http.get(`${BASE_URL}/api/v1/projects`, { headers });
  
  check(projectsRes, {
    'projects status is 200': (r) => r.status === 200,
    'projects response time < 200ms': (r) => r.timings.duration < 200,
  }) || errorRate.add(1);

  // Test project creation
  const createProjectRes = http.post(`${BASE_URL}/api/v1/projects`, JSON.stringify({
    name: `Test Project ${Date.now()}`,
    description: 'Performance test project',
    customer_id: 'customer-123',
    start_date: '2025-01-01',
    end_date: '2025-12-31',
    budget: 50000
  }), { headers });

  check(createProjectRes, {
    'create project status is 201': (r) => r.status === 201,
    'create project response time < 500ms': (r) => r.timings.duration < 500,
  }) || errorRate.add(1);

  sleep(1);
}

// tests/performance/database-performance.js
import { check } from 'k6';
import { http } from 'k6/http';

export const options = {
  vus: 20,
  duration: '5m',
  thresholds: {
    http_req_duration: ['p(95)<1000'], // 95% of requests must complete below 1s
    http_req_failed: ['rate<0.05']      // Error rate must be below 5%
  }
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3002';

export default function() {
  // Test database query performance
  const response = http.get(`${BASE_URL}/api/v1/projects?limit=100&sort_by=created_at&sort_order=desc`);
  
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 1s': (r) => r.timings.duration < 1000,
    'response size < 100KB': (r) => r.body.length < 100000,
  });
}
```

---

## 🔒 **Security Testing Strategy**

### **1. Automated Security Scanning**
```typescript
// .github/workflows/security-scan.yml
name: Security Scan

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM

jobs:
  security-scan:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Run Semgrep
      uses: returntocorp/semgrep-action@v1
      with:
        config: >-
          p/security-audit
          p/secrets
          p/owasp-top-ten
        output-format: sarif
        output-file: semgrep-results.sarif

    - name: Run Snyk
      uses: snyk/actions/node@master
      env:
        SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
      with:
        args: --severity-threshold=high

    - name: Run OWASP ZAP
      uses: zaproxy/action-full-scan@v0.8.0
      with:
        target: 'http://localhost:3000'
        rules_file_name: '.zap/rules.tsv'
        cmd_options: '-a'

    - name: Upload security results
      uses: github/codeql-action/upload-sarif@v3
      with:
        sarif_file: semgrep-results.sarif
```

### **2. Security Test Examples**
```typescript
// tests/security/auth-security.test.ts
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '@/app';
import { createTestUser } from '@/test/helpers/testData';

describe('Authentication Security', () => {
  it('prevents brute force attacks', async () => {
    const testUser = await createTestUser();
    
    // Attempt multiple failed logins
    for (let i = 0; i < 5; i++) {
      await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword'
        })
        .expect(401);
    }

    // Account should be locked
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password
      });

    expect(response.status).toBe(423); // Locked
    expect(response.body.error).toBe('Account temporarily locked');
  });

  it('enforces password complexity requirements', async () => {
    const weakPasswords = [
      'password',
      '123456',
      'abc123',
      'Password',
      'Password123'
    ];

    for (const password of weakPasswords) {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'test@example.com',
          password: password,
          firstName: 'Test',
          lastName: 'User'
        });

      expect(response.status).toBe(400);
      expect(response.body.errors).toContain('Password does not meet complexity requirements');
    }
  });

  it('prevents SQL injection attacks', async () => {
    const maliciousInputs = [
      "'; DROP TABLE users; --",
      "' OR '1'='1",
      "'; INSERT INTO users VALUES ('hacker', 'password'); --"
    ];

    for (const input of maliciousInputs) {
      const response = await request(app)
        .get(`/api/v1/projects?search=${encodeURIComponent(input)}`)
        .expect(400);

      expect(response.body.error).toBe('Invalid search parameter');
    }
  });

  it('prevents XSS attacks', async () => {
    const maliciousInputs = [
      '<script>alert("xss")</script>',
      'javascript:alert("xss")',
      '<img src="x" onerror="alert(\'xss\')">'
    ];

    for (const input of maliciousInputs) {
      const response = await request(app)
        .post('/api/v1/projects')
        .send({
          name: input,
          description: 'Test project',
          customer_id: 'customer-123',
          start_date: '2025-01-01',
          end_date: '2025-12-31',
          budget: 10000
        });

      expect(response.status).toBe(400);
      expect(response.body.errors).toContain('Invalid characters detected');
    }
  });
});
```

---

## 📋 **Implementation Checklist**

### **Phase 1: Testing Infrastructure**
- [ ] Set up testing frameworks (Vitest, Jest, Playwright)
- [ ] Configure test databases and test data helpers
- [ ] Set up CI/CD pipeline for automated testing
- [ ] Create test utilities and mock factories

### **Phase 2: Unit Testing**
- [ ] Component testing with 90%+ coverage
- [ ] Service layer testing with 90%+ coverage
- [ ] Utility function testing with 95%+ coverage
- [ ] Repository layer testing with 90%+ coverage

### **Phase 3: Integration Testing**
- [ ] API endpoint testing with 80%+ coverage
- [ ] Database integration testing
- [ ] External service integration testing
- [ ] Authentication and authorization testing

### **Phase 4: E2E Testing**
- [ ] Critical user journey testing
- [ ] Cross-browser compatibility testing
- [ ] Mobile responsiveness testing
- [ ] Accessibility testing

### **Phase 5: Performance & Security**
- [ ] Load testing and performance benchmarking
- [ ] Security vulnerability scanning
- [ ] Penetration testing
- [ ] Compliance testing

---

**Document Version**: 1.0  
**Last Updated**: January 2025  
**Next Review**: February 2025  
**Testing Strategy Version**: 1.0.0
