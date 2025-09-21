# 🚁 Advanced Drone Management System

A comprehensive, full-stack drone fleet management platform built with Next.js 14, TypeScript, Node.js, and MongoDB. Features real-time tracking, mission planning, analytics, live camera feeds, and advanced fleet management capabilities.

![Drone Management System](https://img.shields.io/badge/Version-2.0.0-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-14.2.32-black.svg)
![Node.js](https://img.shields.io/badge/Node.js-20+-green.svg)
![MongoDB](https://img.shields.io/badge/MongoDB-7.0-green.svg)
![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)

## 🌟 Features

### 🎯 Core Management
- **Fleet Management**: Complete drone inventory with real-time status monitoring
- **Mission Planning**: Advanced mission scheduling with route optimization
- **Pilot Management**: User roles, permissions, and team coordination
- **Real-time Analytics**: Comprehensive reporting and data visualization

### 🚀 Advanced Capabilities
- **Live GPS Tracking**: Real-time drone positioning with flight paths
- **Camera Feed Simulation**: Multi-drone video streaming with controls
- **Weather Integration**: Weather-based flight recommendations
- **Alert System**: Battery, geofence, and weather alerts
- **Interactive Maps**: Live tracking with satellite view
- **Advanced Reports**: Flight analytics, utilization metrics, battery stats

### 🔒 Security & Performance
- **JWT Authentication**: Secure user authentication and authorization
- **Role-based Access**: Admin and pilot permission levels
- **Rate Limiting**: API protection and abuse prevention
- **Error Handling**: Comprehensive error management
- **Logging**: Detailed system and audit logs

## 🏗️ Architecture

```
├── Frontend (Next.js 14 + TypeScript)
│   ├── Real-time UI with Framer Motion animations
│   ├── Responsive design with Tailwind CSS
│   ├── Context-based state management
│   └── Socket.IO for real-time updates
├── Backend (Node.js + Express + TypeScript)
│   ├── RESTful API with comprehensive endpoints
│   ├── MongoDB with Mongoose ODM
│   ├── Socket.IO for real-time communication
│   └── Advanced analytics engine
├── Database (MongoDB)
│   ├── Optimized schemas and indexes
│   ├── Aggregation pipelines for analytics
│   └── Geospatial queries for tracking
└── Infrastructure
    ├── Docker containerization
    ├── Nginx reverse proxy
    ├── Redis caching (optional)
    └── Health monitoring
```

## 🚀 Quick Start (Development)

### Prerequisites
- Node.js 20+ 
- MongoDB 7.0+
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/vinayj767/Drone-Managment.git
cd Drone-Managment
```

2. **Setup Backend**
```bash
cd backend
npm install
cp .env.example .env
# Configure your environment variables in .env
npm run dev
```

3. **Setup Frontend**
```bash
cd frontend
npm install
cp .env.local.example .env.local
# Configure your environment variables in .env.local
npm run dev
```

4. **Access the Application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api
- API Documentation: http://localhost:5000/api-docs

### Default Login
- **Email**: admin@dronemanagement.com
- **Password**: admin123

## 🐳 Production Deployment

### Docker Deployment (Recommended)

1. **Clone and configure**
```bash
git clone https://github.com/vinayj767/Drone-Managment.git
cd Drone-Managment
cp .env.prod.example .env.prod
# Edit .env.prod with your production values
```

2. **Deploy with Docker Compose**
```bash
# Linux/Mac
chmod +x scripts/deploy.sh
./scripts/deploy.sh

# Windows
scripts/deploy.bat
```

3. **Access Production Application**
- Application: http://localhost (port 80)
- Direct Frontend: http://localhost:3000
- API: http://localhost:5000/api
- Health Check: http://localhost:5000/api/health

### Manual Production Setup

1. **Build Frontend**
```bash
cd frontend
npm install
npm run build
npm start
```

2. **Build Backend**
```bash
cd backend
npm install
npm run build
npm start
```

3. **Configure Nginx** (recommended)
```bash
sudo cp nginx/nginx.conf /etc/nginx/sites-available/drone-management
sudo ln -s /etc/nginx/sites-available/drone-management /etc/nginx/sites-enabled/
sudo systemctl reload nginx
```

## 📊 API Documentation

### Authentication Endpoints
```
POST /api/auth/login       - User login
POST /api/auth/register    - User registration
GET  /api/auth/me          - Get current user
PUT  /api/auth/profile     - Update user profile
```

### Drone Management
```
GET    /api/drones         - List all drones
POST   /api/drones         - Create new drone
GET    /api/drones/:id     - Get drone details
PUT    /api/drones/:id     - Update drone
DELETE /api/drones/:id     - Delete drone
GET    /api/drones/stats   - Drone statistics
```

### Mission Management
```
GET    /api/missions       - List missions
POST   /api/missions       - Create mission
GET    /api/missions/:id   - Get mission details
PUT    /api/missions/:id   - Update mission
DELETE /api/missions/:id   - Delete mission
POST   /api/missions/:id/start  - Start mission
POST   /api/missions/:id/pause  - Pause mission
POST   /api/missions/:id/stop   - Stop mission
```

### Analytics & Reports
```
GET /api/analytics                 - Comprehensive analytics
GET /api/analytics/flight-hours    - Flight hours breakdown
GET /api/analytics/mission-types   - Mission type statistics
GET /api/analytics/drone-utilization - Drone utilization metrics
GET /api/analytics/battery-stats   - Battery statistics
GET /api/reports                   - Generated reports
POST /api/reports                  - Generate new report
```

### User Management
```
GET    /api/users          - List users (admin only)
POST   /api/users          - Create user (admin only)
PUT    /api/users/:id      - Update user
DELETE /api/users/:id      - Delete user (admin only)
```

## 🛠️ Configuration

### Environment Variables

#### Backend (.env)
```bash
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://localhost:27017/dronemanagement
JWT_SECRET=your-super-secret-key
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:3000
API_DOCS_ENABLED=true
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

#### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

### Database Configuration

The system uses MongoDB with optimized schemas and indexes for performance:

- **Users Collection**: Stores user accounts with role-based permissions
- **Drones Collection**: Complete drone inventory with specifications
- **Missions Collection**: Mission planning and tracking data
- **Reports Collection**: Generated analytics and reports

## 🔧 Development

### Project Structure
```
drone-management/
├── frontend/                 # Next.js frontend application
│   ├── app/                 # App router pages
│   ├── components/          # Reusable UI components
│   ├── contexts/           # React context providers
│   ├── lib/                # Utility libraries
│   └── types/              # TypeScript type definitions
├── backend/                 # Node.js backend API
│   ├── src/
│   │   ├── controllers/    # Route controllers
│   │   ├── models/         # MongoDB models
│   │   ├── routes/         # API route definitions
│   │   ├── middleware/     # Custom middleware
│   │   ├── utils/          # Utility functions
│   │   └── config/         # Configuration files
├── nginx/                  # Nginx configuration
├── scripts/               # Deployment and utility scripts
└── docs/                  # Additional documentation
```

### Available Scripts

#### Frontend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

#### Backend
```bash
npm run dev          # Start development server with nodemon
npm run build        # Build TypeScript to JavaScript
npm run start        # Start production server
npm run test         # Run test suite
npm run lint         # Run ESLint
npm run debug        # Start with debugging enabled
```

## 📈 Monitoring & Logging

### Application Monitoring
- Health check endpoints
- Performance metrics
- Error tracking
- User activity logs

### Infrastructure Monitoring
- Docker container health
- MongoDB performance
- Nginx access logs
- Resource usage monitoring

## 🚀 Deployment with Docker

Run the complete production deployment:

```bash
# Deploy everything with one command
docker-compose -f docker-compose.prod.yml up --build -d

# Check service status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop all services
docker-compose -f docker-compose.prod.yml down
```

## 🔒 Security Features

### Authentication & Authorization
- JWT-based authentication
- Role-based access control (Admin/Pilot)
- Secure password hashing with bcrypt
- Session management

### API Security
- Rate limiting per endpoint
- CORS configuration
- Request validation
- SQL injection prevention
- XSS protection headers

### Infrastructure Security
- Docker security best practices
- Nginx security headers
- Environment variable protection
- Secure default configurations

## 📱 Responsive Design

The application is fully responsive and optimized for:
- **Desktop**: Full-featured dashboard experience
- **Tablet**: Touch-optimized interface
- **Mobile**: Mobile-first responsive design
- **PWA Ready**: Service worker implementation ready

## 🐛 Troubleshooting

### Common Issues

**MongoDB Connection Failed**
```bash
# Check MongoDB status
sudo systemctl status mongod
# Restart MongoDB
sudo systemctl restart mongod
```

**Port Already in Use**
```bash
# Find process using port
lsof -i :3000
# Kill process
kill -9 <PID>
```

**Docker Build Issues**
```bash
# Clean Docker cache
docker system prune -af
# Rebuild without cache
docker-compose build --no-cache
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js Team** for the amazing React framework
- **MongoDB** for the flexible database solution
- **Framer Motion** for smooth animations
- **Tailwind CSS** for utility-first styling
- **Docker** for containerization support

## 📞 Support

For support, email admin@dronemanagement.com or create an issue in the GitHub repository.

## 🗺️ Roadmap

### Version 2.1 (Upcoming)
- [ ] AI-powered route optimization
- [ ] Advanced weather integration
- [ ] Mobile applications (iOS/Android)
- [ ] Real-time collaborative mission planning
- [ ] Advanced 3D visualization
- [ ] Drone swarm coordination

### Version 2.2 (Future)
- [ ] Machine learning analytics
- [ ] Predictive maintenance
- [ ] Blockchain flight logging
- [ ] AR/VR interface integration
- [ ] Advanced geofencing
- [ ] Multi-tenant architecture

---

**Built with ❤️ for the drone community**