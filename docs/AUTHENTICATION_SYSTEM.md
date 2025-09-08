# Pivotal Flow Authentication System

## Overview

The Pivotal Flow authentication system provides secure user authentication using JWT tokens, Argon2 password hashing, and PostgreSQL database storage. This document explains how the system works, the components involved, and how to troubleshoot common issues.

## Architecture

### Components

1. **Frontend** (`apps/frontend/`)
   - React application with authentication store
   - Login form with validation
   - JWT token management
   - Route protection

2. **Backend** (`apps/backend/`)
   - Fastify server with TypeBox validation
   - Authentication service with Drizzle ORM
   - JWT token generation and validation
   - Password hashing with Argon2

3. **Database** (PostgreSQL)
   - User storage with encrypted passwords
   - Role-based access control
   - Organization management

4. **Cache** (Redis - Optional)
   - Refresh token storage
   - Session management

## Authentication Flow

### 1. User Login Process

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend
    participant D as Database
    participant C as Cache (Optional)

    U->>F: Enter credentials
    F->>F: Validate form (min 12 chars password)
    F->>B: POST /api/v1/auth/login
    B->>B: Validate TypeBox schema
    B->>D: Query user by email
    D-->>B: Return user data + password hash
    B->>B: Verify password with Argon2
    B->>D: Query user roles
    D-->>B: Return roles (empty array if none)
    B->>B: Generate JWT access token
    B->>C: Store refresh token (if cache available)
    B-->>F: Return access token + user data
    F->>F: Store token in auth store
    F->>F: Redirect to dashboard
```

### 2. Token Structure

**Access Token (JWT)**
```json
{
  "sub": "user-admin",
  "org": "org-pivotal-flow", 
  "roles": [],
  "jti": "unique-token-id",
  "iat": 1757302066,
  "exp": 1757302966
}
```

**Login Response**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-admin",
    "email": "admin@pivotalflow.com",
    "displayName": "",
    "roles": [],
    "organizationId": "org-pivotal-flow"
  }
}
```

## Configuration

### Environment Variables

**Backend**
```bash
DATABASE_URL=postgresql://pivotal:pivotal@localhost:5433/pivotal
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-super-secret-jwt-key-that-is-at-least-32-characters-long
CORS_ORIGIN=http://localhost:3000,http://localhost:5173,http://localhost:5174
OPENAPI_ENABLE=true
ALLOW_LOCAL_DB_CREATION=yes
```

**Frontend**
```bash
VITE_API_URL=http://localhost:3000
VITE_APP_VERSION=0.1.0
VITE_BUILD_SHA=development
```

### Database Schema

**Users Table**
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES organizations(id),
  email VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  password_hash TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Security Features

### 1. Password Security
- **Minimum Length**: 12 characters (enforced by TypeBox schema)
- **Hashing**: Argon2id with configurable parameters
- **Salt**: Unique salt per password
- **Verification**: Constant-time comparison

### 2. JWT Security
- **Algorithm**: HS256
- **Expiration**: 15 minutes (configurable)
- **Issuer**: Configurable JWT issuer
- **Audience**: Configurable JWT audience

### 3. CORS Protection
- **Origins**: Explicitly allowed origins
- **Headers**: Controlled header access
- **Methods**: Restricted HTTP methods

### 4. Rate Limiting
- **Login Attempts**: Configurable rate limiting
- **IP-based**: Per-IP request limits
- **Redis-backed**: Distributed rate limiting

## API Endpoints

### Authentication Routes

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/v1/auth/login` | User login | No |
| POST | `/api/v1/auth/refresh` | Refresh token | No |
| POST | `/api/v1/auth/logout` | User logout | Yes |
| GET | `/api/v1/auth/me` | Get current user | Yes |

### Health Check Routes

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/v1/health` | System health | No |
| GET | `/api/v1/health/ping` | Simple ping | No |

## Default Credentials

After seeding the database:

```
Email: admin@pivotalflow.com
Password: password123!extra
```

## Troubleshooting

### Common Issues

#### 1. 500 Internal Server Error on Login

**Symptoms**: Login returns 500 error instead of 401/200

**Causes**:
- Missing database connection
- Cache adapter not available
- Token manager not registered
- TypeBox schema validation failure

**Solutions**:
```bash
# Check database connection
curl http://localhost:3000/api/v1/health

# Verify database plugin registration
# Check apps/backend/src/plugins.ts

# Ensure cache adapter is optional
# Check apps/backend/src/modules/auth/plugin.auth.ts
```

#### 2. 401 Unauthorized

**Symptoms**: Login returns 401 "Invalid email or password"

**Causes**:
- Wrong credentials
- User not found in database
- Password hash mismatch
- User account inactive

