# Pivotal Flow - Complete API Design & Specifications

## 🌐 **API Design Overview**

### **API Design Principles**
1. **RESTful Design**: Follow REST principles with consistent resource naming
2. **Versioning Strategy**: Semantic versioning with backward compatibility
3. **Authentication & Authorization**: JWT-based authentication with RBAC
4. **Rate Limiting**: Comprehensive rate limiting for API protection
5. **Documentation**: OpenAPI 3.0 specifications for all endpoints
6. **Error Handling**: Consistent error responses with proper HTTP status codes
7. **Validation**: Request/response validation using Zod schemas
8. **Pagination**: Standardized pagination for list endpoints

### **API Architecture**
- **Base URL**: `https://api.pivotalflow.com/api/v1`
- **Authentication**: Bearer token in Authorization header
- **Content-Type**: `application/json` for all requests/responses
- **Response Format**: Consistent JSON structure with metadata
- **Error Format**: Standardized error response structure

---

## 🔐 **Authentication & Authorization**

### **JWT Token Structure**

#### **Access Token Payload**
```typescript
interface IJWTPayload {
  sub: string;           // User ID
  org: string;           // Organization ID
  aud: string;           // Audience (service name)
  iss: string;           // Issuer (auth service)
  iat: number;           // Issued at timestamp
  exp: number;           // Expiration timestamp
  nbf: number;           // Not before timestamp
  jti: string;           // JWT ID (unique identifier)
  roles: string[];       // User roles
  permissions: string[]; // User permissions
  mfa: boolean;          // MFA verification status
  scope: string[];       // Token scope
}

interface IAccessToken {
  access_token: string;
  token_type: 'Bearer';
  expires_in: number;
  scope: string[];
}
```

#### **Refresh Token Structure**
```typescript
interface IRefreshToken {
  refresh_token: string;
  token_type: 'Bearer';
  expires_in: number;
  scope: string[];
}

interface ITokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: 'Bearer';
  expires_in: number;
  scope: string[];
  user: IPublicUser;
}
```

### **Authentication Endpoints**

#### **POST /auth/login**
```typescript
// Request
interface ILoginRequest {
  email: string;
  password: string;
  mfa_code?: string;
  remember_me?: boolean;
}

// Response
interface ILoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: 'Bearer';
  expires_in: number;
  user: IPublicUser;
  mfa_required: boolean;
  mfa_setup_url?: string;
}

// Example Request
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123",
  "mfa_code": "123456",
  "remember_me": true
}

// Example Response
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "admin",
    "organization_id": "org_456"
  },
  "mfa_required": false
}
```

#### **POST /auth/refresh**
```typescript
// Request
interface IRefreshRequest {
  refresh_token: string;
}

// Response
interface IRefreshResponse {
  access_token: string;
  token_type: 'Bearer';
  expires_in: number;
}

// Example Request
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

// Example Response
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

#### **POST /auth/logout**
```typescript
// Request
interface ILogoutRequest {
  refresh_token: string;
}

// Response
interface ILogoutResponse {
  message: string;
  success: boolean;
}

// Example Request
POST /api/v1/auth/logout
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

// Example Response
{
  "message": "Successfully logged out",
  "success": true
}
```

#### **POST /auth/mfa/setup**
```typescript
// Request
interface IMFASetupRequest {
  method: 'totp' | 'sms' | 'email';
  phone_number?: string;
  email?: string;
}

// Response
interface IMFASetupResponse {
  qr_code_url: string;
  secret_key: string;
  backup_codes: string[];
  setup_complete: boolean;
}

// Example Request
POST /api/v1/auth/mfa/setup
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "method": "totp"
}

