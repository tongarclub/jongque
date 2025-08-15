#!/bin/bash

# Docker Production Script for JongQue

set -e

echo "🐳 JongQue Docker Production Deployment"
echo "========================================"

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Check if .env.prod exists
if [ ! -f .env.prod ]; then
    echo "❌ .env.prod file not found!"
    echo "   Please copy .env.prod.example to .env.prod and fill in your values."
    exit 1
fi

# Function to wait for service
wait_for_service() {
    local service=$1
    local port=$2
    local host=${3:-localhost}
    
    echo "⏳ Waiting for $service to be ready on $host:$port..."
    
    for i in {1..30}; do
        if nc -z $host $port >/dev/null 2>&1; then
            echo "✅ $service is ready!"
            return 0
        fi
        echo "   Attempt $i/30: $service not ready yet..."
        sleep 5
    done
    
    echo "❌ $service failed to start within 150 seconds"
    return 1
}

# Load environment variables
set -a
source .env.prod
set +a

echo "🔨 Building production images..."
docker-compose -f docker-compose.prod.yml build --no-cache

echo "🚀 Starting production services..."
docker-compose -f docker-compose.prod.yml down --volumes --remove-orphans
docker-compose -f docker-compose.prod.yml up -d postgres redis

# Wait for services
wait_for_service "PostgreSQL" 5432
wait_for_service "Redis" 6379

echo "🔄 Running database migrations..."
docker-compose -f docker-compose.prod.yml run --rm app npx prisma migrate deploy

echo "🌱 Seeding database (if needed)..."
docker-compose -f docker-compose.prod.yml run --rm app npm run db:seed

echo "🚀 Starting application and nginx..."
docker-compose -f docker-compose.prod.yml up -d app nginx

# Wait for application
wait_for_service "Application" 3000
wait_for_service "Nginx" 80

echo ""
echo "✅ Production environment is ready!"
echo ""
echo "🌐 Application: http://localhost"
echo "🔒 HTTPS: https://localhost (if SSL configured)"
echo ""
echo "📋 Useful commands:"
echo "   docker-compose -f docker-compose.prod.yml logs app     # View app logs"
echo "   docker-compose -f docker-compose.prod.yml ps          # View services status"
echo "   docker-compose -f docker-compose.prod.yml down        # Stop all services"
echo ""
echo "📊 Monitoring:"
echo "   docker-compose -f docker-compose.prod.yml logs --tail=100 -f  # Follow logs"
echo ""
