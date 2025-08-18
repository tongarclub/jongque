#!/bin/bash

# JongQue Testing Scripts
# Usage: ./scripts/run-tests.sh [test-type]

set -e

echo "🧪 JongQue Automated Testing Suite"
echo "=================================="

# Set environment variables for testing
export CI=true
export NEXTAUTH_URL=http://localhost:3000
export NEXTAUTH_SECRET=test-secret-for-ci
export DATABASE_URL=postgresql://jongque_user:jongque_pass@localhost:5432/jongque_db

# Function to check if services are running
check_services() {
    echo "🔍 Checking required services..."
    
    # Check PostgreSQL
    if ! pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
        echo "❌ PostgreSQL is not running. Please start it with: docker-compose up -d postgres"
        exit 1
    fi
    echo "✅ PostgreSQL is running"
    
    # Check Redis
    if ! redis-cli ping > /dev/null 2>&1; then
        echo "❌ Redis is not running. Please start it with: docker-compose up -d redis"
        exit 1
    fi
    echo "✅ Redis is running"
}

# Function to setup test database
setup_test_db() {
    echo "📦 Setting up test database..."
    npx prisma generate
    npx prisma db push --force-reset
    npx prisma db seed
    echo "✅ Test database setup complete"
}

# Function to run basic tests
run_basic_tests() {
    echo "🎯 Running basic Playwright tests..."
    npm run test -- tests/basic.spec.ts
}

# Function to run all Playwright tests
run_all_tests() {
    echo "🚀 Running all Playwright tests..."
    npm run test
}

# Function to run BDD tests
run_bdd_tests() {
    echo "🥒 Running BDD tests with Cucumber..."
    npm run test:bdd
}

# Function to run tests with UI
run_tests_ui() {
    echo "🖥️  Running tests with Playwright UI..."
    npm run test:ui
}

# Function to run performance tests
run_performance_tests() {
    echo "⚡ Running performance tests..."
    # Add performance test commands here when implemented
    echo "Performance tests not yet implemented"
}

# Function to generate test report
generate_report() {
    echo "📊 Generating test report..."
    npm run test:report
}

# Main execution
case "${1:-all}" in
    "basic")
        check_services
        setup_test_db
        run_basic_tests
        ;;
    "bdd")
        check_services
        setup_test_db
        run_bdd_tests
        ;;
    "ui")
        check_services
        setup_test_db
        run_tests_ui
        ;;
    "performance")
        check_services
        setup_test_db
        run_performance_tests
        ;;
    "report")
        generate_report
        ;;
    "all")
        check_services
        setup_test_db
        echo "🔄 Running complete test suite..."
        run_basic_tests
        echo ""
        run_bdd_tests
        echo ""
        generate_report
        ;;
    *)
        echo "Usage: $0 [basic|bdd|ui|performance|report|all]"
        echo ""
        echo "Available test types:"
        echo "  basic       - Run basic Playwright tests"
        echo "  bdd         - Run BDD tests with Cucumber"
        echo "  ui          - Run tests with Playwright UI"
        echo "  performance - Run performance tests"
        echo "  report      - Generate test report"
        echo "  all         - Run all tests (default)"
        exit 1
        ;;
esac

echo ""
echo "✨ Testing completed successfully!"
