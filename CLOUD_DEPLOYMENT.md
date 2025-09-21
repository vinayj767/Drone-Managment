# 🚀 Cloud Deployment Guide
## Deploy to Vercel (Frontend) + Railway (Backend) + MongoDB Atlas

This guide will help you deploy your Drone Management System to the cloud with production-ready configuration.

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Vercel        │    │   Railway       │    │  MongoDB Atlas  │
│   (Frontend)    │────│   (Backend)     │────│   (Database)    │
│   Next.js App   │    │   Node.js API   │    │   Cloud DB      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📋 Prerequisites

1. **Accounts Required**:
   - [Vercel Account](https://vercel.com) (Free tier available)
   - [Railway Account](https://railway.app) (Free tier with $5 credit)
   - [MongoDB Atlas Account](https://mongodb.com/cloud/atlas) (Free tier available)
   - GitHub account with your repository

2. **Repository Setup**:
   - Push your code to GitHub repository
   - Ensure all environment files are in `.gitignore`

## 🗄️ Step 1: Setup MongoDB Atlas Database

### 1.1 Create MongoDB Atlas Cluster

1. Go to [MongoDB Atlas](https://mongodb.com/cloud/atlas)
2. Sign up/Login and create a new project
3. Click "Build a Database" → Choose "M0 Sandbox" (Free)
4. Select a cloud provider and region (choose closest to your users)
5. Create cluster (takes 1-3 minutes)

### 1.2 Configure Database Access

1. **Database Access**:
   - Go to "Database Access" in sidebar
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Username: `droneadmin`
   - Generate secure password (save it!)
   - Database User Privileges: "Atlas admin"
   - Add User

2. **Network Access**:
   - Go to "Network Access" in sidebar
   - Click "Add IP Address"
   - Choose "Allow access from anywhere" (0.0.0.0/0)
   - Confirm

### 1.3 Get Connection String

1. Go to "Database" → Click "Connect" on your cluster
2. Choose "Connect your application"
3. Driver: Node.js, Version: 4.1 or later
4. Copy the connection string:
   ```
   mongodb+srv://droneadmin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<password>` with your actual password
6. Add database name: `/dronemanagement` before the `?`

**Final connection string example**:
```
mongodb+srv://droneadmin:yourpassword@cluster0.xxxxx.mongodb.net/dronemanagement?retryWrites=true&w=majority
```

## 🚂 Step 2: Deploy Backend to Railway

### 2.1 Deploy to Railway

1. Go to [Railway](https://railway.app)
2. Sign up/Login with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Railway will auto-detect it's a Node.js project

### 2.2 Configure Backend Service

1. **Set Root Directory**:
   - In Railway dashboard, go to your service
   - Settings → "Root Directory" → Set to `backend`
   - Save

2. **Configure Environment Variables**:
   - Go to "Variables" tab
   - Add these variables one by one:

   ```bash
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=mongodb+srv://droneadmin:yourpassword@cluster0.xxxxx.mongodb.net/dronemanagement?retryWrites=true&w=majority
   JWT_SECRET=your-super-secure-jwt-secret-min-32-chars
   JWT_EXPIRE=7d
   CORS_ORIGIN=https://your-vercel-app.vercel.app
   API_DOCS_ENABLED=true
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

   **Important Notes**:
   - Replace `MONGODB_URI` with your actual Atlas connection string
   - Generate a secure `JWT_SECRET` (minimum 32 characters)
   - `CORS_ORIGIN` will be updated after Vercel deployment

3. **Deploy**:
   - Railway will automatically deploy
   - Wait for build to complete (3-5 minutes)
   - Note your Railway URL: `https://yourapp.railway.app`

### 2.3 Verify Backend Deployment

1. Visit: `https://yourapp.railway.app/api/health`
2. Should return: `{"status": "OK", "timestamp": "..."}`
3. Visit: `https://yourapp.railway.app/api-docs` for API documentation

## 🔺 Step 3: Deploy Frontend to Vercel

### 3.1 Deploy to Vercel

1. Go to [Vercel](https://vercel.com)
2. Sign up/Login with GitHub
3. Click "New Project"
4. Import your GitHub repository
5. **Configure Project**:
   - Framework Preset: Next.js
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

### 3.2 Configure Environment Variables

1. In Vercel dashboard, go to your project
2. Settings → Environment Variables
3. Add these variables:

   ```bash
   NEXT_PUBLIC_API_URL=https://yourapp.railway.app/api
   NEXT_PUBLIC_SOCKET_URL=https://yourapp.railway.app
   ```

   Replace `yourapp.railway.app` with your actual Railway URL

### 3.3 Deploy

1. Click "Deploy"
2. Wait for build (2-3 minutes)
3. Get your Vercel URL: `https://your-project.vercel.app`

## 🔄 Step 4: Update Backend CORS

### 4.1 Update Railway Environment

1. Go back to Railway dashboard
2. Update `CORS_ORIGIN` variable:
   ```
   CORS_ORIGIN=https://your-project.vercel.app
   ```
3. Save (Railway will automatically redeploy)

## ✅ Step 5: Final Verification

### 5.1 Test Your Deployment

1. **Frontend**: Visit `https://your-project.vercel.app`
2. **Backend Health**: Visit `https://yourapp.railway.app/api/health`
3. **API Docs**: Visit `https://yourapp.railway.app/api-docs`

### 5.2 Test Login

1. Go to your Vercel app
2. Try logging in with:
   - Email: `admin@dronemanagement.com`
   - Password: `admin123`

### 5.3 Test Analytics

1. Navigate to Reports/Analytics page
2. Verify data is loading (may show demo data initially)
3. Check browser console for any errors

## 🔧 Configuration Files Created

The deployment includes these configuration files:

### Frontend (`frontend/vercel.json`)
```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "framework": "nextjs",
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://your-backend-url.railway.app/api/:path*"
    }
  ]
}
```

### Backend (`backend/railway.json`)
```json
{
  "build": {
    "command": "npm run build"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "on-failure"
  }
}
```

## 🔒 Security Checklist

- ✅ Environment variables are secure
- ✅ Database has authentication enabled
- ✅ CORS is properly configured
- ✅ JWT secrets are secure (32+ characters)
- ✅ Rate limiting is enabled
- ✅ Security headers are configured

## 📊 Monitoring & Maintenance

### Railway Backend Monitoring
- Monitor logs in Railway dashboard
- Set up alerts for downtime
- Monitor resource usage

### Vercel Frontend Monitoring
- Check Vercel Analytics
- Monitor Core Web Vitals
- Set up error tracking

### MongoDB Atlas Monitoring
- Monitor database performance
- Set up alerts for high usage
- Review slow queries

## 🔄 Update Deployments

### Update Frontend
1. Push changes to GitHub
2. Vercel automatically redeploys

### Update Backend
1. Push changes to GitHub
2. Railway automatically redeploys

### Database Updates
1. Use MongoDB Compass or Atlas UI
2. Run migrations if needed

## 💰 Cost Estimates

### Free Tier Limits:
- **Vercel**: 100GB bandwidth, 6000 build minutes/month
- **Railway**: $5 credit, ~550 hours uptime
- **MongoDB Atlas**: 512MB storage, M0 cluster

### Scaling Costs:
- **Vercel Pro**: $20/month per team member
- **Railway**: Pay-as-you-use after free credit
- **MongoDB Atlas**: M2 cluster ~$9/month

## 🚨 Troubleshooting

### Common Issues:

**Backend not accessible**:
- Check Railway logs for errors
- Verify environment variables
- Check MongoDB connection

**Frontend can't connect to backend**:
- Verify `NEXT_PUBLIC_API_URL` in Vercel
- Check CORS settings in Railway
- Test backend URL directly

**Database connection failed**:
- Verify MongoDB Atlas IP allowlist
- Check connection string format
- Verify database user credentials

**Build failures**:
- Check Node.js version compatibility
- Verify all dependencies are in package.json
- Check for TypeScript errors

## 📞 Support

If you encounter issues:

1. **Railway Support**: [railway.app/help](https://railway.app/help)
2. **Vercel Support**: [vercel.com/support](https://vercel.com/support)
3. **MongoDB Support**: [support.mongodb.com](https://support.mongodb.com)

## 🎉 Deployment Complete!

Your Drone Management System is now live on:

- **Frontend**: `https://your-project.vercel.app`
- **Backend**: `https://yourapp.railway.app`
- **Database**: MongoDB Atlas Cloud

**Default Login**: `admin@dronemanagement.com` / `admin123`

🚁 **Welcome to cloud-deployed drone management!**