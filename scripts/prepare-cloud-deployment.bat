@echo off
REM Cloud Deployment Preparation Script for Windows
REM This script prepares your project for cloud deployment

echo 🚀 Preparing Drone Management System for Cloud Deployment
echo ========================================================

REM Check if we're in the right directory
if not exist "CLOUD_DEPLOYMENT.md" (
    echo ✗ Please run this script from the project root directory
    exit /b 1
)

echo ℹ Project structure verification...

REM Check frontend files
if exist "frontend\vercel.json" (
    echo ✓ Vercel configuration found
) else (
    echo ✗ Vercel configuration missing
)

if exist "frontend\.env.production" (
    echo ✓ Frontend production environment template found
) else (
    echo ⚠ Frontend production environment template missing
)

REM Check backend files
if exist "backend\railway.json" (
    echo ✓ Railway configuration found
) else (
    echo ✗ Railway configuration missing
)

if exist "backend\.env.production" (
    echo ✓ Backend production environment template found
) else (
    echo ⚠ Backend production environment template missing
)

echo.
echo ℹ Deployment readiness checklist:

REM Check package.json files
if exist "frontend\package.json" (
    if exist "backend\package.json" (
        echo ✓ Package.json files present
    ) else (
        echo ✗ Backend package.json missing
    )
) else (
    echo ✗ Frontend package.json missing
)

REM Check if .env files are in .gitignore
findstr /C:".env" .gitignore >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Environment files are in .gitignore
) else (
    echo ⚠ Add .env files to .gitignore before deploying
)

echo.
echo ℹ TypeScript compilation check...
cd backend
call npm run typecheck >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Backend TypeScript compiles successfully
) else (
    echo ⚠ Backend TypeScript compilation issues detected
)

cd ..\frontend
call npm run type-check >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Frontend TypeScript compiles successfully
) else (
    echo ⚠ Frontend TypeScript compilation issues detected
)

cd ..

echo.
echo ℹ 🌟 Next Steps for Cloud Deployment:
echo.
echo 1. 📋 Setup Accounts:
echo    • Vercel: https://vercel.com
echo    • Railway: https://railway.app
echo    • MongoDB Atlas: https://mongodb.com/cloud/atlas
echo.
echo 2. 🗄️ Setup Database:
echo    • Create MongoDB Atlas cluster (M0 Free)
echo    • Create database user
echo    • Get connection string
echo.
echo 3. 🚂 Deploy Backend to Railway:
echo    • Connect GitHub repository
echo    • Set root directory: backend
echo    • Configure environment variables
echo.
echo 4. 🔺 Deploy Frontend to Vercel:
echo    • Connect GitHub repository  
echo    • Set root directory: frontend
echo    • Configure environment variables
echo.
echo 5. 📖 Follow the complete guide:
echo    • Read: CLOUD_DEPLOYMENT.md
echo.

echo ✓ Deployment preparation complete!
echo ℹ Your project is ready for cloud deployment. Follow the CLOUD_DEPLOYMENT.md guide for step-by-step instructions.

echo.
echo 🚁 Happy deploying!
echo.
echo Press any key to open the deployment guide...
pause >nul
start CLOUD_DEPLOYMENT.md