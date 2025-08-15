#!/bin/bash

# Docker Development Script for JongQue

set -e

echo "🐳 JongQue Docker Development Setup"
echo "===================================="

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
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
        sleep 2
    done
    
    echo "❌ $service failed to start within 60 seconds"
    return 1
}

# Create .env.local if it doesn't exist
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local from .env.docker..."
    cp .env.docker .env.local
fi

# Build and start services
echo "🔨 Building and starting Docker services..."
docker-compose down --volumes --remove-orphans
docker-compose build --no-cache
docker-compose up -d postgres redis

# Wait for database and redis
wait_for_service "PostgreSQL" 5432
wait_for_service "Redis" 6379

echo "🔄 Running database migrations..."
docker-compose run --rm app npx prisma migrate dev --name init

echo "🌱 Seeding database..."
docker-compose run --rm app npm run db:seed

echo "🚀 Starting the application..."
docker-compose up app

echo ""
echo "✅ Development environment is ready!"
echo ""
echo "🌐 Application: http://localhost:3000"
echo "🎨 UI Components: http://localhost:3000/test-ui"
echo "📊 Prisma Studio: docker-compose --profile tools up prisma-studio (port 5555)"
echo ""
echo "📋 Useful commands:"
echo "   docker-compose logs app          # View app logs"
echo "   docker-compose exec app sh       # Shell into app container"
echo "   docker-compose exec postgres psql -U postgres -d jongque  # Database shell"
echo "   docker-compose down              # Stop all services"
echo ""
