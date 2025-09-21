import 'reflect-metadata';
import dotenv from 'dotenv';
import { connectDatabase, disconnectDatabase } from '../config/database';
import { User } from '../models/User';
import { Drone } from '../models/Drone';
import { Mission } from '../models/Mission';
import { Report } from '../models/Report';
import { logger } from '../utils/logger';

dotenv.config();

const seedUsers = async () => {
  logger.info('Seeding users...');
  
  const users = [
    {
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@drone.com',
      password: 'admin123',
      role: 'admin',
      phone: '+1-555-0101',
      isActive: true
    },
    {
      firstName: 'John',
      lastName: 'Pilot',
      email: 'pilot@drone.com',
      password: 'pilot123',
      role: 'pilot',
      phone: '+1-555-0102',
      pilotLicense: 'FAA-107-12345',
      experience: 5,
      specializations: ['infrastructure', 'survey'],
      isActive: true
    },
    {
      firstName: 'Sarah',
      lastName: 'Wilson',
      email: 'sarah.wilson@drone.com',
      password: 'pilot123',
      role: 'pilot',
      phone: '+1-555-0103',
      pilotLicense: 'FAA-107-67890',
      experience: 3,
      specializations: ['environmental', 'inspection'],
      isActive: true
    },
    {
      firstName: 'Mike',
      lastName: 'Johnson',
      email: 'mike.johnson@drone.com',
      password: 'pilot123',
      role: 'pilot',
      phone: '+1-555-0104',
      pilotLicense: 'FAA-107-54321',
      experience: 7,
      specializations: ['commercial', 'inspection'],
      isActive: true
    }
  ];

  for (const userData of users) {
    const existingUser = await User.findOne({ email: userData.email });
    if (!existingUser) {
      const user = new User(userData);
      await user.save();
      logger.info(`Created user: ${userData.email}`);
    }
  }
};

