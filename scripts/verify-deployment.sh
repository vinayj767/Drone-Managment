#!/bin/bash

# Production Deployment Verification Script
# This script verifies that all components are deployed correctly

echo "🚀 Starting Deployment Verification..."
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if a service is running
check_service() {
    local service_name=$1
    local url=$2
    
    echo -n "Checking $service_name... "
    if curl -s -o /dev/null -w "%{http_code}" "$url" | grep -q "200\|302"; then
        echo -e "${GREEN}✓ RUNNING${NC}"
        return 0
    else
        echo -e "${RED}✗ NOT RUNNING${NC}"
        return 1
    fi
}

# Function to check Docker container
check_container() {
    local container_name=$1
    
    echo -n "Checking Docker container $container_name... "
    if docker ps | grep -q "$container_name"; then
        echo -e "${GREEN}✓ RUNNING${NC}"
        return 0
    else
        echo -e "${RED}✗ NOT RUNNING${NC}"
        return 1
    fi
}

# Function to check database connection
check_database() {
    echo -n "Checking MongoDB connection... "
    if docker exec drone-management-db mongosh --eval "db.adminCommand('ismaster')" &>/dev/null; then
        echo -e "${GREEN}✓ CONNECTED${NC}"
        return 0
    else
        echo -e "${RED}✗ CONNECTION FAILED${NC}"
        return 1
    fi
}

# Main verification process
echo "📊 System Health Check"
echo "====================="

# Check Docker containers
check_container "drone-management-frontend"
check_container "drone-management-backend"
check_container "drone-management-db"
check_container "drone-management-nginx"

echo ""
echo "🔗 Service Connectivity Check"
echo "============================="

# Check services
check_service "Frontend" "http://localhost:3000"
check_service "Backend API" "http://localhost:5000/api/health"
check_service "Nginx Proxy" "http://localhost"
check_database

echo ""
echo "📈 API Endpoints Check"
echo "====================="

# Check critical API endpoints
check_service "Authentication" "http://localhost:5000/api/auth/health"
check_service "Drones API" "http://localhost:5000/api/drones"
check_service "Analytics API" "http://localhost:5000/api/analytics"
check_service "Missions API" "http://localhost:5000/api/missions"

echo ""
echo "🗂️ Database Collections Check"
echo "============================="

# Check database collections
echo -n "Checking database collections... "
collections=$(docker exec drone-management-db mongosh dronemanagement --quiet --eval "db.getCollectionNames().join(', ')")
if [[ $collections == *"users"* ]] && [[ $collections == *"drones"* ]] && [[ $collections == *"missions"* ]]; then
    echo -e "${GREEN}✓ ALL COLLECTIONS PRESENT${NC}"
    echo "   Collections: $collections"
else
    echo -e "${RED}✗ MISSING COLLECTIONS${NC}"
    echo "   Found: $collections"
fi

echo ""
echo "📁 File System Check"
echo "==================="

# Check critical files
echo -n "Checking configuration files... "
if [[ -f ".env.prod" ]] && [[ -f "docker-compose.prod.yml" ]] && [[ -f "nginx/nginx.conf" ]]; then
    echo -e "${GREEN}✓ ALL CONFIG FILES PRESENT${NC}"
else
    echo -e "${RED}✗ MISSING CONFIG FILES${NC}"
fi

echo ""
echo "🔒 Security Check"
echo "================"

# Check environment variables
echo -n "Checking environment configuration... "
if docker exec drone-management-backend printenv | grep -q "JWT_SECRET"; then
    echo -e "${GREEN}✓ ENVIRONMENT CONFIGURED${NC}"
else
    echo -e "${YELLOW}⚠ ENVIRONMENT NEEDS REVIEW${NC}"
fi

echo ""
echo "📊 Performance Metrics"
echo "====================="

# Get container stats
echo "Docker Container Resource Usage:"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}" \
    drone-management-frontend drone-management-backend drone-management-db drone-management-nginx

echo ""
echo "🌐 Accessibility Check"
echo "====================="

echo "Application URLs:"
echo "  📱 Main Application: http://localhost"
echo "  🖥️  Frontend Direct:  http://localhost:3000"
echo "  🔌 Backend API:      http://localhost:5000/api"
echo "  📚 API Docs:         http://localhost:5000/api-docs"
echo "  ❤️  Health Check:    http://localhost:5000/api/health"

echo ""
echo "🎉 Deployment Verification Complete!"
echo "===================================="

# Final status
if check_service "Main Application" "http://localhost" && 
   check_service "Backend API" "http://localhost:5000/api/health" &&
   check_container "drone-management-frontend" &&
   check_container "drone-management-backend"; then
    echo -e "${GREEN}🎊 DEPLOYMENT SUCCESSFUL! All systems operational.${NC}"
    echo ""
    echo "🚁 Your Drone Management System is ready to use!"
    echo "   Login with: admin@dronemanagement.com / admin123"
    exit 0
else
    echo -e "${RED}❌ DEPLOYMENT ISSUES DETECTED${NC}"
    echo ""
    echo "🔧 Troubleshooting:"
    echo "   1. Check Docker containers: docker-compose -f docker-compose.prod.yml ps"
    echo "   2. View logs: docker-compose -f docker-compose.prod.yml logs"
    echo "   3. Restart services: docker-compose -f docker-compose.prod.yml restart"
    exit 1
fi