// Example Response
{
  "qr_code_url": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "secret_key": "JBSWY3DPEHPK3PXP",
  "backup_codes": ["12345678", "87654321", "11223344"],
  "setup_complete": false
}
```

---

## 👥 **User Management API**

### **User Endpoints**

#### **GET /users**
```typescript
// Query Parameters
interface IUsersQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: 'active' | 'inactive' | 'suspended';
  organization_id?: string;
  sort_by?: 'created_at' | 'email' | 'first_name' | 'last_name';
  sort_order?: 'asc' | 'desc';
}

// Response
interface IUsersResponse {
  data: IPublicUser[];
  pagination: IPagination;
  meta: {
    total_count: number;
    filtered_count: number;
    organization_id: string;
  };
}

// Example Request
GET /api/v1/users?page=1&limit=20&search=john&role=admin&status=active
Authorization: Bearer <access_token>

// Example Response
{
  "data": [
    {
      "id": "user_123",
      "email": "john.doe@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "role": "admin",
      "status": "active",
      "organization_id": "org_456",
      "created_at": "2025-01-15T10:30:00Z",
      "updated_at": "2025-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total_pages": 5,
    "total_count": 100,
    "has_next": true,
    "has_prev": false
  },
  "meta": {
    "total_count": 100,
    "filtered_count": 20,
    "organization_id": "org_456"
  }
}
```

#### **POST /users**
```typescript
// Request
interface ICreateUserRequest {
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  role_id: string;
  organization_id: string;
  phone_number?: string;
  timezone?: string;
  locale?: string;
}

// Response
interface ICreateUserResponse {
  user: IPublicUser;
  temporary_password?: string;
  message: string;
}

// Example Request
POST /api/v1/users
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "email": "jane.smith@example.com",
  "first_name": "Jane",
  "last_name": "Smith",
  "password": "SecurePass123!",
  "role_id": "role_789",
  "organization_id": "org_456",
  "phone_number": "+1234567890",
  "timezone": "America/New_York",
  "locale": "en-US"
}

// Example Response
{
  "user": {
    "id": "user_789",
    "email": "jane.smith@example.com",
    "first_name": "Jane",
    "last_name": "Smith",
    "role": "manager",
    "status": "active",
    "organization_id": "org_456",
    "created_at": "2025-01-15T11:00:00Z",
    "updated_at": "2025-01-15T11:00:00Z"
  },
  "message": "User created successfully"
}
```

#### **GET /users/{id}**
```typescript
// Response
interface IUserResponse {
  user: IPublicUser;
  roles: IRole[];
  permissions: IPermission[];
  last_login?: string;
  login_count: number;
  mfa_enabled: boolean;
}

// Example Request
GET /api/v1/users/user_123
Authorization: Bearer <access_token>

// Example Response
{
  "user": {
    "id": "user_123",
    "email": "john.doe@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "admin",
    "status": "active",
    "organization_id": "org_456",
    "created_at": "2025-01-15T10:30:00Z",
    "updated_at": "2025-01-15T10:30:00Z"
  },
  "roles": [
    {
      "id": "role_123",
      "name": "Administrator",
      "description": "Full system access",
      "permissions": ["users:read", "users:write", "users:delete"]
    }
  ],
  "permissions": [
    {
      "id": "perm_123",
      "name": "users:read",
      "resource": "users",
      "action": "read"
    }
  ],
  "last_login": "2025-01-15T09:00:00Z",
  "login_count": 45,
  "mfa_enabled": true
}
```

#### **PUT /users/{id}**
```typescript
// Request
interface IUpdateUserRequest {
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  timezone?: string;
  locale?: string;
  status?: 'active' | 'inactive' | 'suspended';
}

// Response
interface IUpdateUserResponse {
  user: IPublicUser;
  message: string;
}

// Example Request
PUT /api/v1/users/user_123
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "first_name": "Jonathan",
  "phone_number": "+1987654321",
  "timezone": "America/Los_Angeles"
}

