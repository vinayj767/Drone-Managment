# 🚁 Drone Survey Management System

A comprehensive full-stack drone survey management platform built with Next.js, Node.js, and MongoDB. This system provides complete drone fleet management, mission planning, real-time monitoring, and detailed reporting capabilities.

## 🌟 **Live Demo**

### 🚀 **Access the Application**
**Frontend**: https://drone-survey-frontend-56bx46t14-vinay-jains-projects-d5706ff2.vercel.app

**Backend API**: https://drone-production-b2a3.up.railway.app

### 🔐 **Test Accounts**
| Role | Username | Password | Access Level |
|------|----------|----------|--------------|
| **Admin** | `admin` | `admin123` | Full system access |
| **Admin** | `sarah_manager` | `manager123` | Management access |
| **Operator** | `operator` | `operator123` | Mission operations |
| **Operator** | `john_pilot` | `pilot123` | Flight operations |

---

## 📋 **Features Overview**

### ✅ **Core Capabilities**
- **Authentication & Authorization**: JWT-based security with role management
- **Dashboard Analytics**: Real-time KPIs and system overview
- **Drone Fleet Management**: 6 professional drones with live status tracking
- **Mission Planning**: Interactive map-based planning with waypoints
- **Real-time Monitoring**: WebSocket telemetry and live updates
- **Comprehensive Reporting**: Automated flight reports and analytics
- **Cloud Deployment**: Production-ready infrastructure

### 🗄️ **Database Content**
- **4 User Accounts**: Admin and operator roles
- **6 Drone Fleet**: Various models with realistic specifications
- **6 Mission Scenarios**: Covering infrastructure, environmental, and commercial surveys
- **4 Detailed Reports**: Complete flight analytics and findings

---

## 🛠️ **Technology Stack**

### Frontend (Next.js 14)
- **Framework**: Next.js with App Router and TypeScript
- **Styling**: Tailwind CSS for responsive design
- **Maps**: Leaflet.js for interactive mapping
- **Real-time**: Socket.IO for live updates
- **Deployment**: Vercel

### Backend (Node.js)
- **API**: Express.js with TypeScript
- **Database**: MongoDB Atlas with Mongoose
- **Authentication**: JWT with bcrypt
- **Real-time**: Socket.IO server
- **Deployment**: Railway

### Infrastructure
- **Database**: MongoDB Atlas (Cloud)
- **Frontend Hosting**: Vercel
- **Backend Hosting**: Railway
- **Version Control**: GitHub

---

## 🚀 **Quick Start**

### 1. **Access the Live System**
Visit: https://drone-survey-frontend-56bx46t14-vinay-jains-projects-d5706ff2.vercel.app

### 2. **Login**
Use any of the test accounts above (recommended: `admin` / `admin123`)

### 3. **Explore Features**
- **Dashboard**: System overview and analytics
- **Drones**: Fleet management and status
- **Missions**: Survey planning and tracking
- **Reports**: Flight analytics and findings

---

## 💡 **Key Features Demonstration**

### 🏢 **Sample Missions**
1. **Central Park Infrastructure Survey** (In-Progress)
   - Bridge and pathway inspection
   - 65% complete with real-time progress

2. **Brooklyn Bridge Inspection** (Completed)
   - Structural assessment with detailed findings
   - Complete flight report available

3. **Manhattan Solar Assessment** (Planned)
   - Rooftop solar feasibility survey
   - Ready for execution

4. **Hudson River Environmental** (Completed)
   - Waterfront monitoring with environmental data
   - Comprehensive report with recommendations

### 🚁 **Drone Fleet**
- **SkyMaster Pro X1** (DJI Phantom 4 RTK) - Available, 95% battery
- **AeroScout M600** (DJI Matrice 600 Pro) - In-Mission, 78% battery
- **TerraMapper Elite** (Parrot ANAFI USA) - Available, 88% battery
- **InspectorBot V2** (Skydio 2+) - Maintenance, 45% battery
- **SurveyMaster Pro** (Yuneec H520E) - Available, 92% battery
- **RapidScan X200** (Autel EVO II Pro) - Offline, 12% battery

