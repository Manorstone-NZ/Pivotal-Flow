# Pivotal Flow - Microservices Architecture & Service Design

## 🏗️ **Microservices Overview**

### **Architecture Principles**
1. **Single Responsibility**: Each service handles one business domain
2. **Loose Coupling**: Services communicate via well-defined APIs
3. **High Cohesion**: Related functionality grouped within services
4. **Independent Deployment**: Services can be deployed independently
5. **Technology Diversity**: Each service can use optimal technology stack
6. **Resilience**: Services handle failures gracefully

### **Service Communication Patterns**
- **Synchronous**: REST APIs for direct service-to-service calls
- **Asynchronous**: Event-driven communication via message queues
- **API Gateway**: Centralized routing and cross-cutting concerns
- **Service Discovery**: Dynamic service location and health checking

---

## 🧩 **Service Architecture**

### **1. User Management Service**

#### **Service Boundaries**
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
@Injectable()
export class UserManagementService implements IUserManagementService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly authService: AuthService,
    private readonly roleService: RoleService,
    private readonly eventBus: EventBus,
    private readonly logger: Logger
  ) {}

  async authenticateUser(credentials: IUserCredentials): Promise<IAuthResult> {
    try {
      // Validate credentials
      const user = await this.userRepository.findOne({
        where: { email: credentials.email },
        relations: ['roles', 'organization']
      });

      if (!user || !await this.authService.verifyPassword(credentials.password, user.passwordHash)) {
        throw new AuthenticationError('Invalid credentials');
      }

      // Check user status
      if (user.status !== UserStatus.ACTIVE) {
        throw new AuthenticationError('User account is not active');
      }

      // Generate tokens
      const accessToken = await this.authService.generateAccessToken(user);
      const refreshToken = await this.authService.generateRefreshToken(user);

      // Update login statistics
      await this.userRepository.update(user.id, {
        lastLoginAt: new Date(),
        loginCount: user.loginCount + 1
      });

      // Publish event
      await this.eventBus.publish(new UserAuthenticatedEvent(user.id, credentials.ipAddress));

      this.logger.log(`User ${user.id} authenticated successfully`);

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

  private sanitizeUserData(user: User): IPublicUser {
    const { passwordHash, mfaSecret, ...publicUser } = user;
    return publicUser;
  }
}
```

#### **Database Schema**
```typescript
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  passwordHash: string;

  @Enumerated(EnumType.STRING)
  @Column({ default: UserStatus.ACTIVE })
  status: UserStatus;

  @Column({ type: 'uuid' })
  organizationId: string;

  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @ManyToMany(() => Role)
  @JoinTable({
    name: 'user_roles',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' }
  })
  roles: Role[];

  @Column({ nullable: true })
  lastLoginAt: Date;

  @Column({ default: 0 })
  loginCount: number;

  @Column({ default: false })
  mfaEnabled: boolean;

  @Column({ nullable: true })
  mfaSecret: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
```

### **2. Quotation Service**

#### **Service Boundaries**
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

#### **Service Implementation**
```typescript
@Injectable()
export class QuotationService implements IQuotationService {
  constructor(
    @InjectRepository(Quote)
    private readonly quoteRepository: Repository<Quote>,
    private readonly pricingEngine: PricingEngine,
    private readonly workflowService: WorkflowService,
    private readonly pdfService: PDFService,
    private readonly eventBus: EventBus,
    private readonly logger: Logger
  ) {}

  async createQuote(quoteData: ICreateQuoteRequest): Promise<IQuote> {
    try {
      // Validate quote data
      await this.validateQuoteData(quoteData);

      // Generate quote number
      const quoteNumber = await this.generateQuoteNumber(quoteData.organizationId);

      // Create quote with initial status
      const quote = this.quoteRepository.create({
        ...quoteData,
        quoteNumber,
        status: QuoteStatus.DRAFT
      });

      // Save to repository
      const savedQuote = await this.quoteRepository.save(quote);

      // Publish event
      await this.eventBus.publish(new QuoteCreatedEvent(savedQuote.id, savedQuote.organizationId));

      this.logger.log(`Quote ${savedQuote.quoteNumber} created successfully`);

      return savedQuote;
    } catch (error) {
      this.logger.error('Failed to create quote', { error, quoteData });
      throw error;
    }
  }

  async calculateQuotePricing(quoteId: string): Promise<IQuotePricing> {
    try {
      // Get quote with line items
      const quote = await this.quoteRepository.findOne({
        where: { id: quoteId },
        relations: ['lineItems', 'customer', 'organization']
      });

      if (!quote) {
        throw new NotFoundError('Quote not found');
      }

      // Calculate pricing using pricing engine
      const pricing = await this.pricingEngine.calculatePricing(quote);

      // Update quote with calculated amounts
      await this.quoteRepository.update(quoteId, pricing);

      // Publish event
      await this.eventBus.publish(new QuotePricingCalculatedEvent(quoteId, pricing));

      return pricing;
    } catch (error) {
      this.logger.error('Failed to calculate quote pricing', { error, quoteId });
      throw error;
    }
  }

  private async validateQuoteData(quoteData: ICreateQuoteRequest): Promise<void> {
    // Validate required fields
    if (!quoteData.customerId || !quoteData.title || !quoteData.validFrom || !quoteData.validUntil) {
      throw new ValidationError('Missing required quote fields');
    }

    // Validate dates
    if (new Date(quoteData.validFrom) >= new Date(quoteData.validUntil)) {
      throw new ValidationError('Valid from date must be before valid until date');
    }

    // Validate line items
    if (!quoteData.lineItems || quoteData.lineItems.length === 0) {
      throw new ValidationError('At least one line item is required');
    }
  }

  private async generateQuoteNumber(organizationId: string): Promise<string> {
    const prefix = 'Q';
    const year = new Date().getFullYear();
    const sequence = await this.quoteRepository.count({
      where: { organizationId, createdAt: Between(new Date(year, 0, 1), new Date(year, 11, 31)) }
    });
    
    return `${prefix}${year}${(sequence + 1).toString().padStart(6, '0')}`;
  }
}
```

### **3. Project Management Service**

#### **Service Boundaries**
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

### **4. Time Management Service**

#### **Service Boundaries**
- Time entry creation and management
- Time approval workflows
- Time reporting and analytics
- Integration with projects and tasks
- Billable time calculation

#### **Service Interface**
```typescript
interface ITimeManagementService {
  // Time Entry Management
  createTimeEntry(timeData: ICreateTimeEntryRequest): Promise<ITimeEntry>;
  getTimeEntryById(id: string): Promise<ITimeEntry | null>;
  updateTimeEntry(id: string, updates: IUpdateTimeEntryRequest): Promise<ITimeEntry>;
  deleteTimeEntry(id: string): Promise<void>;
  
  // Time Approval
  submitForApproval(timeEntryId: string): Promise<void>;
  approveTimeEntry(timeEntryId: string, approverId: string): Promise<void>;
  rejectTimeEntry(timeEntryId: string, approverId: string, reason: string): Promise<void>;
  
  // Time Reporting
  getTimeEntries(filters: ITimeEntryFilters): Promise<ITimeEntry[]>;
  getTimeSummary(userId: string, dateRange: IDateRange): Promise<ITimeSummary>;
  generateTimeReport(organizationId: string, reportType: string): Promise<ITimeReport>;
  
  // Billable Time
  calculateBillableHours(projectId: string, dateRange: IDateRange): Promise<IBillableTime>;
  updateHourlyRates(projectId: string, rates: IHourlyRate[]): Promise<void>;
}
```

---

## 🔄 **Service Communication**

### **Event-Driven Architecture**

#### **Event Structure**
```typescript
abstract class BaseEvent {
  constructor(
    public readonly aggregateId: string,
    public readonly aggregateType: string,
    public readonly organizationId: string,
    public readonly userId?: string
  ) {}

  public readonly id = generateUUID();
  public readonly timestamp = new Date();
  public readonly version = 1;
}

export class QuoteCreatedEvent extends BaseEvent {
  constructor(
    public readonly quoteId: string,
    public readonly organizationId: string,
    public readonly userId?: string
  ) {
    super(quoteId, 'Quote', organizationId, userId);
  }
}

export class QuoteStatusChangedEvent extends BaseEvent {
  constructor(
    public readonly quoteId: string,
    public readonly oldStatus: string,
    public readonly newStatus: string,
    public readonly organizationId: string,
    public readonly userId?: string,
    public readonly reason?: string
  ) {
    super(quoteId, 'Quote', organizationId, userId);
  }
}

export class ProjectCreatedEvent extends BaseEvent {
  constructor(
    public readonly projectId: string,
    public readonly organizationId: string,
    public readonly userId?: string
  ) {
    super(projectId, 'Project', organizationId, userId);
  }
}

export class TimeEntryApprovedEvent extends BaseEvent {
  constructor(
    public readonly timeEntryId: string,
    public readonly projectId: string,
    public readonly organizationId: string,
    public readonly approverId: string
  ) {
    super(timeEntryId, 'TimeEntry', organizationId, approverId);
  }
}
```

#### **Event Handlers**
```typescript
@EventsHandler(QuoteCreatedEvent)
export class QuoteCreatedHandler implements IEventHandler<QuoteCreatedEvent> {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly auditService: AuditService,
    private readonly logger: Logger
  ) {}

  async handle(event: QuoteCreatedEvent): Promise<void> {
    try {
      // Log audit trail
      await this.auditService.logEvent(event);

      // Send notifications
      await this.notificationService.notifyQuoteCreated(event.quoteId);

      this.logger.log(`Quote ${event.quoteId} created event processed`);
    } catch (error) {
      this.logger.error('Failed to process quote created event', { error, event });
      throw error;
    }
  }
}

