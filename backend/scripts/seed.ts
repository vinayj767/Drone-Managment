import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User, Drone, Mission, Report } from '../src/models';

// Load environment variables
dotenv.config();

const seedDatabase = async (): Promise<void> => {
  try {
    // Connect to database
    const mongoUri = process.env.MONGO_URI || 'mongodb+srv://vinayj767:vinayjain@ibm.2jbxbzq.mongodb.net/drone_survey';
    
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB Atlas');

    // Clear existing data
    await User.deleteMany({});
    await Drone.deleteMany({});
    await Mission.deleteMany({});
    await Report.deleteMany({});
    console.log('Cleared existing data');

    // Create Users with comprehensive data
    const salt = await bcrypt.genSalt(10);
    const users = await User.insertMany([
      {
        username: 'admin',
        email: 'admin@dronesurvey.com',
        password: await bcrypt.hash('admin123', salt),
        role: 'admin'
      },
      {
        username: 'operator',
        email: 'operator@dronesurvey.com',
        password: await bcrypt.hash('operator123', salt),
        role: 'operator'
      },
      {
        username: 'john_pilot',
        email: 'john@dronesurvey.com',
        password: await bcrypt.hash('pilot123', salt),
        role: 'operator'
      },
      {
        username: 'sarah_manager',
        email: 'sarah@dronesurvey.com',
        password: await bcrypt.hash('manager123', salt),
        role: 'admin'
      }
    ]);
    console.log('Created users');

    // Create Drones with realistic specifications
    const drones = await Drone.insertMany([
      {
        name: 'SkyMaster Pro X1',
        droneModel: 'DJI Phantom 4 RTK',
        serialNumber: 'DJI-P4RTK-001',
        status: 'available',
        batteryLevel: 95,
        lastMaintenance: new Date('2025-09-10'),
        currentLocation: {
          latitude: 40.7589,
          longitude: -73.9851
        },
        maxSpeed: 50,
        maxAltitude: 6000,
        flightTime: 30
      },
      {
        name: 'AeroScout M600',
        droneModel: 'DJI Matrice 600 Pro',
        serialNumber: 'DJI-M600-002',
        status: 'in-mission',
        batteryLevel: 78,
        lastMaintenance: new Date('2025-09-08'),
        currentLocation: {
          latitude: 40.7505,
          longitude: -73.9934
        },
        maxSpeed: 65,
        maxAltitude: 4500,
        flightTime: 35
      },
      {
        name: 'TerraMapper Elite',
        droneModel: 'Parrot ANAFI USA',
        serialNumber: 'PRT-ANAFI-003',
        status: 'available',
        batteryLevel: 88,
        lastMaintenance: new Date('2025-09-12'),
        currentLocation: {
          latitude: 40.7282,
          longitude: -74.0776
        },
        maxSpeed: 55,
        maxAltitude: 4500,
        flightTime: 32
      },
      {
        name: 'InspectorBot V2',
        droneModel: 'Skydio 2+',
        serialNumber: 'SKY-2P-004',
        status: 'maintenance',
        batteryLevel: 45,
        lastMaintenance: new Date('2025-09-15'),
        currentLocation: {
          latitude: 40.7614,
          longitude: -73.9776
        },
        maxSpeed: 58,
        maxAltitude: 3000,
        flightTime: 27
      },
      {
        name: 'SurveyMaster Pro',
        droneModel: 'Yuneec H520E',
        serialNumber: 'YUN-H520E-005',
        status: 'available',
        batteryLevel: 92,
        lastMaintenance: new Date('2025-09-11'),
        currentLocation: {
          latitude: 40.7411,
          longitude: -74.0018
        },
        maxSpeed: 46,
        maxAltitude: 4000,
        flightTime: 28
      },
      {
        name: 'RapidScan X200',
        droneModel: 'Autel EVO II Pro',
        serialNumber: 'AUT-EVO2P-006',
        status: 'offline',
        batteryLevel: 12,
        lastMaintenance: new Date('2025-09-05'),
        currentLocation: {
          latitude: 40.7831,
          longitude: -73.9712
        },
        maxSpeed: 72,
        maxAltitude: 7000,
        flightTime: 40
      }
    ]);
    console.log('Created drones');

    // Create comprehensive missions with realistic data
    const missions = await Mission.insertMany([
      {
        name: 'Central Park Infrastructure Survey',
        description: 'Comprehensive aerial survey of Central Park infrastructure including bridges, pathways, and recreational facilities',
        droneId: drones[1]._id,
        userId: users[0]._id,
        status: 'in-progress',
        startTime: new Date('2025-09-18T09:00:00Z'),
        estimatedDuration: 180,
        progress: 65,
        waypoints: [
          { latitude: 40.7829, longitude: -73.9654, altitude: 120, order: 0 },
          { latitude: 40.7851, longitude: -73.9656, altitude: 120, order: 1 },
          { latitude: 40.7871, longitude: -73.9640, altitude: 120, order: 2 },
          { latitude: 40.7849, longitude: -73.9624, altitude: 120, order: 3 },
          { latitude: 40.7829, longitude: -73.9654, altitude: 120, order: 4 }
        ],
        polygon: {
          type: 'Polygon',
          coordinates: [[
            [-73.9654, 40.7829],
            [-73.9656, 40.7851],
            [-73.9640, 40.7871],
            [-73.9624, 40.7849],
            [-73.9654, 40.7829]
          ]]
        },
        altitude: 120,
        speed: 15,
        overlap: 80
      },
      {
        name: 'Brooklyn Bridge Inspection',
        description: 'Detailed structural inspection of Brooklyn Bridge cables, towers, and deck condition',
        droneId: drones[0]._id,
        userId: users[2]._id,
        status: 'completed',
        startTime: new Date('2025-09-17T07:30:00Z'),
        endTime: new Date('2025-09-17T10:15:00Z'),
        estimatedDuration: 165,
        progress: 100,
        waypoints: [
          { latitude: 40.7061, longitude: -73.9969, altitude: 150, order: 0 },
          { latitude: 40.7081, longitude: -73.9975, altitude: 150, order: 1 },
          { latitude: 40.7071, longitude: -73.9962, altitude: 200, order: 2 },
          { latitude: 40.7051, longitude: -73.9956, altitude: 150, order: 3 }
        ],
        polygon: {
          type: 'Polygon',
          coordinates: [[
            [-73.9969, 40.7061],
            [-73.9975, 40.7081],
            [-73.9962, 40.7071],
            [-73.9956, 40.7051],
            [-73.9969, 40.7061]
          ]]
        },
        altitude: 150,
        speed: 12,
        overlap: 85
      },
      {
        name: 'Manhattan Rooftop Solar Assessment',
        description: 'Survey of Manhattan building rooftops for solar panel installation feasibility',
        droneId: drones[2]._id,
        userId: users[1]._id,
        status: 'planned',
        startTime: new Date('2025-09-19T08:00:00Z'),
        estimatedDuration: 240,
        progress: 0,
        waypoints: [
          { latitude: 40.7505, longitude: -73.9934, altitude: 200, order: 0 },
          { latitude: 40.7525, longitude: -73.9934, altitude: 200, order: 1 },
          { latitude: 40.7525, longitude: -73.9894, altitude: 200, order: 2 },
          { latitude: 40.7505, longitude: -73.9894, altitude: 200, order: 3 },
          { latitude: 40.7505, longitude: -73.9934, altitude: 200, order: 4 }
        ],
        polygon: {
          type: 'Polygon',
          coordinates: [[
            [-73.9934, 40.7505],
            [-73.9934, 40.7525],
            [-73.9894, 40.7525],
            [-73.9894, 40.7505],
            [-73.9934, 40.7505]
          ]]
        },
        altitude: 200,
        speed: 18,
        overlap: 75
      },
      {
        name: 'Hudson River Waterfront Mapping',
        description: 'Detailed mapping of Hudson River waterfront for environmental monitoring',
        droneId: drones[4]._id,
        userId: users[3]._id,
        status: 'completed',
        startTime: new Date('2025-09-16T06:00:00Z'),
        endTime: new Date('2025-09-16T09:30:00Z'),
        estimatedDuration: 210,
        progress: 100,
        waypoints: [
          { latitude: 40.7589, longitude: -74.0154, altitude: 100, order: 0 },
          { latitude: 40.7689, longitude: -74.0154, altitude: 100, order: 1 },
          { latitude: 40.7689, longitude: -74.0094, altitude: 100, order: 2 },
          { latitude: 40.7589, longitude: -74.0094, altitude: 100, order: 3 },
          { latitude: 40.7589, longitude: -74.0154, altitude: 100, order: 4 }
        ],
        polygon: {
          type: 'Polygon',
          coordinates: [[
            [-74.0154, 40.7589],
            [-74.0154, 40.7689],
            [-74.0094, 40.7689],
            [-74.0094, 40.7589],
            [-74.0154, 40.7589]
          ]]
        },
        altitude: 100,
        speed: 14,
        overlap: 80
      },
      {
        name: 'Times Square Traffic Analysis',
        description: 'Aerial traffic pattern analysis for Times Square area optimization',
        droneId: drones[0]._id,
        userId: users[0]._id,
        status: 'planned',
        startTime: new Date('2025-09-20T11:00:00Z'),
        estimatedDuration: 120,
        progress: 0,
        waypoints: [
          { latitude: 40.7580, longitude: -73.9855, altitude: 300, order: 0 },
          { latitude: 40.7590, longitude: -73.9855, altitude: 300, order: 1 },
          { latitude: 40.7590, longitude: -73.9835, altitude: 300, order: 2 },
          { latitude: 40.7580, longitude: -73.9835, altitude: 300, order: 3 },
          { latitude: 40.7580, longitude: -73.9855, altitude: 300, order: 4 }
        ],
        polygon: {
          type: 'Polygon',
          coordinates: [[
            [-73.9855, 40.7580],
            [-73.9855, 40.7590],
            [-73.9835, 40.7590],
            [-73.9835, 40.7580],
            [-73.9855, 40.7580]
          ]]
        },
        altitude: 300,
        speed: 20,
        overlap: 70
      },
      {
        name: 'Liberty Island Security Survey',
        description: 'Security perimeter survey around Liberty Island for monitoring purposes',
        droneId: drones[2]._id,
        userId: users[1]._id,
        status: 'aborted',
        startTime: new Date('2025-09-15T14:00:00Z'),
        estimatedDuration: 90,
        progress: 25,
        waypoints: [
          { latitude: 40.6892, longitude: -74.0445, altitude: 150, order: 0 },
          { latitude: 40.6902, longitude: -74.0445, altitude: 150, order: 1 },
          { latitude: 40.6902, longitude: -74.0425, altitude: 150, order: 2 },
          { latitude: 40.6892, longitude: -74.0425, altitude: 150, order: 3 },
          { latitude: 40.6892, longitude: -74.0445, altitude: 150, order: 4 }
        ],
        polygon: {
          type: 'Polygon',
          coordinates: [[
            [-74.0445, 40.6892],
            [-74.0445, 40.6902],
            [-74.0425, 40.6902],
            [-74.0425, 40.6892],
            [-74.0445, 40.6892]
          ]]
        },
        altitude: 150,
        speed: 16,
        overlap: 75
      }
    ]);
    console.log('Created missions');

    // Create detailed reports
    const reports = await Report.insertMany([
      {
        missionId: missions[1]._id, // Brooklyn Bridge
        droneId: drones[0]._id,
        userId: users[2]._id,
        duration: 165,
        distanceFlown: 8.5,
        areaCovered: 2.3,
        averageSpeed: 12,
        averageAltitude: 150,
        batteryUsed: 65,
        imagesCapture: 156,
        status: 'success',
        notes: 'Brooklyn Bridge structural inspection completed successfully. Minor cable wear identified on south tower requiring scheduled maintenance within 6 months. Overall infrastructure integrity excellent.',
        generatedAt: new Date('2025-09-17T11:00:00Z')
      },
      {
        missionId: missions[3]._id, // Hudson River
        droneId: drones[4]._id,
        userId: users[3]._id,
        duration: 210,
        distanceFlown: 12.8,
        areaCovered: 5.2,
        averageSpeed: 14,
        averageAltitude: 100,
        batteryUsed: 78,
        imagesCapture: 284,
        status: 'success',
        notes: 'Hudson River waterfront environmental survey completed. Algae bloom detected in northern section requires investigation. Water quality indicators within normal range.',
        generatedAt: new Date('2025-09-16T10:15:00Z')
      },
      {
        missionId: missions[0]._id, // Central Park (in progress)
        droneId: drones[1]._id,
        userId: users[0]._id,
        duration: 120,
        distanceFlown: 5.4,
        areaCovered: 1.8,
        averageSpeed: 15,
        averageAltitude: 120,
        batteryUsed: 45,
        imagesCapture: 198,
        status: 'partial',
        notes: 'Central Park infrastructure survey 65% complete. Bridge structures and recreational facilities assessed. Remaining survey area scheduled for completion.',
        generatedAt: new Date('2025-09-18T12:00:00Z')
      },
      {
        missionId: missions[5]._id, // Liberty Island (aborted)
        droneId: drones[2]._id,
        userId: users[1]._id,
        duration: 22,
        distanceFlown: 1.2,
        areaCovered: 0.3,
        averageSpeed: 16,
        averageAltitude: 150,
        batteryUsed: 18,
        imagesCapture: 45,
        status: 'failed',
        notes: 'Liberty Island security survey aborted due to restricted airspace authorization issue. Mission terminated at 25% completion for safety compliance.',
        generatedAt: new Date('2025-09-15T14:30:00Z')
      }
    ]);
    console.log('Created reports');

    console.log('\n✅ Database seeded successfully with comprehensive data!');
    console.log('\n📋 Test Accounts:');
    console.log('Admin: username=admin, password=admin123');
    console.log('Admin: username=sarah_manager, password=manager123');
    console.log('Operator: username=operator, password=operator123');
    console.log('Operator: username=john_pilot, password=pilot123');
    console.log('\n🚁 Drone Fleet: 6 drones with various statuses and specifications');
    console.log('📋 Missions: 6 missions covering different scenarios (planned, in-progress, completed, aborted)');
    console.log('📊 Reports: 3 detailed reports with findings and recommendations');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();