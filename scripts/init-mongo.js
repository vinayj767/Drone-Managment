// MongoDB initialization script
db = db.getSiblingDB('dronemanagement');

// Create collections and indexes
db.createCollection('users');
db.createCollection('drones');
db.createCollection('missions');
db.createCollection('reports');

// Create indexes for better performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "role": 1 });
db.users.createIndex({ "isActive": 1 });

db.drones.createIndex({ "serialNumber": 1 }, { unique: true });
db.drones.createIndex({ "status": 1 });
db.drones.createIndex({ "batteryLevel": 1 });
db.drones.createIndex({ "currentLocation.coordinates": "2dsphere" });

db.missions.createIndex({ "status": 1 });
db.missions.createIndex({ "type": 1 });
db.missions.createIndex({ "priority": 1 });
db.missions.createIndex({ "assignedDrone": 1 });
db.missions.createIndex({ "assignedPilot": 1 });
db.missions.createIndex({ "scheduledStart": 1 });
db.missions.createIndex({ "createdAt": -1 });

db.reports.createIndex({ "type": 1 });
db.reports.createIndex({ "status": 1 });
db.reports.createIndex({ "createdAt": -1 });

// Create default admin user
db.users.insertOne({
  firstName: "Admin",
  lastName: "User",
  email: "admin@dronemanagement.com",
  password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewcNtxTu5vD.eZn.", // password: admin123
  role: "admin",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
});

print("Database initialized successfully!");