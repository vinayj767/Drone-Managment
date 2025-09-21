# Quick Deploy Commands

## 🚀 Ready-to-Use Commands

Once you have your accounts set up, use these commands to quickly deploy:

### 1. Prepare for Deployment
```bash
# Windows
scripts\prepare-cloud-deployment.bat

# Linux/Mac  
chmod +x scripts/prepare-cloud-deployment.sh
./scripts/prepare-cloud-deployment.sh
```

### 2. Push to GitHub
```bash
git add .
git commit -m "feat: add cloud deployment configuration"
git push origin main
```

### 3. Environment Variables for Railway (Backend)
```bash
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dronemanagement?retryWrites=true&w=majority
JWT_SECRET=your-32-character-minimum-secret-key
JWT_EXPIRE=7d
CORS_ORIGIN=https://your-vercel-app.vercel.app
API_DOCS_ENABLED=true
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 4. Environment Variables for Vercel (Frontend)
```bash
NEXT_PUBLIC_API_URL=https://your-railway-app.railway.app/api
NEXT_PUBLIC_SOCKET_URL=https://your-railway-app.railway.app
```

### 5. Test Your Deployment
```bash
# Test backend health
curl https://your-railway-app.railway.app/api/health

# Test frontend
curl https://your-vercel-app.vercel.app
```

## 🔗 Quick Links

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Railway Dashboard**: https://railway.app/dashboard  
- **MongoDB Atlas**: https://cloud.mongodb.com
- **GitHub Repository**: https://github.com/vinayj767/Drone-Managment

## ⚡ One-Line Deploy Commands

### MongoDB Atlas Connection String Template:
```
mongodb+srv://droneadmin:PASSWORD@cluster0.XXXXX.mongodb.net/dronemanagement?retryWrites=true&w=majority
```

### Generate Secure JWT Secret:
```bash
# Linux/Mac
openssl rand -base64 32

# Windows PowerShell
[System.Web.Security.Membership]::GeneratePassword(32, 0)

# Online Generator
# https://generate-secret.vercel.app/32
```

## 🎯 Deployment Checklist

- [ ] MongoDB Atlas cluster created
- [ ] Database user configured  
- [ ] Railway backend deployed
- [ ] Vercel frontend deployed
- [ ] Environment variables configured
- [ ] CORS updated with frontend URL
- [ ] Health checks passing
- [ ] Login functionality tested

## 🏁 Final URLs

After deployment, you'll have:

- **Live App**: `https://YOUR_PROJECT.vercel.app`
- **API**: `https://YOUR_APP.railway.app/api`
- **API Docs**: `https://YOUR_APP.railway.app/api-docs`
- **Health**: `https://YOUR_APP.railway.app/api/health`

**Default Login**: admin@dronemanagement.com / admin123

🎉 **Your drone management system is now live in the cloud!**