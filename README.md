# Pivotal Flow

A comprehensive business management platform for professional services organizations.

## Overview

Pivotal Flow is a proprietary business management application designed to streamline operations for professional services companies. The platform provides integrated solutions for:

- **Quote Management**: End-to-end quote lifecycle management
- **Rate Card Management**: Flexible pricing and rate structures
- **User Management**: Role-based access control and permissions
- **Currency Management**: ISO 4217 compliant currency handling
- **Caching**: High-performance Redis-based caching
- **Monitoring**: Comprehensive metrics and health monitoring

## Architecture

The application is built using modern web technologies with a focus on:

- **TypeScript**: Type-safe development
- **Fastify**: High-performance web framework
- **Drizzle ORM**: Type-safe database operations
- **PostgreSQL**: Robust relational database
- **Redis**: High-performance caching
- **Docker**: Containerized deployment

## Quick Start

### Prerequisites

- Node.js 20.x
- PostgreSQL 16
- Redis 7
- Docker and Docker Compose

### Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Pivotal-Flow
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Start infrastructure services**
   ```bash
   cd infra/docker
   docker compose up -d postgres redis
   ```

5. **Run database migrations**
   ```bash
   cd apps/backend
   pnpm run db:migrate
   ```

6. **Start the development server**
   ```bash
   pnpm run dev
   ```

## Project Structure

```
Pivotal-Flow/
├── apps/
│   ├── backend/          # Backend API server
│   └── frontend/         # Frontend application
├── packages/
│   └── shared/           # Shared utilities and types
├── infra/
│   └── docker/           # Docker configuration
├── docs/                 # Documentation
├── scripts/              # Utility scripts
└── plans/                # Project planning documents
```

## API Documentation

The API documentation is available at:
- **Development**: http://localhost:3000/docs
- **OpenAPI Spec**: http://localhost:3000/docs/json

## Key Features

### Currency Management
- ISO 4217 compliant currency validation
- Support for 60+ global currencies
- Currency formatting and symbol display
- Regional currency grouping

### Caching System
- Redis-based caching for performance
- Automatic cache invalidation
- Graceful fallback when Redis unavailable
- Cache health monitoring

### Security
- JWT-based authentication
- Role-based access control
- Rate limiting and security headers
- Input validation and sanitization

### Monitoring
- Prometheus metrics collection
- Grafana dashboards
- Health check endpoints
- Performance monitoring

## Development

### Code Quality

The project uses strict TypeScript configuration and ESLint rules:

```bash
# Type checking
pnpm run type-check

# Linting
pnpm run lint

# Testing
pnpm run test
```

### Database Migrations

```bash
# Generate migration
pnpm run db:generate

# Apply migrations
pnpm run db:migrate

# Reset database
pnpm run db:reset
```

## Deployment

### Docker Deployment

```bash
# Build and start all services
cd infra/docker
docker compose up -d
```

### Production Configuration

1. Set up production environment variables
2. Configure SSL certificates
3. Set up monitoring and logging
4. Configure backup strategies

## License

**Manorstone Limited Software License Agreement**

Copyright (c) 2024 Manorstone Limited. All rights reserved.

This software is proprietary and confidential. See [LICENSE](LICENSE) for full terms.

### Open Source Components

This application uses various open source components. See [OPEN_SOURCE_NOTICE.md](OPEN_SOURCE_NOTICE.md) for a complete list of dependencies and their respective licenses.

## Support

For technical support or licensing inquiries:

- **Email**: support@manorstone.co.nz
- **Legal**: legal@manorstone.co.nz
- **Documentation**: [docs/](docs/)

## Contributing

This is a proprietary application. For licensing and contribution inquiries, please contact legal@manorstone.co.nz.

---

**Pivotal Flow** - Streamlining Professional Services Management