// Example Response
{
  "user": {
    "id": "user_123",
    "email": "john.doe@example.com",
    "first_name": "Jonathan",
    "last_name": "Doe",
    "role": "admin",
    "status": "active",
    "organization_id": "org_456",
    "created_at": "2025-01-15T10:30:00Z",
    "updated_at": "2025-01-15T12:00:00Z"
  },
  "message": "User updated successfully"
}
```

---

## 💰 **Quotation API**

### **Quote Endpoints**

#### **GET /quotes**
```typescript
// Query Parameters
interface IQuotesQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired';
  customer_id?: string;
  project_id?: string;
  created_by?: string;
  valid_from?: string;
  valid_until?: string;
  sort_by?: 'created_at' | 'total_amount' | 'valid_until';
  sort_order?: 'asc' | 'desc';
}

// Response
interface IQuotesResponse {
  data: IQuote[];
  pagination: IPagination;
  meta: {
    total_count: number;
    total_amount: number;
    currency: string;
    organization_id: string;
  };
}

// Example Request
GET /api/v1/quotes?page=1&limit=20&status=sent&sort_by=created_at&sort_order=desc
Authorization: Bearer <access_token>

// Example Response
{
  "data": [
    {
      "id": "quote_123",
      "quote_number": "Q2025001",
      "title": "Website Development Project",
      "customer": {
        "id": "customer_456",
        "company_name": "Acme Corp",
        "contact_name": "John Smith"
      },
      "status": "sent",
      "total_amount": 15000.00,
      "currency": "USD",
      "valid_from": "2025-01-15",
      "valid_until": "2025-02-15",
      "created_at": "2025-01-15T10:00:00Z",
      "updated_at": "2025-01-15T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total_pages": 3,
    "total_count": 45,
    "has_next": true,
    "has_prev": false
  },
  "meta": {
    "total_count": 45,
    "total_amount": 675000.00,
    "currency": "USD",
    "organization_id": "org_456"
  }
}
```

#### **POST /quotes**
```typescript
// Request
interface ICreateQuoteRequest {
  title: string;
  description?: string;
  customer_id: string;
  project_id?: string;
  valid_from: string;
  valid_until: string;
  currency: string;
  line_items: IQuoteLineItemRequest[];
  terms_conditions?: string;
  notes?: string;
  internal_notes?: string;
}

interface IQuoteLineItemRequest {
  description: string;
  quantity: number;
  unit_price: number;
  service_category_id?: string;
  rate_card_id?: string;
}

// Response
interface ICreateQuoteResponse {
  quote: IQuote;
  message: string;
}

// Example Request
POST /api/v1/quotes
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "title": "Mobile App Development",
  "description": "Custom mobile application for iOS and Android",
  "customer_id": "customer_456",
  "valid_from": "2025-01-15",
  "valid_until": "2025-03-15",
  "currency": "USD",
  "line_items": [
    {
      "description": "UI/UX Design",
      "quantity": 40,
      "unit_price": 150.00,
      "service_category_id": "service_123"
    },
    {
      "description": "Frontend Development",
      "quantity": 80,
      "unit_price": 125.00,
      "service_category_id": "service_124"
    },
    {
      "description": "Backend Development",
      "quantity": 120,
      "unit_price": 100.00,
      "service_category_id": "service_125"
    }
  ],
  "terms_conditions": "Payment terms: 50% upfront, 50% upon completion",
  "notes": "Client requested additional features for user management"
}

// Example Response
{
  "quote": {
    "id": "quote_789",
    "quote_number": "Q2025002",
    "title": "Mobile App Development",
    "status": "draft",
    "total_amount": 25000.00,
    "currency": "USD",
    "valid_from": "2025-01-15",
    "valid_until": "2025-03-15",
    "created_at": "2025-01-15T12:00:00Z",
    "updated_at": "2025-01-15T12:00:00Z"
  },
  "message": "Quote created successfully"
}
```

#### **GET /quotes/{id}**
```typescript
// Response
interface IQuoteDetailResponse {
  quote: IQuoteDetail;
  line_items: IQuoteLineItem[];
  customer: ICustomer;
  project?: IProject;
  created_by: IPublicUser;
  approved_by?: IPublicUser;
  history: IQuoteHistory[];
}

