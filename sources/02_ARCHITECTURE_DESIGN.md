# Pivotal Flow - Complete System Architecture Design

## 🏗️ **Architecture Overview**

### **System Vision**
Pivotal Flow is designed as a **modern, microservices-based enterprise application** that follows Domain-Driven Design (DDD) principles, Clean Architecture patterns, and event-driven architecture for scalability and maintainability.

### **Architectural Goals**
1. **Scalability**: Support 1000+ concurrent users with horizontal scaling
2. **Maintainability**: Clear separation of concerns and modular design
3. **Reliability**: 99.9%+ uptime with comprehensive error handling
4. **Security**: Multi-layered security with zero-trust principles
5. **Performance**: Sub-200ms API response times for 95th percentile
6. **Compliance**: Full adherence to enterprise security and privacy standards

---

## 🏛️ **High-Level Architecture**

### **System Architecture Diagram**
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Pivotal Flow Enterprise                       │
├─────────────────────────────────────────────────────────────────────────────┤
│  Presentation Layer                                                        │
│  ├── Admin Portal (React + TypeScript)                                    │
│  ├── Customer Portal (React + TypeScript)                                 │
│  ├── Mobile App (React Native + TypeScript)                               │
│  └── Public API Gateway (OpenAPI + GraphQL)                               │
├─────────────────────────────────────────────────────────────────────────────┤
│  API Gateway Layer                                                         │
│  ├── Authentication & Authorization                                        │
│  ├── Rate Limiting & Security                                             │
│  ├── Request Routing & Load Balancing                                     │
│  ├── API Documentation (OpenAPI/Swagger)                                  │
│  └── Request/Response Transformation                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│  Microservices Layer                                                       │
│  ├── User Management Service                                              │
│  ├── Quotation Service                                                    │
│  ├── Project Management Service                                           │
│  ├── Time Management Service                                              │
│  ├── Invoice Service                                                      │
│  ├── Customer Management Service                                          │
│  ├── Reporting Service                                                    │
│  └── Integration Service (Xero, etc.)                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│  Data Layer                                                               │
│  ├── Primary Database (PostgreSQL 16+)                                    │
│  ├── Cache Layer (Redis 7+)                                               │
│  ├── Search Engine (Elasticsearch 8+)                                     │
│  ├── Message Queue (RabbitMQ/Kafka)                                       │
│  └── File Storage (AWS S3 / MinIO)                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│  Infrastructure Layer                                                      │
│  ├── Container Orchestration (Kubernetes)                                 │
│  ├── Service Mesh (Istio)                                                 │
│  ├── Monitoring (Prometheus + Grafana)                                    │
│  ├── Logging (ELK Stack)                                                  │
│  └── CI/CD (GitHub Actions + ArgoCD)                                      │
└─────────────────────────────────────────────────────────────────────────────┘
```

### **Architecture Principles**

#### **1. Domain-Driven Design (DDD)**
- **Bounded Contexts**: Clear boundaries between business domains
- **Ubiquitous Language**: Consistent terminology across codebase
- **Domain Models**: Rich business logic encapsulation
- **Aggregate Roots**: Data consistency and transaction boundaries

#### **2. Clean Architecture**
- **Dependency Inversion**: High-level modules independent of low-level details
- **Separation of Concerns**: Clear layers with specific responsibilities
- **Testability**: Business logic independent of frameworks
- **Maintainability**: Easy to modify and extend

#### **3. Event-Driven Architecture**
- **Asynchronous Processing**: Non-blocking operations for scalability
- **Event Sourcing**: Complete audit trail of all changes
- **CQRS Pattern**: Separate read and write models
- **Message Queues**: Reliable communication between services

#### **4. API-First Design**
- **RESTful APIs**: Standard HTTP methods and status codes
- **GraphQL Support**: Flexible data querying for complex requirements
- **WebSocket Support**: Real-time features and notifications
- **Comprehensive Documentation**: OpenAPI specifications for all endpoints

---

## 🧩 **Service Architecture**

### **1. User Management Service**

#### **Service Responsibilities**
- User authentication and authorization
- Role-based access control (RBAC)
- Multi-factor authentication (MFA)
- Session management and security
- User profile and preferences

#### **Service Interface**
```typescript
interface IUserManagementService {
  // Authentication
  authenticateUser(credentials: IUserCredentials): Promise<IAuthResult>;
  validateToken(token: string): Promise<ITokenValidation>;
  refreshToken(refreshToken: string): Promise<IAuthResult>;
  
  // User Management
  createUser(userData: ICreateUserRequest): Promise<IUser>;
  getUserById(id: string): Promise<IUser | null>;
  updateUser(id: string, updates: IUpdateUserRequest): Promise<IUser>;
  deleteUser(id: string): Promise<void>;
  
