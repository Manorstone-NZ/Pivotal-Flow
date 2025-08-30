#!/bin/bash

# Production Environment Setup Script
# This script helps configure the production environment

set -e

echo "🚀 Pivotal Flow Production Environment Setup"
echo "============================================="

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   echo "❌ This script should not be run as root"
   exit 1
fi

# Create production environment file
if [ ! -f ".env.production" ]; then
    echo "📝 Creating .env.production from template..."
    cp env.production .env.production
    echo "✅ .env.production created"
else
    echo "⚠️  .env.production already exists"
fi

echo ""
echo "🔧 Next Steps:"
echo "1. Edit .env.production with your production values"
echo "2. Set strong passwords and secrets"
echo "3. Update database and Redis hostnames"
echo "4. Configure CORS origins for your domain"
echo "5. Set up monitoring (Sentry, New Relic, etc.)"
echo ""
echo "⚠️  IMPORTANT: Never commit .env.production to version control!"
echo ""

# Generate strong secrets if needed
echo "🔐 Generate strong secrets:"
echo "JWT_SECRET: $(openssl rand -base64 64)"
echo "COOKIE_SECRET: $(openssl rand -base64 64)"
echo ""

echo "✅ Production setup script completed!"
echo "📖 See docs/ for deployment instructions"