**Solutions**:
```bash
# Check user exists
docker exec -it docker-postgres-1 psql -U pivotal -d pivotal -c "SELECT email FROM users WHERE email = 'admin@pivotalflow.com';"

# Reseed database
pnpm --filter backend run db:seed
```

#### 3. CORS Errors

**Symptoms**: Browser blocks requests due to CORS policy

**Causes**:
- Frontend origin not in CORS allowlist
- Missing CORS headers
- Preflight request failure

**Solutions**:
```bash
# Check CORS configuration
# apps/backend/src/lib/cors-rate-limit.ts

# Verify CORS_ORIGIN environment variable
echo $CORS_ORIGIN
```

#### 4. Database Connection Issues

**Symptoms**: Database queries fail, health check fails

**Causes**:
- PostgreSQL not running
- Wrong connection string
- Database not created
- Schema not migrated

**Solutions**:
```bash
# Start Docker containers
docker compose up -d

# Check database exists
docker exec -it docker-postgres-1 psql -U pivotal -d pivotal -c "\l"

# Push schema
DATABASE_URL=postgresql://pivotal:pivotal@localhost:5433/pivotal ALLOW_LOCAL_DB_CREATION=yes pnpm --filter backend run drizzle:push
```

### Debug Commands

```bash
# Test login endpoint
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@pivotalflow.com","password":"password123!extra"}'

# Check health endpoint
curl http://localhost:3000/api/v1/health

# View backend logs
# Check terminal where backend is running

# Check database contents
docker exec -it docker-postgres-1 psql -U pivotal -d pivotal -c "SELECT * FROM users;"

# Check Redis (if enabled)
docker exec -it docker-redis-1 redis-cli ping
```

## Development Workflow

### 1. Starting Services

```bash
# Start Docker containers
docker compose up -d

# Start backend
cd apps/backend
DATABASE_URL=postgresql://pivotal:pivotal@localhost:5433/pivotal \
REDIS_URL=redis://localhost:6379 \
JWT_SECRET=your-super-secret-jwt-key-that-is-at-least-32-characters-long \
CORS_ORIGIN=http://localhost:3000,http://localhost:5173,http://localhost:5174 \
OPENAPI_ENABLE=true \
pnpm dev

# Start frontend (in another terminal)
cd apps/frontend
pnpm dev
```

### 2. Database Management

```bash
# Seed database
DATABASE_URL=postgresql://pivotal:pivotal@localhost:5433/pivotal \
ALLOW_LOCAL_DB_CREATION=yes \
pnpm --filter backend run db:seed

# Reset database
DATABASE_URL=postgresql://pivotal:pivotal@localhost:5433/pivotal \
ALLOW_LOCAL_DB_CREATION=yes \
pnpm --filter backend run db:seed:reset
```

### 3. Testing

```bash
# Run unit tests
pnpm test

# Run E2E tests
pnpm test:e2e

# Run accessibility tests
pnpm test:accessibility
```

## Production Considerations

### 1. Security
- Use strong JWT secrets (32+ characters)
- Enable HTTPS in production
- Configure proper CORS origins
- Use environment-specific database credentials
- Enable rate limiting

### 2. Performance
- Enable Redis for session storage
- Configure connection pooling
- Use CDN for static assets
- Enable compression

### 3. Monitoring
- Set up health check monitoring
- Configure log aggregation
- Monitor authentication failures
- Track performance metrics

## File Structure

```
apps/
├── frontend/
│   ├── src/
│   │   ├── features/auth/
│   │   │   ├── store.ts          # Auth state management
│   │   │   └── LoginPage.tsx     # Login form
│   │   ├── components/ui/
│   │   │   ├── Button.tsx        # UI components
│   │   │   └── Input.tsx
│   │   └── lib/api/
│   │       └── client.ts         # API client
│   └── tests/e2e/
│       └── smoke.spec.ts         # E2E tests
└── backend/
    ├── src/
    │   ├── modules/auth/
    │   │   ├── plugin.auth.ts    # Auth plugin
    │   │   ├── service.drizzle.ts # Auth service
    │   │   ├── routes.login.ts   # Login route
    │   │   └── typeboxSchemas.ts # Validation schemas
    │   ├── lib/
    │   │   ├── db.ts            # Database connection
    │   │   └── cors-rate-limit.ts # CORS config
    │   └── plugins.ts           # Plugin registration
    └── scripts/
        └── seed.ts              # Database seeding
```

## Conclusion

The Pivotal Flow authentication system provides a robust, secure foundation for user authentication. By following this documentation and using the provided troubleshooting guide, developers can effectively work with and maintain the authentication system.

For additional support, refer to the codebase comments, test files, and the development team.
