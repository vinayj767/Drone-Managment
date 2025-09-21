import express from 'express';
import { Drone } from '../models/Drone';
import { authenticate, authorize } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { validateRequest, validateQuery, validateParams } from '../utils/validation';
import Joi from 'joi';

const router = express.Router();

// Validation schemas
const createDroneSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  droneModel: Joi.string().min(2).max(100).required(),
  manufacturer: Joi.string().min(2).max(100).required(),
  serialNumber: Joi.string().min(3).max(50).required(),
  type: Joi.string().valid('quadcopter', 'hexacopter', 'octocopter', 'fixed-wing').required(),
  maxFlightTime: Joi.number().min(1).required(),
  maxRange: Joi.number().min(100).required(),
  maxAltitude: Joi.number().min(10).required(),
  maxSpeed: Joi.number().min(1).required(),
  weight: Joi.number().min(100).required(),
  sensors: Joi.array().items(Joi.string()).default([]),
  camera: Joi.object({
    resolution: Joi.string().required(),
    hasGimbal: Joi.boolean().default(false),
    hasZoom: Joi.boolean().default(false),
    videoFormats: Joi.array().items(Joi.string()).default([])
  }).required(),
  gps: Joi.object({
    accuracy: Joi.number().min(0.1).required(),
    hasRTK: Joi.boolean().default(false)
  }).required(),
  purchaseDate: Joi.date().required(),
  warrantyExpiry: Joi.date().optional(),
  notes: Joi.string().max(1000).optional()
});

const updateDroneSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  droneModel: Joi.string().min(2).max(100).optional(),
  manufacturer: Joi.string().min(2).max(100).optional(),
  type: Joi.string().valid('quadcopter', 'hexacopter', 'octocopter', 'fixed-wing').optional(),
  status: Joi.string().valid('available', 'in-mission', 'maintenance', 'offline', 'charging').optional(),
  batteryLevel: Joi.number().min(0).max(100).optional(),
  maxFlightTime: Joi.number().min(1).optional(),
  maxRange: Joi.number().min(100).optional(),
  maxAltitude: Joi.number().min(10).optional(),
  maxSpeed: Joi.number().min(1).optional(),
  weight: Joi.number().min(100).optional(),
  sensors: Joi.array().items(Joi.string()).optional(),
  camera: Joi.object({
    resolution: Joi.string().optional(),
    hasGimbal: Joi.boolean().optional(),
    hasZoom: Joi.boolean().optional(),
    videoFormats: Joi.array().items(Joi.string()).optional()
  }).optional(),
  gps: Joi.object({
    accuracy: Joi.number().min(0.1).optional(),
    hasRTK: Joi.boolean().optional()
  }).optional(),
  currentLocation: Joi.object({
    latitude: Joi.number().min(-90).max(90).required(),
    longitude: Joi.number().min(-180).max(180).required(),
    altitude: Joi.number().min(0).required()
  }).optional(),
  lastMaintenance: Joi.date().optional(),
  nextMaintenanceHours: Joi.number().min(1).optional(),
  isActive: Joi.boolean().optional(),
  warrantyExpiry: Joi.date().optional(),
  notes: Joi.string().max(1000).optional()
});

const maintenanceSchema = Joi.object({
  type: Joi.string().required(),
  description: Joi.string().required(),
  technician: Joi.string().required()
});

