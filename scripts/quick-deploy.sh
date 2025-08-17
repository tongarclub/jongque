#!/bin/bash

# Quick Deploy Script for JongQue Production Database
# Usage: ./scripts/quick-deploy.sh

echo "🚀 JongQue Production Database Quick Deploy"
echo "=========================================="
echo ""

# Check if DATABASE_URL is set
if [ -z "$PRODUCTION_DATABASE_URL" ]; then
    echo "❌ PRODUCTION_DATABASE_URL is not set"
    echo ""
    echo "Please set your production database URL:"
    echo "export PRODUCTION_DATABASE_URL=\"postgresql://user:pass@host:port/db\""
    echo ""
    echo "Or run with the URL directly:"
    echo "PRODUCTION_DATABASE_URL=\"your-url\" ./scripts/quick-deploy.sh"
    echo ""
    exit 1
fi

echo "🔗 Target Database: $(echo $PRODUCTION_DATABASE_URL | sed 's/:[^:@]*@/:****@/')"
echo ""

# Confirm deployment
read -p "⚠️  This will DELETE ALL DATA in production database. Continue? (y/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Deployment cancelled"
    exit 1
fi

echo ""
echo "🔄 Starting deployment..."
echo ""

# Run the deployment script
node scripts/deploy-to-production.js

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Deployment completed successfully!"
    echo "🔗 Test login at: https://jongque.vercel.app/signin"
else
    echo ""
    echo "❌ Deployment failed!"
    exit 1
fi
