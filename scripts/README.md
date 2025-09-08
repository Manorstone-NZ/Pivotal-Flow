# Pivotal Flow Development Scripts

This directory contains scripts to manage the Pivotal Flow development environment.

## Available Scripts

### 🚀 `start-all.sh` - Complete Startup (Recommended)
**Full startup with all checks and validation**

```bash
./scripts/start-all.sh
```

**What it does:**
1. ✅ Checks all prerequisites (Docker, pnpm, curl)
2. 🐳 Starts Docker services (PostgreSQL, Redis)
3. 🗄️ Sets up database (schema push + seeding with roles)
4. 🔧 Starts backend server
5. 🎨 Starts frontend server
6. 🏥 Runs health checks
7. 🔑 Tests login functionality
8. 📊 Displays final status

**Use when:** First time setup, after system restart, or when you want full validation

---

### ⚡ `quick-start.sh` - Fast Startup
**Quick startup without extensive checks**

```bash
./scripts/quick-start.sh
```

**What it does:**
1. 🐳 Starts Docker services
2. 🗄️ Quick database setup (push + seed)
3. 🔧 Starts backend server
4. 🎨 Starts frontend server
5. ✅ Basic status display

**Use when:** You know everything is set up and just want to start services quickly

---

### 🛑 `dev-stop.sh` - Stop All Services
**Stops all development services**

```bash
./scripts/dev-stop.sh
```

**What it does:**
1. 🛑 Stops frontend server (port 5173)
2. 🛑 Stops backend server (port 3000)
3. 🐳 Stops Docker containers
4. 🧹 Cleans up PID files and processes

---

## Service URLs

After starting services, you can access:

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3000
- **Health Check**: http://localhost:3000/api/v1/health
- **API Documentation**: http://localhost:3000/api/docs

## Login Credentials

- **Email**: admin@pivotalflow.com
- **Password**: password123!extra

## Logs

- **Backend Logs**: `tail -f logs/backend.log`
- **Frontend Logs**: `tail -f logs/frontend.log`

## Troubleshooting

### Port Already in Use
If you get "port already in use" errors:
```bash
# Kill processes on specific ports
lsof -ti :3000 | xargs kill -9  # Backend
lsof -ti :5173 | xargs kill -9  # Frontend
```

### Docker Issues
If Docker containers fail to start:
```bash
# Clean restart Docker
cd infra/docker
docker-compose down -v
docker-compose up -d
cd ../..
```

### Database Issues
If database setup fails:
```bash
# Reset database
cd infra/docker
docker-compose down -v
docker-compose up -d
cd ../..
pnpm -w drizzle:push
pnpm -w seed:demo
```

### Frontend Not Loading
If frontend shows old design or errors:
```bash
# Restart frontend
cd apps/frontend
pnpm dev
```

## Development Workflow

1. **Start everything**: `./scripts/start-all.sh`
2. **Develop your features**
3. **Stop when done**: `./scripts/dev-stop.sh`

For quick iterations during development:
1. **Quick start**: `./scripts/quick-start.sh`
2. **Make changes**
3. **Restart specific service** (frontend/backend)

## Prerequisites

Make sure you have installed:
- Docker & Docker Compose
- pnpm
- curl
- Node.js (for pnpm)

## Environment Variables

The scripts automatically set these environment variables:
- `DATABASE_URL`: PostgreSQL connection
- `REDIS_URL`: Redis connection  
- `JWT_SECRET`: Authentication secret
- `CORS_ORIGIN`: Allowed origins
- `OPENAPI_ENABLE`: Enable API docs
- `NODE_ENV`: Development mode