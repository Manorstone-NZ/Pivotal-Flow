#!/bin/bash

# Development Environment Setup Script
# This script sets up the development environment for new developers

set -e

echo "🚀 Pivotal Flow Development Environment Setup"
echo "============================================="

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   echo "❌ This script should not be run as root"
   exit 1
fi

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "📦 Installing pnpm..."
    npm install -g pnpm
else
    echo "✅ pnpm is already installed"
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo "🐳 Starting Docker..."
    sudo systemctl start docker
    sudo usermod -aG docker $USER
    echo "⚠️  Please log out and back in for Docker group changes to take effect"
else
    echo "✅ Docker is running"
fi

# Start Docker services
echo "🐳 Starting Docker services..."
cd infra/docker
docker compose up -d
cd ../..

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Set up environment files
if [ ! -f "apps/backend/.env.local" ]; then
    echo "📝 Creating backend .env.local..."
    cp apps/backend/env.local apps/backend/.env.local
    echo "✅ Backend environment file created"
else
    echo "⚠️  Backend .env.local already exists"
fi

# Set up database
echo "🗄️  Setting up database..."
cd apps/backend
pnpm prisma generate
pnpm prisma db push

# Seed the database
echo "🌱 Seeding database..."
pnpm run seed

cd ../..

# Set up frontend (if exists)
if [ -d "apps/frontend" ]; then
    echo "🎨 Setting up frontend..."
    cd apps/frontend
    if [ ! -f ".env.local" ]; then
        cp .env.example .env.local
        echo "✅ Frontend environment file created"
    fi
    cd ../..
fi

echo ""
echo "🔧 Development Environment Setup Complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Start the backend: cd apps/backend && pnpm dev"
echo "2. Start the frontend: cd apps/frontend && pnpm dev"
echo "3. View API docs: http://localhost:3000/docs"
echo "4. Check health: http://localhost:3000/health"
echo ""
echo "🧪 Test Credentials:"
echo "Admin: admin@test.example.com / AdminPassword123!"
echo "User: user@test.example.com / UserPassword123!"
echo ""
echo "📚 Documentation:"
echo "- API Docs: http://localhost:3000/docs"
echo "- Epic A3 Report: plans/17_epic_a3_auth_report.md"
echo ""
echo "✅ Happy coding!"
