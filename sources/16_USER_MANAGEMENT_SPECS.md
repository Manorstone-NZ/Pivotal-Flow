# Pivotal Flow - User Management System Specifications

## 👥 **User Management Overview**

### **System Purpose**
The User Management System provides comprehensive user authentication, authorization, and profile management capabilities for the Pivotal Flow platform. It ensures secure access control while maintaining user experience and compliance requirements.

### **Key Features**
- Multi-factor authentication (MFA)
- Role-based access control (RBAC)
- Organization-based user isolation
- Session management and security
- User profile and preferences
- Audit logging and compliance

---

## 🔐 **Authentication System**

### **Authentication Methods**

#### **1. Email/Password Authentication**
```typescript
interface IEmailPasswordAuth {
  email: string;
  password: string;
  remember_me?: boolean;
  mfa_code?: string;
}

interface IAuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: 'Bearer';
  expires_in: number;
  user: IPublicUser;
  mfa_required: boolean;
  mfa_setup_url?: string;
}
```

#### **2. Multi-Factor Authentication (MFA)**
```typescript
interface IMFAMethods {
  totp: boolean;      // Time-based One-Time Password
  sms: boolean;       // SMS-based verification
  email: boolean;     // Email-based verification
  backup_codes: boolean; // Backup recovery codes
}

interface IMFASetup {
  qr_code_url: string;
  secret_key: string;
  backup_codes: string[];
  setup_complete: boolean;
}
```

#### **3. Social Authentication (Future)**
```typescript
interface ISocialAuth {
  provider: 'google' | 'microsoft' | 'github' | 'linkedin';
  access_token: string;
  refresh_token?: string;
}
```

### **Password Security Requirements**

#### **Password Policy**
```typescript
interface IPasswordPolicy {
  min_length: number;           // Minimum 8 characters
  require_uppercase: boolean;   // At least one uppercase letter
  require_lowercase: boolean;   // At least one lowercase letter
  require_numbers: boolean;     // At least one number
  require_special: boolean;     // At least one special character
  max_age_days: number;         // Password expires after 90 days
  prevent_reuse: number;        // Prevent reuse of last 5 passwords
  lockout_attempts: number;     // Lock account after 5 failed attempts
  lockout_duration: number;     // Lock for 30 minutes
}
```

#### **Password Validation**
```typescript
const validatePassword = (password: string): IPasswordValidationResult => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[@$!%*?&]/.test(password)) {
    errors.push('Password must contain at least one special character (@$!%*?&)');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};
```

---

## 🛡️ **Authorization & Access Control**

### **Role-Based Access Control (RBAC)**

#### **Role Structure**
```typescript
interface IRole {
  id: string;
  name: string;
  description: string;
  permissions: IPermission[];
  is_system: boolean;
  is_active: boolean;
  organization_id: string;
  created_at: Date;
  updated_at: Date;
}

interface IPermission {
  id: string;
  name: string;
  resource: string;
  action: string;
  conditions?: IPermissionCondition[];
  description: string;
}

interface IPermissionCondition {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'not_in';
  value: any;
}
```

#### **Predefined Roles**
```typescript
const SYSTEM_ROLES = {
  SUPER_ADMIN: {
    name: 'Super Administrator',
    description: 'Full system access across all organizations',
    permissions: ['*:*']
  },
  ORGANIZATION_ADMIN: {
    name: 'Organization Administrator',
    description: 'Full access within organization',
    permissions: [
      'users:*',
      'customers:*',
      'quotes:*',
      'projects:*',
      'invoices:*',
      'reports:*'
    ]
  },
  PROJECT_MANAGER: {
    name: 'Project Manager',
    description: 'Manage projects and team members',
    permissions: [
      'projects:read',
      'projects:write',
      'projects:delete',
      'tasks:*',
      'time_entries:read',
      'time_entries:approve',
      'reports:read'
    ]
  },
  TEAM_MEMBER: {
    name: 'Team Member',
    description: 'Basic user with project access',
    permissions: [
      'projects:read',
      'tasks:read',
      'tasks:write',
      'time_entries:*',
      'profile:*'
    ]
  },
  VIEWER: {
    name: 'Viewer',
    description: 'Read-only access to assigned projects',
    permissions: [
      'projects:read',
      'tasks:read',
      'time_entries:read',
      'profile:read'
    ]
  }
};
```

### **Permission System**

