# Drone Survey Mission Management System

A complete full-stack application for managing drone survey missions with real-time monitoring and fleet management.

## Tech Stack

**Frontend:**
- Next.js 14 with TypeScript
- Tailwind CSS for styling
- Leaflet.js for interactive maps
- Socket.IO for real-time communication
- SWR for data fetching

**Backend:**
- Node.js with Express and TypeScript
- MongoDB Atlas with Mongoose
- JWT authentication
- Socket.IO for WebSocket communication
- Jest for testing

## Features

- 🎯 **Mission Planning**: Create missions by drawing polygons on interactive maps
- 🚁 **Fleet Management**: Manage drone fleet with real-time status monitoring
- 📡 **Real-time Telemetry**: Live drone tracking and mission monitoring via WebSockets
- 📊 **Survey Reports**: Automated report generation after mission completion
- 🔐 **Role-based Authentication**: Admin and operator roles with different permissions
- 📱 **Responsive Design**: Works on desktop and mobile devices

## Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB Atlas account
- Git

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd drone-survey-system
```

2. **Setup Backend**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB connection string and JWT secret
npm run build
npm run dev
```

3. **Setup Frontend**
```bash
cd ../frontend
npm install
cp .env.example .env.local
# Edit .env.local with your backend URL
npm run dev
```

4. **Seed Database (Optional)**
```bash
cd backend
npm run seed
```

### Environment Variables

**Backend (.env)**
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database
JWT_SECRET=your-super-secret-jwt-key
FRONTEND_URL=http://localhost:3000
```

**Frontend (.env.local)**
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Drones
- `GET /api/drones` - Get all drones
- `POST /api/drones` - Create new drone (admin only)
- `PUT /api/drones/:id` - Update drone
- `DELETE /api/drones/:id` - Delete drone (admin only)

### Missions
- `GET /api/missions` - Get all missions
- `POST /api/missions` - Create new mission
- `GET /api/missions/:id` - Get mission details
- `PUT /api/missions/:id` - Update mission
- `DELETE /api/missions/:id` - Delete mission

### Reports
- `GET /api/reports` - Get all reports
- `GET /api/reports/:id` - Get report details

## Deployment

### Backend (Railway)
1. Connect your GitHub repository to Railway
2. Set environment variables in Railway dashboard
3. Deploy automatically on push to main branch

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set `NEXT_PUBLIC_BACKEND_URL` environment variable
3. Deploy automatically on push to main branch

## Local Development with Docker

```bash
# Run with Docker Compose
docker-compose up -d

# Access the application
# Frontend: http://localhost:3000
# Backend: http://localhost:5000
```

## Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## Project Structure

```
drone-survey-system/
├── backend/
│   ├── src/
│   │   ├── models/           # MongoDB models
│   │   ├── routes/           # API routes
│   │   ├── middleware/       # Custom middleware
│   │   ├── services/         # Business logic
│   │   ├── sockets/          # WebSocket handlers
│   │   └── index.ts          # Entry point
│   ├── scripts/
│   │   └── seed.ts           # Database seeding
│   └── __tests__/            # Test files
├── frontend/
│   ├── app/                  # Next.js app directory
│   ├── components/           # Reusable components
│   ├── lib/                  # Utilities and configurations
│   └── types/                # TypeScript type definitions
├── docker-compose.yml
└── README.md
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Live Demo

- **Frontend**: [Deployed on Vercel]
- **Backend**: [Deployed on Railway]

## Support

For support, email support@dronesurveysystem.com or create an issue in this repository.