  // Authorization
  checkPermission(userId: string, resource: string, action: string): Promise<boolean>;
  getUserRoles(userId: string): Promise<IRole[]>;
  assignRole(userId: string, roleId: string): Promise<void>;
  
  // Security
  enableMFA(userId: string): Promise<IMFASetup>;
  verifyMFA(userId: string, code: string): Promise<boolean>;
  lockUser(userId: string, reason: string): Promise<void>;
}
```

#### **Service Implementation**
```typescript
class UserManagementService implements IUserManagementService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly authService: IAuthService,
    private readonly roleService: IRoleService,
    private readonly eventBus: IEventBus,
    private readonly logger: ILogger
  ) {}

  async authenticateUser(credentials: IUserCredentials): Promise<IAuthResult> {
    try {
      // Validate credentials
      const user = await this.userRepository.findByEmail(credentials.email);
      if (!user || !await this.authService.verifyPassword(credentials.password, user.passwordHash)) {
        throw new AuthenticationError('Invalid credentials');
      }

      // Check user status
      if (user.status !== 'active') {
        throw new AuthenticationError('User account is not active');
      }

      // Generate tokens
      const accessToken = await this.authService.generateAccessToken(user);
      const refreshToken = await this.authService.generateRefreshToken(user);

      // Update login statistics
      await this.userRepository.updateLoginStats(user.id);

      // Publish event
      await this.eventBus.publish('user.authenticated', { userId: user.id });

      this.logger.info('User authenticated successfully', { userId: user.id });
      
      return {
        accessToken,
        refreshToken,
        user: this.sanitizeUserData(user),
        expiresIn: 3600
      };
    } catch (error) {
      this.logger.error('Authentication failed', { error, email: credentials.email });
      throw error;
    }
  }

  private sanitizeUserData(user: IUser): IPublicUser {
    const { passwordHash, mfaSecret, ...publicUser } = user;
    return publicUser;
  }
}
```

### **2. Quotation Service**

#### **Service Responsibilities**
- Quote creation and management
- Pricing engine and calculations
- Rate card management
- Quote approval workflows
- PDF generation and templates

#### **Service Interface**
```typescript
interface IQuotationService {
  // Quote Management
  createQuote(quoteData: ICreateQuoteRequest): Promise<IQuote>;
  getQuoteById(id: string): Promise<IQuote | null>;
  updateQuote(id: string, updates: IUpdateQuoteRequest): Promise<IQuote>;
  deleteQuote(id: string): Promise<void>;
  
  // Pricing Engine
  calculateQuotePricing(quoteId: string): Promise<IQuotePricing>;
  applyDiscounts(quoteId: string, discounts: IDiscount[]): Promise<IQuotePricing>;
  calculateTaxes(quoteId: string, taxRules: ITaxRule[]): Promise<IQuotePricing>;
  
  // Workflow Management
  submitForApproval(quoteId: string): Promise<IWorkflowResult>;
  approveQuote(quoteId: string, approverId: string): Promise<IWorkflowResult>;
  rejectQuote(quoteId: string, approverId: string, reason: string): Promise<IWorkflowResult>;
  
  // PDF Generation
  generateQuotePDF(quoteId: string, templateId: string): Promise<Buffer>;
  getAvailableTemplates(organizationId: string): Promise<ITemplate[]>;
}
```

### **3. Project Management Service**

#### **Service Responsibilities**
- Project lifecycle management
- Task and milestone tracking
- Resource allocation and capacity planning
- Project reporting and analytics
- Integration with time tracking

#### **Service Interface**
```typescript
interface IProjectManagementService {
  // Project Management
  createProject(projectData: ICreateProjectRequest): Promise<IProject>;
  getProjectById(id: string): Promise<IProject | null>;
  updateProject(id: string, updates: IUpdateProjectRequest): Promise<IProject>;
  deleteProject(id: string): Promise<void>;
  
  // Task Management
  createTask(taskData: ICreateTaskRequest): Promise<IProjectTask>;
  updateTask(id: string, updates: IUpdateTaskRequest): Promise<IProjectTask>;
  deleteTask(id: string): Promise<void>;
  assignTask(taskId: string, userId: string): Promise<void>;
  
  // Project Planning
  createMilestone(milestoneData: ICreateMilestoneRequest): Promise<IMilestone>;
  updateProjectTimeline(projectId: string, timeline: IProjectTimeline): Promise<IProject>;
  allocateResources(projectId: string, allocations: IResourceAllocation[]): Promise<void>;
  