#### **Permission Categories**
```typescript
enum PermissionCategory {
  USERS = 'users',
  CUSTOMERS = 'customers',
  QUOTES = 'quotes',
  PROJECTS = 'projects',
  TASKS = 'tasks',
  TIME_ENTRIES = 'time_entries',
  INVOICES = 'invoices',
  REPORTS = 'reports',
  SETTINGS = 'settings',
  PROFILE = 'profile'
}

enum PermissionAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  APPROVE = 'approve',
  REJECT = 'reject',
  EXPORT = 'export',
  IMPORT = 'import'
}
```

#### **Permission Checking**
```typescript
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

  private evaluateConditions(
    conditions: IPermissionCondition[],
    context: Record<string, any>
  ): boolean {
    return conditions.every(condition => {
      const value = context[condition.field];
      
      switch (condition.operator) {
        case 'eq': return value === condition.value;
        case 'ne': return value !== condition.value;
        case 'gt': return value > condition.value;
        case 'lt': return value < condition.value;
        case 'gte': return value >= condition.value;
        case 'lte': return value <= condition.value;
        case 'in': return Array.isArray(condition.value) && condition.value.includes(value);
        case 'not_in': return Array.isArray(condition.value) && !condition.value.includes(value);
        default: return false;
      }
    });
  }
}
```

---

## 🏢 **Organization & Multi-Tenancy**

### **Organization Structure**
```typescript
interface IOrganization {
  id: string;
  name: string;
  slug: string;
  domain?: string;
  industry?: string;
  size?: string;
  timezone: string;
  currency: string;
  tax_id?: string;
  address?: IAddress;
  contact_info?: IContactInfo;
  settings: IOrganizationSettings;
  subscription_plan: string;
  subscription_status: string;
  trial_ends_at?: Date;
  created_at: Date;
  updated_at: Date;
}

interface IOrganizationSettings {
  security: {
    password_policy: IPasswordPolicy;
    mfa_required: boolean;
    session_timeout_minutes: number;
    max_login_attempts: number;
  };
  notifications: {
    email_notifications: boolean;
    sms_notifications: boolean;
    push_notifications: boolean;
  };
  features: {
    advanced_reporting: boolean;
    api_access: boolean;
    custom_branding: boolean;
    white_label: boolean;
  };
}
```

### **User Organization Assignment**
```typescript
interface IUserOrganization {
  user_id: string;
  organization_id: string;
  role_id: string;
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  joined_at: Date;
  assigned_by?: string;
  expires_at?: Date;
}

interface IUserOrganizationService {
  addUserToOrganization(
    userId: string,
    organizationId: string,
    roleId: string,
    assignedBy?: string
  ): Promise<void>;
  
  removeUserFromOrganization(
    userId: string,
    organizationId: string
  ): Promise<void>;
  
  updateUserRole(
    userId: string,
    organizationId: string,
    roleId: string
  ): Promise<void>;
  
  getUserOrganizations(userId: string): Promise<IUserOrganization[]>;
}
```

---

## 👤 **User Profile Management**

### **User Profile Structure**
```typescript
interface IUserProfile {
  id: string;
  email: string;
  username?: string;
  first_name: string;
  last_name: string;
  display_name?: string;
  avatar_url?: string;
  phone?: string;
  timezone: string;
  locale: string;
  status: UserStatus;
  email_verified: boolean;
  email_verified_at?: Date;
  last_login_at?: Date;
  login_count: number;
  failed_login_attempts: number;
  locked_until?: Date;
  mfa_enabled: boolean;
  preferences: IUserPreferences;
  metadata: Record<string, any>;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

interface IUserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  date_format: string;
  time_format: '12h' | '24h';
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
    browser: boolean;
  };
  dashboard: {
    default_view: string;
    widgets: string[];
    layout: Record<string, any>;
  };
}
```

### **Profile Update Operations**
```typescript
interface IProfileUpdateService {
  updateBasicInfo(
    userId: string,
    updates: {
      first_name?: string;
      last_name?: string;
      display_name?: string;
      phone?: string;
      timezone?: string;
      locale?: string;
    }
  ): Promise<IUserProfile>;
  
  updateAvatar(
    userId: string,
    avatarFile: Express.Multer.File
  ): Promise<string>;
  
  updatePreferences(
    userId: string,
    preferences: Partial<IUserPreferences>
  ): Promise<IUserPreferences>;
  
  changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void>;
  
  updateEmail(
    userId: string,
    newEmail: string,
    currentPassword: string
  ): Promise<void>;
}
```

---

## 🔒 **Security Features**

