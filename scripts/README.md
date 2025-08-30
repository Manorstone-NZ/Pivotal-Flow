# Pivotal Flow Development Scripts

This directory contains scripts to help developers work with the Pivotal Flow project.

## 🚀 Quick Start

### For New Developers
```bash
# Set up the entire development environment
./scripts/dev/setup-dev.sh

# Start all services quickly
./scripts/dev/quick-start.sh
```

### For Testing
```bash
# Test the authentication system
./scripts/dev/test-auth.sh
```

## 📁 Script Directory Structure

```
scripts/
├── dev/                    # Development scripts
│   ├── setup-dev.sh       # Complete dev environment setup
│   ├── quick-start.sh     # Quick service startup
│   └── test-auth.sh       # Authentication system testing
├── deploy/                 # Deployment scripts
│   └── production-setup.sh # Production environment setup
└── README.md              # This file
```

## 🔧 Development Scripts

### `setup-dev.sh`
**Purpose**: Complete development environment setup for new developers

**What it does**:
- Installs pnpm if not present
- Starts Docker services
- Installs project dependencies
- Sets up environment files
- Configures database and seeds data
- Sets up frontend (if exists)

**Usage**:
```bash
./scripts/dev/setup-dev.sh
```

### `quick-start.sh`
**Purpose**: Quickly start all services for development

**What it does**:
- Starts Docker services (PostgreSQL, Redis)
- Starts backend development server
- Waits for services to be ready
- Performs health checks
- Provides service URLs and test commands

**Usage**:
```bash
./scripts/dev/quick-start.sh
```

### `test-auth.sh`
**Purpose**: Comprehensive testing of the authentication system

**What it tests**:
- Public endpoints (health, metrics, docs)
- Rate limiting functionality
- Login rate limiting (10 attempts max)
- Successful authentication flow
- Protected endpoints
- Logout functionality

**Usage**:
```bash
./scripts/dev/test-auth.sh
```

## 🚀 Deployment Scripts

### `production-setup.sh`
**Purpose**: Set up production environment configuration

**What it does**:
- Creates production environment file
- Generates strong secrets
- Provides deployment guidance
- Sets up security configurations

**Usage**:
```bash
./scripts/deploy/production-setup.sh
```

## 📋 Prerequisites

Before running these scripts, ensure you have:

- **Linux/macOS** (scripts are bash-based)
- **Git** for version control
- **Docker** and **Docker Compose** for services
- **Node.js** (version 18 or higher)
- **pnpm** (will be installed if missing)

## 🧪 Test Credentials

After running `setup-dev.sh`, you'll have these test accounts:

- **Admin User**: `admin@test.example.com` / `AdminPassword123!`
- **Regular User**: `user@test.example.com` / `UserPassword123!`

## 🔍 Troubleshooting

### Common Issues

**Docker not running**:
```bash
sudo systemctl start docker
sudo usermod -aG docker $USER
# Log out and back in
```

**Port 3000 already in use**:
```bash
lsof -i :3000 | awk 'NR>1 {print $2}' | xargs kill
```

**Database connection issues**:
```bash
cd apps/backend
pnpm prisma generate
pnpm prisma db push
```

**Rate limiting issues**:
```bash
# Clear Redis rate limit keys
redis-cli keys "login:*" | xargs redis-cli del
redis-cli keys "user:*" | xargs redis-cli del
```

## 📚 Related Documentation

- **API Documentation**: http://localhost:3000/docs
- **Epic A3 Report**: `plans/17_epic_a3_auth_report.md`
- **Project README**: `README.md`

## 🤝 Contributing

When adding new scripts:

1. Follow the existing naming convention
2. Add proper error handling
3. Include usage examples in this README
4. Test the script thoroughly
5. Make scripts executable: `chmod +x scripts/new-script.sh`

## ✅ Status

All scripts are tested and working with:
- ✅ Backend authentication system
- ✅ Rate limiting and security features
- ✅ Production configuration
- ✅ Development environment setup
- ✅ Comprehensive testing suite