const querySchema = Joi.object({
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(100).default(10),
  search: Joi.string().optional(),
  status: Joi.string().valid('available', 'in-mission', 'maintenance', 'offline', 'charging').optional(),
  type: Joi.string().valid('quadcopter', 'hexacopter', 'octocopter', 'fixed-wing').optional(),
  manufacturer: Joi.string().optional(),
  isActive: Joi.boolean().optional(),
  sortBy: Joi.string().valid('name', 'droneModel', 'manufacturer', 'batteryLevel', 'flightHours', 'createdAt').default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

const paramsSchema = Joi.object({
  id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required()
});

/**
 * @swagger
 * /api/drones:
 *   get:
 *     summary: Get all drones
 *     tags: [Drones]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', authenticate, validateQuery(querySchema), async (req, res) => {
  const { page, limit, search, status, type, manufacturer, isActive, sortBy, sortOrder } = req.query as any;
  
  // Build filter object
  const filter: any = {};
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { droneModel: { $regex: search, $options: 'i' } },
      { manufacturer: { $regex: search, $options: 'i' } },
      { serialNumber: { $regex: search, $options: 'i' } }
    ];
  }
  if (status) filter.status = status;
  if (type) filter.type = type;
  if (manufacturer) filter.manufacturer = { $regex: manufacturer, $options: 'i' };
  if (isActive !== undefined) filter.isActive = isActive;

  // Build sort object
  const sort: any = {};
  sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

  // Calculate pagination
  const skip = (page - 1) * limit;

  // Execute query
  const [drones, total] = await Promise.all([
    Drone.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit),
    Drone.countDocuments(filter)
  ]);

  res.json({
    success: true,
    data: drones,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1
    }
  });
});

/**
 * @swagger
 * /api/drones/{id}:
 *   get:
 *     summary: Get drone by ID
 *     tags: [Drones]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', authenticate, validateParams(paramsSchema), async (req, res) => {
  const drone = await Drone.findById(req.params.id);
  
  if (!drone) {
    const error: AppError = new Error('Drone not found');
    error.statusCode = 404;
    error.isOperational = true;
    throw error;
  }

  res.json({
    success: true,
    data: drone
  });
});

/**
 * @swagger
 * /api/drones:
 *   post:
 *     summary: Create new drone (Admin only)
 *     tags: [Drones]
 *     security:
 *       - bearerAuth: []
 */
router.post('/', authenticate, authorize('admin'), validateRequest(createDroneSchema), async (req, res) => {
  const { serialNumber } = req.body;

  // Check if drone with serial number already exists
  const existingDrone = await Drone.findOne({ serialNumber });
  if (existingDrone) {
    const error: AppError = new Error('Drone with this serial number already exists');
    error.statusCode = 409;
    error.isOperational = true;
    throw error;
  }

  // Create new drone
  const drone = new Drone(req.body);
  await drone.save();

  res.status(201).json({
    success: true,
    message: 'Drone created successfully',
    data: drone
  });
});

/**
 * @swagger
 * /api/drones/{id}:
 *   put:
 *     summary: Update drone
 *     tags: [Drones]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id', authenticate, authorize('admin'), validateParams(paramsSchema), validateRequest(updateDroneSchema), async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  // Check if serial number is being changed and already exists
  if (updates.serialNumber) {
    const existingDrone = await Drone.findOne({ serialNumber: updates.serialNumber, _id: { $ne: id } });
    if (existingDrone) {
      const error: AppError = new Error('Serial number already exists');
      error.statusCode = 409;
      error.isOperational = true;
      throw error;
    }
  }

  const drone = await Drone.findByIdAndUpdate(id, updates, { 
    new: true, 
    runValidators: true 
  });

  if (!drone) {
    const error: AppError = new Error('Drone not found');
    error.statusCode = 404;
    error.isOperational = true;
    throw error;
  }

  res.json({
    success: true,
    message: 'Drone updated successfully',
    data: drone
  });
});

/**
 * @swagger
 * /api/drones/{id}:
 *   delete:
 *     summary: Delete drone (Admin only)
 *     tags: [Drones]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', authenticate, authorize('admin'), validateParams(paramsSchema), async (req, res) => {
  const { id } = req.params;

  const drone = await Drone.findById(id);
  
  if (!drone) {
    const error: AppError = new Error('Drone not found');
    error.statusCode = 404;
    error.isOperational = true;
    throw error;
  }

  // Soft delete by setting isActive to false
  drone.isActive = false;
  await drone.save();

  res.json({
    success: true,
    message: 'Drone deleted successfully'
  });
});

/**
 * @swagger
 * /api/drones/{id}/maintenance:
 *   post:
 *     summary: Add maintenance record (Admin only)
 *     tags: [Drones]
 *     security:
 *       - bearerAuth: []
 */
router.post('/:id/maintenance', 
  authenticate, 
  authorize('admin'), 
  validateParams(paramsSchema), 
  validateRequest(maintenanceSchema), 
  async (req, res) => {
    const { id } = req.params;
    const { type, description, technician } = req.body;

    const drone = await Drone.findById(id);
    
    if (!drone) {
      const error: AppError = new Error('Drone not found');
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }

    // Add maintenance record
    drone.maintenanceHistory.push({
      date: new Date(),
      type,
      description,
      technician
    });

    // Update maintenance fields
    drone.lastMaintenance = new Date();
    drone.flightHours = 0; // Reset flight hours after maintenance
    drone.status = 'available'; // Make available after maintenance

    await drone.save();

    res.json({
      success: true,
      message: 'Maintenance record added successfully',
      data: drone
    });
  }
);

/**
 * @swagger
 * /api/drones/{id}/status:
 *   patch:
 *     summary: Update drone status
 *     tags: [Drones]
 *     security:
 *       - bearerAuth: []
 */
router.patch('/:id/status', authenticate, validateParams(paramsSchema), async (req, res) => {
  const { id } = req.params;
  const { status, batteryLevel, currentLocation } = req.body;

  const drone = await Drone.findById(id);
  
  if (!drone) {
    const error: AppError = new Error('Drone not found');
    error.statusCode = 404;
    error.isOperational = true;
    throw error;
  }

  // Update status and related fields
  if (status) drone.status = status;
  if (batteryLevel !== undefined) drone.batteryLevel = batteryLevel;
  if (currentLocation) {
    drone.currentLocation = {
      ...currentLocation,
      timestamp: new Date()
    };
  }

  await drone.save();

  res.json({
    success: true,
    message: 'Drone status updated successfully',
    data: drone
  });
});

/**
 * @swagger
 * /api/drones/available:
 *   get:
 *     summary: Get available drones
 *     tags: [Drones]
 *     security:
 *       - bearerAuth: []
 */
router.get('/status/available', authenticate, async (req, res) => {
  const availableDrones = await Drone.find({ 
    status: 'available', 
    isActive: true,
    batteryLevel: { $gte: 20 } // At least 20% battery
  }).sort({ batteryLevel: -1 });

  res.json({
    success: true,
    data: availableDrones
  });
});

/**
 * @swagger
 * /api/drones/stats:
 *   get:
 *     summary: Get drone fleet statistics
 *     tags: [Drones]
 *     security:
 *       - bearerAuth: []
 */
router.get('/fleet/stats', authenticate, async (req, res) => {
  const stats = await Drone.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        avgBattery: { $avg: '$batteryLevel' },
        totalFlightHours: { $sum: '$flightHours' }
      }
    }
  ]);

  const totalDrones = await Drone.countDocuments({ isActive: true });
  const maintenanceNeeded = await Drone.countDocuments({ 
    isActive: true,
    $expr: { $gte: ['$flightHours', '$nextMaintenanceHours'] }
  });

  res.json({
    success: true,
    data: {
      totalDrones,
      maintenanceNeeded,
      statusBreakdown: stats,
      fleetAvailability: ((stats.find(s => s._id === 'available')?.count || 0) / totalDrones) * 100
    }
  });
});

export { router as droneRoutes };