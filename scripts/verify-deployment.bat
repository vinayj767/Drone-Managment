@echo off
REM Production Deployment Verification Script for Windows
REM This script verifies that all components are deployed correctly

echo 🚀 Starting Deployment Verification...
echo ======================================

REM Function to check if a service is running
set "error_count=0"

echo 📊 System Health Check
echo =====================

REM Check Docker containers
echo Checking Docker containers...
docker ps --filter "name=drone-management-frontend" --format "{{.Names}}" | findstr /C:"drone-management-frontend" >nul
if %errorlevel% equ 0 (
    echo ✓ Frontend container is running
) else (
    echo ✗ Frontend container is NOT running
    set /a error_count+=1
)

docker ps --filter "name=drone-management-backend" --format "{{.Names}}" | findstr /C:"drone-management-backend" >nul
if %errorlevel% equ 0 (
    echo ✓ Backend container is running
) else (
    echo ✗ Backend container is NOT running
    set /a error_count+=1
)

docker ps --filter "name=drone-management-db" --format "{{.Names}}" | findstr /C:"drone-management-db" >nul
if %errorlevel% equ 0 (
    echo ✓ Database container is running
) else (
    echo ✗ Database container is NOT running
    set /a error_count+=1
)

docker ps --filter "name=drone-management-nginx" --format "{{.Names}}" | findstr /C:"drone-management-nginx" >nul
if %errorlevel% equ 0 (
    echo ✓ Nginx container is running
) else (
    echo ✗ Nginx container is NOT running
    set /a error_count+=1
)

echo.
echo 🔗 Service Connectivity Check
echo =============================

REM Check services using curl
echo Checking Frontend...
curl -s -o nul -w "%%{http_code}" "http://localhost:3000" | findstr /C:"200" >nul
if %errorlevel% equ 0 (
    echo ✓ Frontend is accessible
) else (
    echo ✗ Frontend is NOT accessible
    set /a error_count+=1
)

echo Checking Backend API...
curl -s -o nul -w "%%{http_code}" "http://localhost:5000/api/health" | findstr /C:"200" >nul
if %errorlevel% equ 0 (
    echo ✓ Backend API is accessible
) else (
    echo ✗ Backend API is NOT accessible
    set /a error_count+=1
)

echo Checking Nginx Proxy...
curl -s -o nul -w "%%{http_code}" "http://localhost" | findstr /C:"200" >nul
if %errorlevel% equ 0 (
    echo ✓ Nginx proxy is accessible
) else (
    echo ✗ Nginx proxy is NOT accessible
    set /a error_count+=1
)

echo.
echo 📈 API Endpoints Check
echo =====================

echo Checking critical API endpoints...
curl -s -o nul -w "%%{http_code}" "http://localhost:5000/api/drones" | findstr /C:"200" >nul
if %errorlevel% equ 0 (
    echo ✓ Drones API is working
) else (
    echo ✗ Drones API is NOT working
)

curl -s -o nul -w "%%{http_code}" "http://localhost:5000/api/analytics" | findstr /C:"200" >nul
if %errorlevel% equ 0 (
    echo ✓ Analytics API is working
) else (
    echo ✗ Analytics API is NOT working
)

curl -s -o nul -w "%%{http_code}" "http://localhost:5000/api/missions" | findstr /C:"200" >nul
if %errorlevel% equ 0 (
    echo ✓ Missions API is working
) else (
    echo ✗ Missions API is NOT working
)

echo.
echo 📁 File System Check
echo ===================

echo Checking configuration files...
if exist ".env.prod" (
    echo ✓ .env.prod file exists
) else (
    echo ✗ .env.prod file is missing
    set /a error_count+=1
)

if exist "docker-compose.prod.yml" (
    echo ✓ docker-compose.prod.yml file exists
) else (
    echo ✗ docker-compose.prod.yml file is missing
    set /a error_count+=1
)

if exist "nginx\nginx.conf" (
    echo ✓ nginx.conf file exists
) else (
    echo ✗ nginx.conf file is missing
    set /a error_count+=1
)

echo.
echo 📊 Performance Metrics
echo =====================

echo Docker Container Resource Usage:
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}" drone-management-frontend drone-management-backend drone-management-db drone-management-nginx

echo.
echo 🌐 Accessibility Information
echo ===========================

echo Application URLs:
echo   📱 Main Application: http://localhost
echo   🖥️  Frontend Direct:  http://localhost:3000
echo   🔌 Backend API:      http://localhost:5000/api
echo   📚 API Docs:         http://localhost:5000/api-docs
echo   ❤️  Health Check:    http://localhost:5000/api/health

echo.
echo 🎉 Deployment Verification Complete!
echo ====================================

if %error_count% equ 0 (
    echo 🎊 DEPLOYMENT SUCCESSFUL! All systems operational.
    echo.
    echo 🚁 Your Drone Management System is ready to use!
    echo    Login with: admin@dronemanagement.com / admin123
    echo.
    echo Press any key to open the application in your browser...
    pause >nul
    start http://localhost
) else (
    echo ❌ DEPLOYMENT ISSUES DETECTED - %error_count% errors found
    echo.
    echo 🔧 Troubleshooting:
    echo    1. Check Docker containers: docker-compose -f docker-compose.prod.yml ps
    echo    2. View logs: docker-compose -f docker-compose.prod.yml logs
    echo    3. Restart services: docker-compose -f docker-compose.prod.yml restart
    echo.
    echo Press any key to continue...
    pause >nul
)

exit /b %error_count%