// Example Request
GET /api/v1/quotes/quote_123
Authorization: Bearer <access_token>

// Example Response
{
  "quote": {
    "id": "quote_123",
    "quote_number": "Q2025001",
    "title": "Website Development Project",
    "description": "Corporate website redesign and development",
    "status": "sent",
    "type": "project",
    "valid_from": "2025-01-15",
    "valid_until": "2025-02-15",
    "currency": "USD",
    "exchange_rate": 1.000000,
    "subtotal": 14000.00,
    "tax_rate": 0.0850,
    "tax_amount": 1190.00,
    "discount_type": "percentage",
    "discount_value": 0.0500,
    "discount_amount": 700.00,
    "total_amount": 14480.00,
    "terms_conditions": "Net 30 payment terms",
    "notes": "Client requested additional SEO optimization",
    "internal_notes": "High priority client - follow up required",
    "created_at": "2025-01-15T10:00:00Z",
    "updated_at": "2025-01-15T10:00:00Z",
    "sent_at": "2025-01-15T11:00:00Z"
  },
  "line_items": [
    {
      "id": "line_123",
      "line_number": 1,
      "description": "Website Design",
      "quantity": 40,
      "unit_price": 200.00,
      "subtotal": 8000.00,
      "total_amount": 8000.00
    },
    {
      "id": "line_124",
      "line_number": 2,
      "description": "Website Development",
      "quantity": 60,
      "unit_price": 100.00,
      "subtotal": 6000.00,
      "total_amount": 6000.00
    }
  ],
  "customer": {
    "id": "customer_456",
    "company_name": "Acme Corp",
    "contact_name": "John Smith",
    "email": "john@acmecorp.com"
  },
  "created_by": {
    "id": "user_123",
    "first_name": "John",
    "last_name": "Doe"
  },
  "history": [
    {
      "action": "created",
      "timestamp": "2025-01-15T10:00:00Z",
      "user": "John Doe"
    },
    {
      "action": "sent",
      "timestamp": "2025-01-15T11:00:00Z",
      "user": "John Doe"
    }
  ]
}
```

---

## 🚀 **Project Management API**

### **Project Endpoints**

#### **GET /projects**
```typescript
// Query Parameters
interface IProjectsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled';
  customer_id?: string;
  project_manager_id?: string;
  start_date?: string;
  end_date?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  sort_by?: 'created_at' | 'start_date' | 'end_date' | 'priority';
  sort_order?: 'asc' | 'desc';
}

// Response
interface IProjectsResponse {
  data: IProject[];
  pagination: IPagination;
  meta: {
    total_count: number;
    active_count: number;
    completed_count: number;
    total_hours: number;
    organization_id: string;
  };
}

// Example Request
GET /api/v1/projects?page=1&limit=20&status=active&sort_by=start_date&sort_order=asc
Authorization: Bearer <access_token>