const seedDrones = async () => {
  logger.info('Seeding drones...');
  
  const drones = [
    {
      name: 'SkyMaster Pro X1',
      droneModel: 'Phantom 4 RTK',
      manufacturer: 'DJI',
      serialNumber: 'DJI-P4RTK-001',
      type: 'quadcopter',
      status: 'available',
      batteryLevel: 95,
      flightHours: 150,
      maxFlightTime: 30,
      maxRange: 7000,
      maxAltitude: 120,
      maxSpeed: 15,
      weight: 1391,
      sensors: ['RGB Camera', 'RTK GPS', 'IMU', 'Gimbal'],
      camera: {
        resolution: '4K UHD',
        hasGimbal: true,
        hasZoom: false,
        videoFormats: ['MP4', 'MOV']
      },
      gps: {
        accuracy: 0.1,
        hasRTK: true
      },
      purchaseDate: new Date('2023-01-15'),
      warrantyExpiry: new Date('2025-01-15'),
      nextMaintenanceHours: 200,
      notes: 'High-precision surveying drone with RTK capabilities'
    },
    {
      name: 'AeroScout M600',
      droneModel: 'Matrice 600 Pro',
      manufacturer: 'DJI',
      serialNumber: 'DJI-M600-002',
      type: 'hexacopter',
      status: 'in-mission',
      batteryLevel: 78,
      flightHours: 89,
      maxFlightTime: 35,
      maxRange: 5000,
      maxAltitude: 120,
      maxSpeed: 18,
      weight: 9500,
      sensors: ['RGB Camera', 'Thermal Camera', 'LiDAR', 'GPS'],
      camera: {
        resolution: '4K UHD',
        hasGimbal: true,
        hasZoom: true,
        videoFormats: ['MP4', 'RAW']
      },
      gps: {
        accuracy: 1.0,
        hasRTK: false
      },
      purchaseDate: new Date('2023-03-20'),
      warrantyExpiry: new Date('2025-03-20'),
      nextMaintenanceHours: 150,
      notes: 'Heavy-duty drone for industrial inspections'
    },
    {
      name: 'TerraMapper Elite',
      droneModel: 'ANAFI USA',
      manufacturer: 'Parrot',
      serialNumber: 'PARROT-ANAFI-003',
      type: 'quadcopter',
      status: 'available',
      batteryLevel: 88,
      flightHours: 67,
      maxFlightTime: 32,
      maxRange: 4000,
      maxAltitude: 120,
      maxSpeed: 15,
      weight: 500,
      sensors: ['RGB Camera', 'Thermal Camera', 'GPS'],
      camera: {
        resolution: '4K HDR',
        hasGimbal: true,
        hasZoom: true,
        videoFormats: ['MP4', 'DNG']
      },
      gps: {
        accuracy: 1.5,
        hasRTK: false
      },
      purchaseDate: new Date('2023-05-10'),
      warrantyExpiry: new Date('2025-05-10'),
      nextMaintenanceHours: 180,
      notes: 'Lightweight mapping drone with thermal capabilities'
    },
    {
      name: 'InspectorBot V2',
      droneModel: 'Skydio 2+',
      manufacturer: 'Skydio',
      serialNumber: 'SKYDIO-S2-004',
      type: 'quadcopter',
      status: 'maintenance',
      batteryLevel: 45,
      flightHours: 234,
      maxFlightTime: 27,
      maxRange: 3500,
      maxAltitude: 120,
      maxSpeed: 14,
      weight: 775,
      sensors: ['RGB Camera', 'Obstacle Avoidance', 'GPS'],
      camera: {
        resolution: '4K',
        hasGimbal: true,
        hasZoom: false,
        videoFormats: ['MP4', 'HEVC']
      },
      gps: {
        accuracy: 2.0,
        hasRTK: false
      },
      purchaseDate: new Date('2022-11-30'),
      warrantyExpiry: new Date('2024-11-30'),
      nextMaintenanceHours: 100,
      notes: 'Autonomous inspection drone with AI obstacle avoidance'
    },
    {
      name: 'SurveyMaster Pro',
      droneModel: 'H520E',
      manufacturer: 'Yuneec',
      serialNumber: 'YUNEEC-H520E-005',
      type: 'hexacopter',
      status: 'available',
      batteryLevel: 92,
      flightHours: 112,
      maxFlightTime: 28,
      maxRange: 2000,
      maxAltitude: 120,
      maxSpeed: 12,
      weight: 1800,
      sensors: ['RGB Camera', 'GPS', 'IMU'],
      camera: {
        resolution: '4K',
        hasGimbal: true,
        hasZoom: false,
        videoFormats: ['MP4']
      },
      gps: {
        accuracy: 2.5,
        hasRTK: false
      },
      purchaseDate: new Date('2023-02-14'),
      warrantyExpiry: new Date('2025-02-14'),
      nextMaintenanceHours: 200,
      notes: 'Professional surveying platform with excellent stability'
    },
    {
      name: 'RapidScan X200',
      droneModel: 'EVO II Pro',
      manufacturer: 'Autel',
      serialNumber: 'AUTEL-EVO2-006',
      type: 'quadcopter',
      status: 'offline',
      batteryLevel: 12,
      flightHours: 298,
      maxFlightTime: 40,
      maxRange: 8000,
      maxAltitude: 120,
      maxSpeed: 20,
      weight: 1127,
      sensors: ['RGB Camera', 'GPS', 'IMU'],
      camera: {
        resolution: '6K',
        hasGimbal: true,
        hasZoom: true,
        videoFormats: ['MP4', 'MOV']
      },
      gps: {
        accuracy: 1.0,
        hasRTK: false
      },
      purchaseDate: new Date('2022-08-05'),
      warrantyExpiry: new Date('2024-08-05'),
      nextMaintenanceHours: 50,
      notes: 'High-speed scanning drone with extended range'
    }
  ];

  for (const droneData of drones) {
    const existingDrone = await Drone.findOne({ serialNumber: droneData.serialNumber });
    if (!existingDrone) {
      const drone = new Drone(droneData);
      await drone.save();
      logger.info(`Created drone: ${droneData.name}`);
    }
  }
};