### **Session Management**
```typescript
interface ISession {
  id: string;
  user_id: string;
  organization_id: string;
  access_token: string;
  refresh_token: string;
  ip_address: string;
  user_agent: string;
  created_at: Date;
  expires_at: Date;
  last_used_at: Date;
  is_active: boolean;
}

interface ISessionService {
  createSession(
    userId: string,
    organizationId: string,
    ipAddress: string,
    userAgent: string
  ): Promise<ISession>;
  
  validateSession(sessionId: string): Promise<ISession | null>;
  
  refreshSession(refreshToken: string): Promise<ISession>;
  
  revokeSession(sessionId: string): Promise<void>;
  
  revokeAllUserSessions(userId: string): Promise<void>;
  
  getActiveSessions(userId: string): Promise<ISession[]>;
}
```

### **Security Monitoring**
```typescript
interface ISecurityEvent {
  id: string;
  user_id?: string;
  organization_id: string;
  event_type: SecurityEventType;
  ip_address: string;
  user_agent: string;
  details: Record<string, any>;
  risk_score: number;
  created_at: Date;
}

enum SecurityEventType {
  LOGIN_SUCCESS = 'login_success',
  LOGIN_FAILURE = 'login_failure',
  LOGOUT = 'logout',
  PASSWORD_CHANGE = 'password_change',
  MFA_ENABLED = 'mfa_enabled',
  MFA_DISABLED = 'mfa_disabled',
  ROLE_CHANGE = 'role_change',
  PERMISSION_GRANTED = 'permission_granted',
  PERMISSION_REVOKED = 'permission_revoked',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  ACCOUNT_LOCKED = 'account_locked',
  ACCOUNT_UNLOCKED = 'account_unlocked'
}

interface ISecurityMonitoringService {
  logSecurityEvent(event: Omit<ISecurityEvent, 'id' | 'created_at'>): Promise<void>;
  
  detectSuspiciousActivity(userId: string): Promise<boolean>;
  
  calculateRiskScore(userId: string): Promise<number>;
  
  getSecurityEvents(
    filters: ISecurityEventFilters
  ): Promise<ISecurityEvent[]>;
  
  generateSecurityReport(
    organizationId: string,
    dateRange: IDateRange
  ): Promise<ISecurityReport>;
}
```

---

## 📊 **User Analytics & Reporting**

### **User Activity Tracking**
```typescript
interface IUserActivity {
  id: string;
  user_id: string;
  organization_id: string;
  activity_type: UserActivityType;
  resource_type?: string;
  resource_id?: string;
  details: Record<string, any>;
  ip_address: string;
  user_agent: string;
  created_at: Date;
}

enum UserActivityType {
  LOGIN = 'login',
  LOGOUT = 'logout',
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  EXPORT = 'export',
  IMPORT = 'import',
  DOWNLOAD = 'download',
  UPLOAD = 'upload',
  SEARCH = 'search',
  REPORT_GENERATED = 'report_generated'
}

interface IUserAnalyticsService {
  trackUserActivity(activity: Omit<IUserActivity, 'id' | 'created_at'>): Promise<void>;
  
  getUserActivitySummary(
    userId: string,
    dateRange: IDateRange
  ): Promise<IUserActivitySummary>;
  
  getOrganizationActivitySummary(
    organizationId: string,
    dateRange: IDateRange
  ): Promise<IOrganizationActivitySummary>;
  
  generateUserReport(
    userId: string,
    reportType: string,
    dateRange: IDateRange
  ): Promise<IUserReport>;
}
```

### **User Performance Metrics**
```typescript
interface IUserPerformanceMetrics {
  user_id: string;
  organization_id: string;
  period: string;
  metrics: {
    login_frequency: number;
    session_duration_avg: number;
    features_used: string[];
    productivity_score: number;
    error_rate: number;
    support_tickets: number;
  };
  trends: {
    login_frequency_trend: 'increasing' | 'decreasing' | 'stable';
    productivity_trend: 'improving' | 'declining' | 'stable';
    error_rate_trend: 'improving' | 'declining' | 'stable';
  };
  recommendations: string[];
}
```

---

## 🚀 **API Endpoints**

### **Authentication Endpoints**
```typescript
// POST /api/v1/auth/login
interface ILoginEndpoint {
  request: {
    email: string;
    password: string;
    mfa_code?: string;
    remember_me?: boolean;
  };
  response: {
    access_token: string;
    refresh_token: string;
    token_type: 'Bearer';
    expires_in: number;
    user: IPublicUser;
    mfa_required: boolean;
    mfa_setup_url?: string;
  };
}

// POST /api/v1/auth/refresh
interface IRefreshEndpoint {
  request: {
    refresh_token: string;
  };
  response: {
    access_token: string;
    token_type: 'Bearer';
    expires_in: number;
  };
}

// POST /api/v1/auth/logout
interface ILogoutEndpoint {
  request: {
    refresh_token: string;
  };
  response: {
    message: string;
    success: boolean;
  };
}
```