// Example Response
{
  "data": [
    {
      "id": "project_123",
      "project_number": "P2025001",
      "name": "E-commerce Platform Development",
      "customer": {
        "id": "customer_456",
        "company_name": "Retail Solutions Inc"
      },
      "status": "active",
      "priority": "high",
      "start_date": "2025-01-01",
      "end_date": "2025-06-30",
      "estimated_hours": 800,
      "actual_hours": 320,
      "progress_percentage": 40,
      "project_manager": {
        "id": "user_123",
        "first_name": "John",
        "last_name": "Doe"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total_pages": 4,
    "total_count": 75,
    "has_next": true,
    "has_prev": false
  },
  "meta": {
    "total_count": 75,
    "active_count": 25,
    "completed_count": 40,
    "total_hours": 15000,
    "organization_id": "org_456"
  }
}
```

#### **POST /projects**
```typescript
// Request
interface ICreateProjectRequest {
  name: string;
  description?: string;
  customer_id: string;
  quote_id?: string;
  start_date: string;
  end_date: string;
  estimated_hours: number;
  budget: number;
  currency: string;
  project_manager_id: string;
  tags?: string[];
}

// Response
interface ICreateProjectResponse {
  project: IProject;
  message: string;
}

// Example Request
POST /api/v1/projects
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "Mobile App Redesign",
  "description": "Complete redesign of existing mobile application",
  "customer_id": "customer_456",
  "quote_id": "quote_789",
  "start_date": "2025-02-01",
  "end_date": "2025-05-31",
  "estimated_hours": 600,
  "budget": 45000.00,
  "currency": "USD",
  "project_manager_id": "user_123",
  "tags": ["mobile", "redesign", "ui/ux"]
}

// Example Response
{
  "project": {
    "id": "project_789",
    "project_number": "P2025002",
    "name": "Mobile App Redesign",
    "status": "planning",
    "priority": "medium",
    "start_date": "2025-02-01",
    "end_date": "2025-05-31",
    "estimated_hours": 600,
    "budget": 45000.00,
    "currency": "USD",
    "created_at": "2025-01-15T14:00:00Z",
    "updated_at": "2025-01-15T14:00:00Z"
  },
  "message": "Project created successfully"
}
```

---

## ⏰ **Time Management API**

### **Time Entry Endpoints**

#### **GET /time-entries**
```typescript
// Query Parameters
interface ITimeEntriesQueryParams {
  page?: number;
  limit?: number;
  user_id?: string;
  project_id?: string;
  task_id?: string;
  date_from?: string;
  date_to?: string;
  status?: 'pending' | 'approved' | 'rejected' | 'invoiced';
  billable?: boolean;
  sort_by?: 'date' | 'duration_hours' | 'created_at';
  sort_order?: 'asc' | 'desc';
}

// Response
interface ITimeEntriesResponse {
  data: ITimeEntry[];
  pagination: IPagination;
  meta: {
    total_count: number;
    total_hours: number;
    billable_hours: number;
    non_billable_hours: number;
    organization_id: string;
  };
}

// Example Request
GET /api/v1/time-entries?page=1&limit=20&date_from=2025-01-01&date_to=2025-01-31&status=approved
Authorization: Bearer <access_token>

// Example Response
{
  "data": [
    {
      "id": "time_123",
      "user": {
        "id": "user_123",
        "first_name": "John",
        "last_name": "Doe"
      },
      "project": {
        "id": "project_123",
        "name": "E-commerce Platform Development"
      },
      "task": {
        "id": "task_123",
        "name": "Database Schema Design"
      },
      "date": "2025-01-15",
      "duration_hours": 8.0,
      "description": "Designed database schema for user management and product catalog",
      "billable": true,
      "hourly_rate": 100.00,
      "total_amount": 800.00,
      "status": "approved",
      "approved_by": {
        "id": "user_456",
        "first_name": "Jane",
        "last_name": "Smith"
      },
      "approved_at": "2025-01-16T09:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total_pages": 8,
    "total_count": 150,
    "has_next": true,
    "has_prev": false
  },
  "meta": {
    "total_count": 150,
    "total_hours": 1200,
    "billable_hours": 1100,
    "non_billable_hours": 100,
    "organization_id": "org_456"
  }
}
```

#### **POST /time-entries**
```typescript
// Request
interface ICreateTimeEntryRequest {
  project_id: string;
  task_id?: string;
  date: string;
  start_time?: string;
  end_time?: string;
  duration_hours: number;
  description: string;
  billable: boolean;
  hourly_rate?: number;
  tags?: string[];
}

// Response
interface ICreateTimeEntryResponse {
  time_entry: ITimeEntry;
  message: string;
}

// Example Request
POST /api/v1/time-entries
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "project_id": "project_123",
  "task_id": "task_123",
  "date": "2025-01-15",
  "start_time": "09:00",
  "end_time": "17:00",
  "duration_hours": 8.0,
  "description": "Implemented user authentication system with JWT tokens",
  "billable": true,
  "hourly_rate": 100.00,
  "tags": ["authentication", "jwt", "backend"]
}

// Example Response
{
  "time_entry": {
    "id": "time_789",
    "project_id": "project_123",
    "task_id": "task_123",
    "date": "2025-01-15",
    "start_time": "09:00",
    "end_time": "17:00",
    "duration_hours": 8.0,
    "description": "Implemented user authentication system with JWT tokens",
    "billable": true,
    "hourly_rate": 100.00,
    "status": "pending",
    "created_at": "2025-01-15T17:00:00Z",
    "updated_at": "2025-01-15T17:00Z"
  },
  "message": "Time entry created successfully"
}
```

---

## 📊 **Error Handling & Validation**

### **Error Response Structure**
```typescript
interface IErrorResponse {
  error: {
    code: string;
    message: string;
    details?: any;
    timestamp: string;
    request_id: string;
  };
  meta: {
    api_version: string;
    documentation_url: string;
  };
}

// Example Error Response
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": {
      "field": "email",
      "message": "Invalid email format",
      "value": "invalid-email"
    },
    "timestamp": "2025-01-15T15:30:00Z",
    "request_id": "req_123456789"
  },
  "meta": {
    "api_version": "1.0.0",
    "documentation_url": "https://api.pivotalflow.com/docs"
  }
}
```

### **HTTP Status Codes**
```typescript
enum HttpStatus {
  // Success
  OK = 200,
  CREATED = 201,
  ACCEPTED = 202,
  NO_CONTENT = 204,
  