const seedMissions = async () => {
  logger.info('Seeding missions...');
  
  // Get users and drones for references
  const admin = await User.findOne({ email: 'admin@drone.com' });
  const pilot1 = await User.findOne({ email: 'pilot@drone.com' });
  const pilot2 = await User.findOne({ email: 'sarah.wilson@drone.com' });
  const drone1 = await Drone.findOne({ serialNumber: 'DJI-P4RTK-001' });
  const drone2 = await Drone.findOne({ serialNumber: 'DJI-M600-002' });

  if (!admin || !pilot1 || !pilot2 || !drone1 || !drone2) {
    logger.error('Required users or drones not found for seeding missions');
    return;
  }

  const missions = [
    {
      title: 'Central Park Infrastructure Survey',
      description: 'Comprehensive survey of park infrastructure including bridges, pathways, and recreational facilities',
      type: 'survey',
      priority: 'medium',
      status: 'in-progress',
      assignedPilot: pilot1._id,
      assignedDrone: drone2._id,
      surveyArea: {
        type: 'polygon',
        coordinates: [
          { latitude: 40.7829, longitude: -73.9654 },
          { latitude: 40.7849, longitude: -73.9634 },
          { latitude: 40.7869, longitude: -73.9674 },
          { latitude: 40.7849, longitude: -73.9694 }
        ]
      },
      flightPattern: 'grid',
      altitude: 80,
      speed: 8,
      overlap: 80,
      sideOverlap: 60,
      scheduledStart: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      scheduledEnd: new Date(Date.now() + 1 * 60 * 60 * 1000), // 1 hour from now
      actualStart: new Date(Date.now() - 2 * 60 * 60 * 1000),
      progress: 65,
      estimatedDuration: 180,
      estimatedDistance: 2500,
      maxWindSpeed: 12,
      minVisibility: 1000,
      createdBy: admin._id,
      tags: ['infrastructure', 'park', 'survey'],
      notes: 'Focus on bridge conditions and pathway integrity'
    },
    {
      title: 'Brooklyn Bridge Inspection',
      description: 'Detailed structural inspection of Brooklyn Bridge cables and supports',
      type: 'inspection',
      priority: 'high',
      status: 'completed',
      assignedPilot: pilot2._id,
      assignedDrone: drone1._id,
      surveyArea: {
        type: 'rectangle',
        coordinates: [
          { latitude: 40.7061, longitude: -73.9969 },
          { latitude: 40.7071, longitude: -73.9969 },
          { latitude: 40.7071, longitude: -73.9979 },
          { latitude: 40.7061, longitude: -73.9979 }
        ]
      },
      flightPattern: 'perimeter',
      altitude: 60,
      speed: 6,
      overlap: 85,
      sideOverlap: 70,
      scheduledStart: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      scheduledEnd: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
      actualStart: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      actualEnd: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      progress: 100,
      estimatedDuration: 120,
      estimatedDistance: 1200,
      maxWindSpeed: 10,
      minVisibility: 1500,
      createdBy: admin._id,
      tags: ['inspection', 'bridge', 'infrastructure'],
      notes: 'Special attention to cable connections and deck condition'
    },
    {
      title: 'Manhattan Solar Assessment',
      description: 'Rooftop solar panel feasibility assessment for commercial buildings',
      type: 'commercial',
      priority: 'medium',
      status: 'planned',
      assignedPilot: pilot1._id,
      assignedDrone: drone1._id,
      surveyArea: {
        type: 'polygon',
        coordinates: [
          { latitude: 40.7589, longitude: -73.9851 },
          { latitude: 40.7609, longitude: -73.9831 },
          { latitude: 40.7629, longitude: -73.9871 },
          { latitude: 40.7609, longitude: -73.9891 }
        ]
      },
      flightPattern: 'grid',
      altitude: 100,
      speed: 10,
      overlap: 75,
      sideOverlap: 60,
      scheduledStart: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      scheduledEnd: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      progress: 0,
      estimatedDuration: 240,
      estimatedDistance: 3200,
      maxWindSpeed: 15,
      minVisibility: 1000,
      createdBy: admin._id,
      tags: ['commercial', 'solar', 'assessment'],
      notes: 'Document roof conditions, shading, and available space'
    }
  ];

  for (const missionData of missions) {
    const existingMission = await Mission.findOne({ title: missionData.title });
    if (!existingMission) {
      const mission = new Mission(missionData);
      await mission.save();
      logger.info(`Created mission: ${missionData.title}`);
    }
  }
};

const main = async () => {
  try {
    logger.info('🌱 Starting database seeding...');
    
    await connectDatabase();
    
    await seedUsers();
    await seedDrones();
    await seedMissions();
    
    logger.info('✅ Database seeding completed successfully!');
    
    // Display seeded data summary
    const userCount = await User.countDocuments();
    const droneCount = await Drone.countDocuments();
    const missionCount = await Mission.countDocuments();
    
    logger.info(`📊 Seeded data summary:`);
    logger.info(`   👥 Users: ${userCount}`);
    logger.info(`   🚁 Drones: ${droneCount}`);
    logger.info(`   📋 Missions: ${missionCount}`);
    
    logger.info('🔐 Default login credentials:');
    logger.info('   Admin: admin@drone.com / admin123');
    logger.info('   Pilot: pilot@drone.com / pilot123');
    
  } catch (error) {
    logger.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await disconnectDatabase();
    process.exit(0);
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  main();
}