@EventsHandler(QuoteStatusChangedEvent)
export class QuoteStatusChangedHandler implements IEventHandler<QuoteStatusChangedEvent> {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly auditService: AuditService,
    private readonly projectService: ProjectManagementService,
    private readonly logger: Logger
  ) {}

  async handle(event: QuoteStatusChangedEvent): Promise<void> {
    try {
      // Log audit trail
      await this.auditService.logEvent(event);

      // Send notifications based on status change
      if (event.newStatus === 'approved') {
        await this.notificationService.notifyCustomerApproval(event.quoteId);
      } else if (event.newStatus === 'rejected') {
        await this.notificationService.notifyCustomerRejection(event.quoteId, event.reason);
      }

      // Update related systems
      if (event.newStatus === 'accepted') {
        await this.createProjectFromQuote(event.quoteId);
      }

      this.logger.log(`Quote ${event.quoteId} status change processed: ${event.oldStatus} -> ${event.newStatus}`);
    } catch (error) {
      this.logger.error('Failed to process quote status change event', { error, event });
      throw error;
    }
  }

  private async createProjectFromQuote(quoteId: string): Promise<void> {
    // Implementation for creating project from accepted quote
  }
}
```

### **Message Queue Integration**

#### **RabbitMQ Configuration**
```typescript
@Injectable()
export class MessageQueueService {
  private connection: Connection;
  private channel: Channel;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: Logger
  ) {}

  async onModuleInit(): Promise<void> {
    try {
      this.connection = await amqp.connect({
        hostname: this.configService.get('RABBITMQ_HOST'),
        port: this.configService.get('RABBITMQ_PORT'),
        username: this.configService.get('RABBITMQ_USERNAME'),
        password: this.configService.get('RABBITMQ_PASSWORD')
      });

      this.channel = await this.connection.createChannel();

      // Declare exchanges
      await this.channel.assertExchange('pivotalflow.events', 'topic', { durable: true });
      await this.channel.assertExchange('pivotalflow.commands', 'direct', { durable: true });

      // Declare queues
      await this.channel.assertQueue('quotes.events', { durable: true });
      await this.channel.assertQueue('projects.events', { durable: true });
      await this.channel.assertQueue('time.events', { durable: true });

      // Bind queues to exchanges
      await this.channel.bindQueue('quotes.events', 'pivotalflow.events', 'quote.*');
      await this.channel.bindQueue('projects.events', 'pivotalflow.events', 'project.*');
      await this.channel.bindQueue('time.events', 'pivotalflow.events', 'time.*');

      this.logger.log('Message queue service initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize message queue service', { error });
      throw error;
    }
  }

  async publishEvent(exchange: string, routingKey: string, event: any): Promise<void> {
    try {
      const message = Buffer.from(JSON.stringify(event));
      await this.channel.publish(exchange, routingKey, message, {
        persistent: true,
        contentType: 'application/json'
      });

      this.logger.log(`Event published: ${routingKey}`);
    } catch (error) {
      this.logger.error('Failed to publish event', { error, routingKey });
      throw error;
    }
  }

  async consumeEvents(queue: string, callback: (event: any) => Promise<void>): Promise<void> {
    try {
      await this.channel.consume(queue, async (msg) => {
        if (msg) {
          try {
            const event = JSON.parse(msg.content.toString());
            await callback(event);
            await this.channel.ack(msg);
          } catch (error) {
            this.logger.error('Failed to process event', { error, event: msg.content.toString() });
            await this.channel.nack(msg, false, false);
          }
        }
      });

      this.logger.log(`Started consuming events from queue: ${queue}`);
    } catch (error) {
      this.logger.error('Failed to start consuming events', { error, queue });
      throw error;
    }
  }
}
```

---

## 🔒 **Service Security**

### **Authentication & Authorization**

#### **JWT Token Validation**
```typescript
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserManagementService,
    private readonly reflector: Reflector
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass()
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Access token required');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token);
      const user = await this.userService.getUserById(payload.sub);

      if (!user || user.status !== UserStatus.ACTIVE) {
        throw new UnauthorizedException('Invalid user');
      }

      request.user = user;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid access token');
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
```

#### **Permission-Based Authorization**
```typescript
@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private readonly userService: UserManagementService,
    private readonly reflector: Reflector
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>('permissions', [
      context.getHandler(),
      context.getClass()
    ]);

    if (!requiredPermissions) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    for (const permission of requiredPermissions) {
      const hasPermission = await this.userService.checkPermission(
        user.id,
        permission.split(':')[0],
        permission.split(':')[1]
      );

      if (!hasPermission) {
        throw new ForbiddenException(`Permission denied: ${permission}`);
      }
    }

    return true;
  }
}