  // Client Errors
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  METHOD_NOT_ALLOWED = 405,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  TOO_MANY_REQUESTS = 429,
  
  // Server Errors
  INTERNAL_SERVER_ERROR = 500,
  NOT_IMPLEMENTED = 501,
  BAD_GATEWAY = 502,
  SERVICE_UNAVAILABLE = 503,
  GATEWAY_TIMEOUT = 504
}
```

### **Validation Using Zod**
```typescript
import { z } from 'zod';

// User creation schema
const CreateUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  first_name: z.string().min(1, 'First name is required').max(100, 'First name too long'),
  last_name: z.string().min(1, 'Last name is required').max(100, 'Last name too long'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
      'Password must contain uppercase, lowercase, number and special character'),
  role_id: z.string().uuid('Invalid role ID'),
  organization_id: z.string().uuid('Invalid organization ID'),
  phone_number: z.string().optional(),
  timezone: z.string().optional(),
  locale: z.string().optional()
});

// Quote creation schema
const CreateQuoteSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(255, 'Title too long'),
  description: z.string().optional(),
  customer_id: z.string().uuid('Invalid customer ID'),
  project_id: z.string().uuid('Invalid project ID').optional(),
  valid_from: z.string().datetime('Invalid valid from date'),
  valid_until: z.string().datetime('Invalid valid until date'),
  currency: z.string().length(3, 'Currency must be 3 characters'),
  line_items: z.array(z.object({
    description: z.string().min(1, 'Description is required'),
    quantity: z.number().positive('Quantity must be positive'),
    unit_price: z.number().nonnegative('Unit price must be non-negative'),
    service_category_id: z.string().uuid('Invalid service category ID').optional(),
    rate_card_id: z.string().uuid('Invalid rate card ID').optional()
  })).min(1, 'At least one line item is required'),
  terms_conditions: z.string().optional(),
  notes: z.string().optional(),
  internal_notes: z.string().optional()
});
```

---

## 📚 **API Documentation**

### **OpenAPI 3.0 Specification**
```yaml
openapi: 3.0.3
info:
  title: Pivotal Flow API
  description: Enterprise business management API for quotations, projects, and time tracking
  version: 1.0.0
  contact:
    name: API Support
    email: api-support@pivotalflow.com
    url: https://support.pivotalflow.com
  license:
    name: Proprietary
    url: https://pivotalflow.com/license

