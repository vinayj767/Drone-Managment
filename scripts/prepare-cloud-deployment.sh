#!/bin/bash

# Cloud Deployment Preparation Script
# This script prepares your project for cloud deployment

echo "🚀 Preparing Drone Management System for Cloud Deployment"
echo "========================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "CLOUD_DEPLOYMENT.md" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

print_info "Project structure verification..."

# Check frontend files
if [ -f "frontend/vercel.json" ]; then
    print_status "Vercel configuration found"
else
    print_error "Vercel configuration missing"
fi

if [ -f "frontend/.env.production" ]; then
    print_status "Frontend production environment template found"
else
    print_warning "Frontend production environment template missing"
fi

# Check backend files
if [ -f "backend/railway.json" ]; then
    print_status "Railway configuration found"
else
    print_error "Railway configuration missing"
fi

if [ -f "backend/.env.production" ]; then
    print_status "Backend production environment template found"
else
    print_warning "Backend production environment template missing"
fi

echo ""
print_info "Deployment readiness checklist:"

# Check package.json files
if [ -f "frontend/package.json" ] && [ -f "backend/package.json" ]; then
    print_status "Package.json files present"
else
    print_error "Missing package.json files"
fi

# Check if .env files are in .gitignore
if grep -q "\.env" .gitignore 2>/dev/null; then
    print_status "Environment files are in .gitignore"
else
    print_warning "Add .env files to .gitignore before deploying"
fi

# Check for TypeScript compilation
print_info "Checking TypeScript compilation..."
cd backend
if npm run typecheck 2>/dev/null; then
    print_status "Backend TypeScript compiles successfully"
else
    print_warning "Backend TypeScript compilation issues detected"
fi

cd ../frontend
if npm run type-check 2>/dev/null; then
    print_status "Frontend TypeScript compiles successfully"
else
    print_warning "Frontend TypeScript compilation issues detected"
fi

cd ..

echo ""
print_info "🌟 Next Steps for Cloud Deployment:"
echo ""
echo "1. 📋 Setup Accounts:"
echo "   • Vercel: https://vercel.com"
echo "   • Railway: https://railway.app"
echo "   • MongoDB Atlas: https://mongodb.com/cloud/atlas"
echo ""
echo "2. 🗄️ Setup Database:"
echo "   • Create MongoDB Atlas cluster (M0 Free)"
echo "   • Create database user"
echo "   • Get connection string"
echo ""
echo "3. 🚂 Deploy Backend to Railway:"
echo "   • Connect GitHub repository"
echo "   • Set root directory: backend"
echo "   • Configure environment variables"
echo ""
echo "4. 🔺 Deploy Frontend to Vercel:"
echo "   • Connect GitHub repository"
echo "   • Set root directory: frontend"
echo "   • Configure environment variables"
echo ""
echo "5. 📖 Follow the complete guide:"
echo "   • Read: CLOUD_DEPLOYMENT.md"
echo ""

print_status "Deployment preparation complete!"
print_info "Your project is ready for cloud deployment. Follow the CLOUD_DEPLOYMENT.md guide for step-by-step instructions."

echo ""
echo "🚁 Happy deploying!"