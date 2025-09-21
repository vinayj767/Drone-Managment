@echo off
REM Drone Management System - Production Deployment Script for Windows
echo 🚁 Starting Drone Management System Production Deployment...

REM Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not installed. Please install Docker first.
    exit /b 1
)

REM Check if Docker Compose is installed
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker Compose is not installed. Please install Docker Compose first.
    exit /b 1
)

REM Load environment variables
if exist .env.prod (
    echo 📋 Loading production environment variables...
    for /f "delims=" %%i in (.env.prod) do set %%i
) else (
    echo ⚠️  No .env.prod file found. Using default values.
)

REM Stop existing containers
echo 🛑 Stopping existing containers...
docker-compose -f docker-compose.prod.yml down

REM Build and start services
echo 🏗️  Building and starting services...
docker-compose -f docker-compose.prod.yml up --build -d

REM Wait for services to be healthy
echo ⏳ Waiting for services to be healthy...
timeout /t 30 /nobreak >nul

REM Check service health
echo 🔍 Checking service health...
docker-compose -f docker-compose.prod.yml ps

REM Test API health
echo 🩺 Testing API health...
curl -f http://localhost:5000/api/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Backend API is healthy
) else (
    echo ❌ Backend API health check failed
)

REM Test Frontend
echo 🩺 Testing Frontend...
curl -f http://localhost:3000 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Frontend is healthy
) else (
    echo ❌ Frontend health check failed
)

REM Show logs
echo 📋 Recent logs:
docker-compose -f docker-compose.prod.yml logs --tail=20

echo 🎉 Deployment completed!
echo 🌐 Frontend: http://localhost:3000
echo 🔗 Backend API: http://localhost:5000/api
echo 📖 API Docs: http://localhost:5000/api-docs
echo 📊 Health Check: http://localhost:5000/api/health
echo.
echo 📝 Useful commands:
echo   View logs: docker-compose -f docker-compose.prod.yml logs -f
echo   Stop services: docker-compose -f docker-compose.prod.yml down
echo   Restart services: docker-compose -f docker-compose.prod.yml restart
echo   Update services: docker-compose -f docker-compose.prod.yml up --build -d

pause