---

## 📊 **System Capabilities**

### Authentication & Security
- ✅ JWT-based authentication
- ✅ Role-based access control (Admin/Operator)
- ✅ Secure password hashing
- ✅ Protected API endpoints

### Dashboard & Analytics
- ✅ Real-time system overview
- ✅ Mission statistics and KPIs
- ✅ Drone fleet status monitoring
- ✅ Performance metrics

### Mission Management
- ✅ Interactive map planning (Leaflet.js)
- ✅ Waypoint creation and editing
- ✅ Survey area polygon definition
- ✅ Flight parameter configuration
- ✅ Progress tracking and status updates

### Real-time Monitoring
- ✅ WebSocket-based live updates
- ✅ Drone position tracking
- ✅ Battery level monitoring
- ✅ Flight progress visualization

### Reporting System
- ✅ Automated report generation
- ✅ Flight metrics and analytics
- ✅ Performance tracking
- ✅ Success/failure analysis

---

## 🔧 **Local Development Setup**

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Git

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Configure environment variables
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Database Seeding
```bash
cd backend
npm run seed
```

---

## 🌐 **API Documentation**

### Base URL
```
https://drone-production-b2a3.up.railway.app/api
```

### Key Endpoints
- `POST /auth/login` - User authentication
- `GET /drones` - Fetch drone fleet
- `GET /missions` - Fetch missions
- `POST /missions` - Create new mission
- `GET /reports` - Fetch mission reports

### WebSocket Events
- `drone-telemetry` - Real-time drone data
- `mission-progress` - Live mission updates

---

## 📱 **Mobile Responsiveness**

The system is fully responsive and optimized for:
- Desktop computers
- Tablets
- Mobile devices
- Touch interfaces

---

## 🔍 **Testing & Quality**

### Data Quality
- ✅ Realistic drone specifications
- ✅ Geographic accuracy (NYC coordinates)
- ✅ Comprehensive mission scenarios
- ✅ Professional reporting standards

### Performance
- ✅ Optimized database queries
- ✅ Efficient API responses
- ✅ Fast map rendering
- ✅ Real-time communication

### Security
- ✅ Input validation
- ✅ Authentication required
- ✅ CORS configuration
- ✅ Error handling

---

## 📈 **Production Features**

### Scalability
- Cloud-hosted database (MongoDB Atlas)
- Serverless frontend (Vercel)
- Container-ready backend (Railway)
- WebSocket support for real-time features

### Monitoring
- Error logging and handling
- Performance metrics
- Real-time system status
- Automated health checks

### Deployment
- CI/CD pipeline ready
- Environment-based configuration
- Docker containerization
- Production optimization

---

## 🎯 **Use Cases**

### Infrastructure Inspection
- Bridge and building assessment
- Utility line monitoring
- Construction progress tracking

### Environmental Monitoring
- Coastal and waterfront surveys
- Vegetation analysis
- Pollution monitoring

### Commercial Services
- Real estate surveys
- Solar panel assessments
- Traffic analysis

### Security Operations
- Perimeter monitoring
- Emergency response
- Crowd management

---

## 📄 **Documentation**

- **Feature Report**: [FEATURE_REPORT.md](./FEATURE_REPORT.md) - Comprehensive feature overview
- **API Documentation**: Available at backend endpoints
- **Database Schema**: MongoDB models in `/backend/src/models`

---

## 🤝 **Contributing**

This is a demonstration project showcasing professional drone survey management capabilities. The system is production-ready and demonstrates industry-standard implementation practices.

---

## 📞 **Support**

For questions about this demonstration system, please refer to the comprehensive documentation and feature reports included in this repository.

---

## 🏆 **Project Status**

**✅ COMPLETE & DEPLOYED**

This drone survey management system is fully functional, deployed, and ready for demonstration. All major features are implemented with quality data and professional-grade capabilities.

**Start exploring**: https://drone-survey-frontend-56bx46t14-vinay-jains-projects-d5706ff2.vercel.app

Login with `admin` / `admin123` to access the full system!