// Usage in controllers
@Controller('quotes')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class QuotesController {
  @Post()
  @Permissions('quotes:create')
  async createQuote(@Body() createQuoteDto: CreateQuoteDto): Promise<Quote> {
    // Implementation
  }

  @Get(':id')
  @Permissions('quotes:read')
  async getQuote(@Param('id') id: string): Promise<Quote> {
    // Implementation
  }
}
```

---

## 📊 **Service Monitoring**

### **Health Checks**

#### **Health Check Endpoints**
```typescript
@Controller('health')
export class HealthController {
  constructor(
    private readonly healthService: HealthService,
    private readonly databaseService: DatabaseService,
    private readonly redisService: RedisService
  ) {}

  @Get()
  async getHealth(): Promise<IHealthStatus> {
    const checks = await Promise.all([
      this.databaseService.checkHealth(),
      this.redisService.checkHealth()
    ]);

    const isHealthy = checks.every(check => check.status === 'healthy');

    return {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      checks: {
        database: checks[0],
        redis: checks[1]
      }
    };
  }

  @Get('ready')
  async getReadiness(): Promise<IReadinessStatus> {
    const checks = await Promise.all([
      this.databaseService.checkReadiness(),
      this.redisService.checkReadiness()
    ]);

    const isReady = checks.every(check => check.status === 'ready');

    return {
      status: isReady ? 'ready' : 'not_ready',
      timestamp: new Date().toISOString(),
      checks: {
        database: checks[0],
        redis: checks[1]
      }
    };
  }
}
```

### **Metrics Collection**

#### **Prometheus Metrics**
```typescript
@Injectable()
export class MetricsService {
  private readonly httpRequestDuration: Histogram;
  private readonly httpRequestsTotal: Counter;
  private readonly activeConnections: Gauge;