servers:
  - url: https://api.pivotalflow.com/api/v1
    description: Production server
  - url: https://staging-api.pivotalflow.com/api/v1
    description: Staging server
  - url: http://localhost:3002/api/v1
    description: Local development server

security:
  - BearerAuth: []

paths:
  /auth/login:
    post:
      tags:
        - Authentication
      summary: User login
      description: Authenticate user with email and password
      operationId: loginUser
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/LoginRequest'
      responses:
        '200':
          description: Successful login
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/LoginResponse'
        '400':
          description: Invalid credentials
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
        '401':
          description: Authentication failed
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'

components:
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

  schemas:
    LoginRequest:
      type: object
      required:
        - email
        - password
      properties:
        email:
          type: string
          format: email
          description: User email address
        password:
          type: string
          minLength: 8
          description: User password
        mfa_code:
          type: string
          description: Multi-factor authentication code
        remember_me:
          type: boolean
          default: false
          description: Remember user session

    LoginResponse:
      type: object
      properties:
        access_token:
          type: string
          description: JWT access token
        refresh_token:
          type: string
          description: JWT refresh token
        token_type:
          type: string
          enum: [Bearer]
          default: Bearer
        expires_in:
          type: integer
          description: Token expiration time in seconds
        user:
          $ref: '#/components/schemas/PublicUser'
        mfa_required:
          type: boolean
          description: Whether MFA is required
```

---

## 🚀 **API Implementation Guidelines**

### **Middleware Stack**
```typescript
// Middleware configuration
const app = fastify();

// Global middleware
app.addHook('preHandler', async (request, reply) => {
  // Request logging
  request.log.info({
    method: request.method,
    url: request.url,
    userAgent: request.headers['user-agent'],
    ip: request.ip
  });
});

// Authentication middleware
app.addHook('preHandler', async (request, reply) => {
  const publicRoutes = ['/auth/login', '/auth/register', '/health'];
  
  if (publicRoutes.includes(request.url)) {
    return;
  }
  
  const token = request.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    throw new UnauthorizedError('Access token required');
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    request.user = decoded;
  } catch (error) {
    throw new UnauthorizedError('Invalid access token');
  }
});

// Rate limiting middleware
app.addHook('preHandler', async (request, reply) => {
  const clientId = request.user?.sub || request.ip;
  const rateLimit = await rateLimitService.checkRateLimit(clientId);
  
  if (!rateLimit.allowed) {
    reply.header('X-RateLimit-Limit', rateLimit.limit);
    reply.header('X-RateLimit-Remaining', rateLimit.remaining);
    reply.header('X-RateLimit-Reset', rateLimit.resetTime);
    throw new TooManyRequestsError('Rate limit exceeded');
  }
});
```

### **Response Formatting**
```typescript
// Response serializer
app.setSerializerCompiler(({ schema, method, url, httpStatus }) => {
  return function (data) {
    // Standard response format
    const response = {
      data,
      meta: {
        timestamp: new Date().toISOString(),
        api_version: '1.0.0',
        endpoint: `${method} ${url}`,
        status: httpStatus
      }
    };
    
    return JSON.stringify(response);
  };
});

// Error serializer
app.setErrorHandler((error, request, reply) => {
  const statusCode = error.statusCode || 500;
  const errorResponse = {
    error: {
      code: error.code || 'INTERNAL_ERROR',
      message: error.message || 'An unexpected error occurred',
      details: error.details,
      timestamp: new Date().toISOString(),
      request_id: request.id
    },
    meta: {
      api_version: '1.0.0',
      documentation_url: 'https://api.pivotalflow.com/docs'
    }
  };
  
  reply.status(statusCode).send(errorResponse);
});
```

---

**Document Version**: 1.0  
**Last Updated**: January 2025  
**Next Review**: February 2025  
**API Version**: 1.0.0
