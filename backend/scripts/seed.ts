import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User, Drone, Mission } from '../src/models';

// Load environment variables
dotenv.config();

const seedDatabase = async (): Promise<void> => {
  try {
    // Connect to database
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MONGO_URI environment variable is not defined');
    }

    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Drone.deleteMany({});
    await Mission.deleteMany({});
    console.log('Cleared existing data');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = new User({
      username: 'admin',
      email: 'admin@dronesystem.com',
      password: adminPassword,
      role: 'admin'
    });
    await admin.save();

    // Create operator user
    const operatorPassword = await bcrypt.hash('operator123', 10);
    const operator = new User({
      username: 'operator',
      email: 'operator@dronesystem.com',
      password: operatorPassword,
      role: 'operator'
    });
    await operator.save();

    console.log('Created users');

    // Create sample drones
    const drones = [
      {
        name: 'DJI Phantom 4 Pro',
        droneModel: 'Phantom 4 Pro',
        serialNumber: 'DJI-001',
        status: 'available',
        batteryLevel: 85,
        currentLocation: {
          latitude: 37.7749,
          longitude: -122.4194
        },
        maxSpeed: 72,
        maxAltitude: 6000,
        flightTime: 30
      },
      {
        name: 'DJI Mavic Air 2',
        droneModel: 'Mavic Air 2',
        serialNumber: 'DJI-002',
        status: 'available',
        batteryLevel: 92,
        currentLocation: {
          latitude: 37.7849,
          longitude: -122.4094
        },
        maxSpeed: 68,
        maxAltitude: 5000,
        flightTime: 34
      },
      {
        name: 'Autel EVO II',
        droneModel: 'EVO II',
        serialNumber: 'AUT-001',
        status: 'maintenance',
        batteryLevel: 45,
        currentLocation: {
          latitude: 37.7649,
          longitude: -122.4294
        },
        maxSpeed: 65,
        maxAltitude: 5500,
        flightTime: 40
      },
      {
        name: 'Parrot Anafi',
        droneModel: 'Anafi',
        serialNumber: 'PAR-001',
        status: 'available',
        batteryLevel: 78,
        currentLocation: {
          latitude: 37.7549,
          longitude: -122.4394
        },
        maxSpeed: 55,
        maxAltitude: 4500,
        flightTime: 25
      }
    ];

    const createdDrones = await Drone.insertMany(drones);
    console.log('Created drones');

    // Create sample missions
    const missions = [
      {
        name: 'Golden Gate Park Survey',
        description: 'Aerial survey of Golden Gate Park for vegetation analysis',
        droneId: createdDrones[0]._id,
        userId: admin._id,
        waypoints: [
          { latitude: 37.7694, longitude: -122.4862, altitude: 100, order: 0 },
          { latitude: 37.7704, longitude: -122.4852, altitude: 100, order: 1 },
          { latitude: 37.7714, longitude: -122.4842, altitude: 100, order: 2 },
          { latitude: 37.7724, longitude: -122.4832, altitude: 100, order: 3 }
        ],
        polygon: {
          type: 'Polygon',
          coordinates: [[
            [-122.4862, 37.7694],
            [-122.4852, 37.7704],
            [-122.4842, 37.7714],
            [-122.4832, 37.7724],
            [-122.4862, 37.7694]
          ]]
        },
        altitude: 100,
        speed: 25,
        overlap: 70,
        status: 'planned',
        estimatedDuration: 25
      },
      {
        name: 'Marina District Inspection',
        description: 'Infrastructure inspection of Marina District buildings',
        droneId: createdDrones[1]._id,
        userId: operator._id,
        waypoints: [
          { latitude: 37.8044, longitude: -122.4324, altitude: 80, order: 0 },
          { latitude: 37.8054, longitude: -122.4314, altitude: 80, order: 1 },
          { latitude: 37.8064, longitude: -122.4304, altitude: 80, order: 2 }
        ],
        polygon: {
          type: 'Polygon',
          coordinates: [[
            [-122.4324, 37.8044],
            [-122.4314, 37.8054],
            [-122.4304, 37.8064],
            [-122.4324, 37.8044]
          ]]
        },
        altitude: 80,
        speed: 30,
        overlap: 65,
        status: 'completed',
        estimatedDuration: 15,
        startTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        endTime: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
        progress: 100
      }
    ];

    await Mission.insertMany(missions);
    console.log('Created missions');

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📋 Test Accounts:');
    console.log('Admin: username=admin, password=admin123');
    console.log('Operator: username=operator, password=operator123');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();