  constructor() {
    this.httpRequestDuration = new prometheus.Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'status_code', 'service']
    });

    this.httpRequestsTotal = new prometheus.Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code', 'service']
    });

    this.activeConnections = new prometheus.Gauge({
      name: 'active_connections',
      help: 'Number of active connections',
      labelNames: ['service']
    });
  }

  recordRequest(method: string, route: string, statusCode: number, duration: number): void {
    const labels = {
      method,
      route,
      status_code: statusCode.toString(),
      service: 'pivotalflow-api'
    };

    this.httpRequestDuration.observe(labels, duration);
    this.httpRequestsTotal.inc(labels);
  }

  setActiveConnections(count: number): void {
    this.activeConnections.set({ service: 'pivotalflow-api' }, count);
  }

  getMetrics(): string {
    return prometheus.register.metrics();
  }
}
```

---

## 🚀 **Service Deployment**

### **Docker Configuration**

#### **Service Dockerfile**
```dockerfile
# Multi-stage build for production
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM base AS production
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
USER node
EXPOSE 3002
CMD ["node", "dist/server.js"]
```

#### **Docker Compose for Development**
```yaml
version: '3.8'

services:
  user-service:
    build:
      context: ./services/user-management
      target: development
    environment:
      NODE_ENV: development
      DATABASE_URL: postgresql://pivotal:pivotal@postgres:5432/pivotalflow
      REDIS_URL: redis://redis:6379
      RABBITMQ_URL: amqp://rabbitmq:5672
    ports:
      - "3001:3001"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
      rabbitmq:
        condition: service_healthy

  quotation-service:
    build:
      context: ./services/quotation
      target: development
    environment:
      NODE_ENV: development
      DATABASE_URL: postgresql://pivotal:pivotal@postgres:5432/pivotalflow
      REDIS_URL: redis://redis:6379
      RABBITMQ_URL: amqp://rabbitmq:5672
    ports:
      - "3002:3002"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
      rabbitmq:
        condition: service_healthy

  project-service:
    build:
      context: ./services/project-management
      target: development
    environment:
      NODE_ENV: development
      DATABASE_URL: postgresql://pivotal:pivotal@postgres:5432/pivotalflow
      REDIS_URL: redis://redis:6379
      RABBITMQ_URL: amqp://rabbitmq:5672
    ports:
      - "3003:3003"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
      rabbitmq:
        condition: service_healthy

  time-service:
    build:
      context: ./services/time-management
      target: development
    environment:
      NODE_ENV: development
      DATABASE_URL: postgresql://pivotal:pivotal@postgres:5432/pivotalflow
      REDIS_URL: redis://redis:6379
      RABBITMQ_URL: amqp://rabbitmq:5672
    ports:
      - "3004:3004"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
      rabbitmq:
        condition: service_healthy

  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: pivotalflow
      POSTGRES_USER: pivotal
      POSTGRES_PASSWORD: pivotal
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U pivotal"]
      interval: 30s
      timeout: 10s
      retries: 3

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 30s
      timeout: 10s
      retries: 3

  rabbitmq:
    image: rabbitmq:3-management-alpine
    environment:
      RABBITMQ_DEFAULT_USER: pivotal
      RABBITMQ_DEFAULT_PASS: pivotal
    ports:
      - "5672:5672"
      - "15672:15672"
    volumes:
      - rabbitmq_data:/var/lib/rabbitmq
    healthcheck:
      test: ["CMD", "rabbitmq-diagnostics", "ping"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  postgres_data:
  redis_data:
  rabbitmq_data:
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
**Microservices Version**: 1.0.0