### **User Management Endpoints**
```typescript
// GET /api/v1/users
interface IGetUsersEndpoint {
  query: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    status?: string;
    organization_id?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  };
  response: {
    data: IPublicUser[];
    pagination: IPagination;
    meta: {
      total_count: number;
      filtered_count: number;
      organization_id: string;
    };
  };
}

// POST /api/v1/users
interface ICreateUserEndpoint {
  request: {
    email: string;
    first_name: string;
    last_name: string;
    password: string;
    role_id: string;
    organization_id: string;
    phone_number?: string;
    timezone?: string;
    locale?: string;
  };
  response: {
    user: IPublicUser;
    temporary_password?: string;
    message: string;
  };
}

// GET /api/v1/users/{id}
interface IGetUserEndpoint {
  params: {
    id: string;
  };
  response: {
    user: IPublicUser;
    roles: IRole[];
    permissions: IPermission[];
    last_login?: string;
    login_count: number;
    mfa_enabled: boolean;
  };
}
```

---

## 🧪 **Testing Requirements**

### **Unit Testing**
```typescript
describe('UserManagementService', () => {
  let service: UserManagementService;
  let mockUserRepository: jest.Mocked<IUserRepository>;
  let mockAuthService: jest.Mocked<IAuthService>;

  beforeEach(() => {
    mockUserRepository = createMockUserRepository();
    mockAuthService = createMockAuthService();
    service = new UserManagementService(
      mockUserRepository,
      mockAuthService,
      mockRoleService,
      mockEventBus,
      mockLogger
    );
  });

  describe('authenticateUser', () => {
    it('should authenticate user with valid credentials', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'validPassword123'
      };

      const mockUser = createMockUser();
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockAuthService.verifyPassword.mockResolvedValue(true);

      const result = await service.authenticateUser(credentials);

      expect(result.access_token).toBeDefined();
      expect(result.user.email).toBe(credentials.email);
      expect(mockUserRepository.updateLoginStats).toHaveBeenCalledWith(mockUser.id);
    });

    it('should throw error for invalid credentials', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'invalidPassword'
      };

      mockUserRepository.findByEmail.mockResolvedValue(null);

      await expect(service.authenticateUser(credentials))
        .rejects
        .toThrow('Invalid credentials');
    });
  });
});
```

### **Integration Testing**
```typescript
describe('User Management Integration', () => {
  let app: INestApplication;
  let userService: UserManagementService;
  let testUser: IUser;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    userService = moduleRef.get<UserManagementService>(UserManagementService);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should create and authenticate user', async () => {
    // Create user
    const userData = {
      email: 'integration@test.com',
      password: 'TestPass123!',
      first_name: 'Integration',
      last_name: 'Test',
      organization_id: 'test-org'
    };

    const user = await userService.createUser(userData);
    expect(user.email).toBe(userData.email);

    // Authenticate user
    const authResult = await userService.authenticateUser({
      email: userData.email,
      password: userData.password
    });

    expect(authResult.user.id).toBe(user.id);
    expect(authResult.access_token).toBeDefined();
  });
});
```

---

## 📋 **Implementation Checklist**

### **Phase 1: Core Authentication**
- [ ] User registration and login endpoints
- [ ] JWT token generation and validation
- [ ] Password hashing and validation
- [ ] Basic user profile management
- [ ] Session management

### **Phase 2: Authorization & Security**
- [ ] Role-based access control (RBAC)
- [ ] Permission system implementation
- [ ] Multi-factor authentication (MFA)
- [ ] Security monitoring and logging
- [ ] Account lockout mechanisms

### **Phase 3: Advanced Features**
- [ ] Organization management
- [ ] User analytics and reporting
- [ ] Advanced security features
- [ ] API rate limiting
- [ ] Audit trail implementation

### **Phase 4: Testing & Documentation**
- [ ] Unit test coverage (90%+)
- [ ] Integration test coverage (80%+)
- [ ] API documentation (OpenAPI)
- [ ] User documentation
- [ ] Security testing and validation

---

**Document Version**: 1.0  
**Last Updated**: January 2025  
**Next Review**: February 2025  
**User Management Version**: 1.0.0