  // Reporting
  getProjectMetrics(projectId: string): Promise<IProjectMetrics>;
  getProjectTimeline(projectId: string): Promise<IProjectTimeline>;
  generateProjectReport(projectId: string, reportType: string): Promise<IProjectReport>;
}
```

---

## 🔄 **Event-Driven Architecture**

### **Event Structure**

#### **Event Base Interface**
```typescript
interface IBaseEvent {
  id: string;
  type: string;
  aggregateId: string;
  aggregateType: string;
  organizationId: string;
  userId?: string;
  timestamp: Date;
  version: number;
  metadata: Record<string, any>;
}

interface IEventMetadata {
  correlationId: string;
  causationId?: string;
  source: string;
  userAgent?: string;
  ipAddress?: string;
}
```

#### **Domain Events**
```typescript
// User Management Events
interface IUserCreatedEvent extends IBaseEvent {
  type: 'user.created';
  data: {
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
    organizationId: string;
  };
}

interface IUserAuthenticatedEvent extends IBaseEvent {
  type: 'user.authenticated';
  data: {
    userId: string;
    loginMethod: string;
    ipAddress: string;
    userAgent: string;
  };
}

// Quotation Events
interface IQuoteCreatedEvent extends IBaseEvent {
  type: 'quote.created';
  data: {
    quoteId: string;
    quoteNumber: string;
    customerId: string;
    totalAmount: number;
    currency: string;
  };
}

interface IQuoteStatusChangedEvent extends IBaseEvent {
  type: 'quote.status.changed';
  data: {
    quoteId: string;
    oldStatus: string;
    newStatus: string;
    reason?: string;
  };
}
```

### **Event Handlers**

#### **Event Handler Interface**
```typescript
interface IEventHandler<T extends IBaseEvent> {
  handle(event: T): Promise<void>;
}

interface IEventBus {
  publish<T extends IBaseEvent>(event: T): Promise<void>;
  subscribe<T extends IBaseEvent>(eventType: string, handler: IEventHandler<T>): void;
  unsubscribe(eventType: string, handler: IEventHandler<T>): void;
}
```

---

## 🔒 **Security Architecture**

### **Authentication & Authorization**

#### **JWT Token Structure**
```typescript
interface IJWTPayload {
  sub: string;           // User ID
  org: string;           // Organization ID
  aud: string;           // Audience (service name)
  iss: string;           // Issuer (auth service)
  iat: number;           // Issued at
  exp: number;           // Expiration time
  nbf: number;           // Not before
  jti: string;           // JWT ID
  roles: string[];       // User roles
  permissions: string[]; // User permissions
  mfa: boolean;          // MFA verified
}
```

#### **Permission System**
```typescript
interface IPermission {
  id: string;
  name: string;
  resource: string;
  action: string;
  conditions?: IPermissionCondition[];
}

class PermissionService {
  async checkPermission(
    userId: string,
    resource: string,
    action: string,
    context: Record<string, any> = {}
  ): Promise<boolean> {
    // Get user permissions
    const permissions = await this.getUserPermissions(userId);
    
    // Find matching permission
    const permission = permissions.find(p => 
      p.resource === resource && p.action === action
    );

    if (!permission) {
      return false;
    }

    // Check conditions if any
    if (permission.conditions) {
      return this.evaluateConditions(permission.conditions, context);
    }

    return true;
  }
}
```

---

## 📊 **Performance & Scalability**

### **Caching Strategy**

#### **Multi-Level Caching**
```typescript
interface ICacheStrategy {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
}

class MultiLevelCache implements ICacheStrategy {
  constructor(
    private readonly l1Cache: ICacheStrategy,  // In-memory cache
    private readonly l2Cache: ICacheStrategy   // Redis cache
  ) {}

  async get<T>(key: string): Promise<T | null> {
    // Try L1 cache first
    let value = await this.l1Cache.get<T>(key);
    if (value !== null) {
      return value;
    }

    // Try L2 cache
    value = await this.l2Cache.get<T>(key);
    if (value !== null) {
      // Populate L1 cache
      await this.l1Cache.set(key, value, 300); // 5 minutes TTL
      return value;
    }

    return null;
  }
}
```

---

## 🎯 **Implementation Guidelines**

### **Service Development Workflow**

1. **Interface Definition**: Define service interfaces with TypeScript
2. **Implementation**: Implement services following Clean Architecture principles
3. **Testing**: Write comprehensive unit and integration tests
4. **Documentation**: Document API endpoints and service behavior
5. **Deployment**: Deploy with proper monitoring and observability

### **Code Quality Standards**

- **Type Safety**: 100% TypeScript coverage with strict mode
- **Error Handling**: Comprehensive error handling with proper logging
- **Performance**: Sub-200ms response times for all endpoints
- **Security**: Input validation, authentication, and authorization on all endpoints
- **Testing**: 90%+ test coverage for all services

---

**Document Version**: 1.0  
**Last Updated**: January 2025  
**Next Review**: February 2025  
**Architecture Version**: 1.0.0
