import express from 'express';
import { Mission } from '../models/Mission';
import { Drone } from '../models/Drone';
import { User } from '../models/User';
import { authenticate, authorize } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { validateRequest, validateQuery, validateParams } from '../utils/validation';
import Joi from 'joi';

const router = express.Router();

// Validation schemas
const createMissionSchema = Joi.object({
  title: Joi.string().min(3).max(200).required(),
  description: Joi.string().min(10).max(2000).required(),
  type: Joi.string().valid('survey', 'inspection', 'monitoring', 'emergency', 'commercial').required(),
  priority: Joi.string().valid('low', 'medium', 'high', 'critical').default('medium'),
  assignedPilot: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
  assignedDrone: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
  surveyArea: Joi.object({
    type: Joi.string().valid('polygon', 'circle', 'rectangle').required(),
    coordinates: Joi.array().items(Joi.object({
      latitude: Joi.number().min(-90).max(90).required(),
      longitude: Joi.number().min(-180).max(180).required()
    })).required(),
    center: Joi.object({
      latitude: Joi.number().min(-90).max(90),
      longitude: Joi.number().min(-180).max(180)
    }).optional(),
    radius: Joi.number().min(1).optional()
  }).required(),
  flightPattern: Joi.string().valid('manual', 'grid', 'crosshatch', 'perimeter', 'spiral').default('grid'),
  altitude: Joi.number().min(10).max(120).required(),
  speed: Joi.number().min(1).max(15).required(),
  overlap: Joi.number().min(0).max(100).default(80),
  sideOverlap: Joi.number().min(0).max(100).default(60),
  scheduledStart: Joi.date().required(),
  scheduledEnd: Joi.date().required(),
  maxWindSpeed: Joi.number().min(0).default(10),
  minVisibility: Joi.number().min(0).default(1000),
  tags: Joi.array().items(Joi.string()).default([]),
  notes: Joi.string().max(2000).optional()
});

const querySchema = Joi.object({
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(100).default(10),
  search: Joi.string().optional(),
  status: Joi.string().valid('planned', 'in-progress', 'paused', 'completed', 'aborted', 'failed').optional(),
  type: Joi.string().valid('survey', 'inspection', 'monitoring', 'emergency', 'commercial').optional(),
  priority: Joi.string().valid('low', 'medium', 'high', 'critical').optional(),
  assignedPilot: Joi.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
  sortBy: Joi.string().valid('title', 'type', 'priority', 'status', 'scheduledStart', 'createdAt').default('scheduledStart'),
  sortOrder: Joi.string().valid('asc', 'desc').default('asc')
});

/**
 * @swagger
 * /api/missions:
 *   get:
 *     summary: Get all missions
 *     tags: [Missions]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', authenticate, validateQuery(querySchema), async (req, res) => {
  const { page, limit, search, status, type, priority, assignedPilot, sortBy, sortOrder } = req.query as any;
  const { user } = req as any;
  
  // Build filter object
  const filter: any = {};
  
  // Pilots can only see their assigned missions
  if (user.role === 'pilot') {
    filter.assignedPilot = user._id;
  } else if (assignedPilot) {
    filter.assignedPilot = assignedPilot;
  }
  
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search, 'i')] } }
    ];
  }
  if (status) filter.status = status;
  if (type) filter.type = type;
  if (priority) filter.priority = priority;

  // Build sort object
  const sort: any = {};
  sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

  // Calculate pagination
  const skip = (page - 1) * limit;

  // Execute query
  const [missions, total] = await Promise.all([
    Mission.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('assignedPilot', 'firstName lastName email')
      .populate('assignedDrone', 'name droneModel manufacturer status batteryLevel')
      .populate('createdBy', 'firstName lastName'),
    Mission.countDocuments(filter)
  ]);

  res.json({
    success: true,
    data: missions,
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
 * /api/missions/{id}:
 *   get:
 *     summary: Get mission by ID
 *     tags: [Missions]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', authenticate, validateParams(Joi.object({ id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required() })), async (req, res) => {
  const { user } = req as any;
  const mission = await Mission.findById(req.params.id)
    .populate('assignedPilot', 'firstName lastName email pilotLicense')
    .populate('assignedDrone', 'name droneModel manufacturer status batteryLevel currentLocation')
    .populate('createdBy', 'firstName lastName')
    .populate('reportId');
  
  if (!mission) {
    const error: AppError = new Error('Mission not found');
    error.statusCode = 404;
    error.isOperational = true;
    throw error;
  }

  // Check if pilot can access this mission
  if (user.role === 'pilot' && mission.assignedPilot._id.toString() !== user._id.toString()) {
    const error: AppError = new Error('Access denied. You can only view your assigned missions.');
    error.statusCode = 403;
    error.isOperational = true;
    throw error;
  }

  res.json({
    success: true,
    data: mission
  });
});

/**
 * @swagger
 * /api/missions:
 *   post:
 *     summary: Create new mission (Admin only)
 *     tags: [Missions]
 *     security:
 *       - bearerAuth: []
 */
router.post('/', authenticate, authorize('admin'), validateRequest(createMissionSchema), async (req, res) => {
  const { user } = req as any;
  
  // Verify pilot and drone exist and are available
  const [pilot, drone] = await Promise.all([
    User.findById(req.body.assignedPilot),
    Drone.findById(req.body.assignedDrone)
  ]);

  if (!pilot || pilot.role !== 'pilot' || !pilot.isActive) {
    const error: AppError = new Error('Invalid or inactive pilot selected');
    error.statusCode = 400;
    error.isOperational = true;
    throw error;
  }

  if (!drone || !drone.isActive) {
    const error: AppError = new Error('Invalid or inactive drone selected');
    error.statusCode = 400;
    error.isOperational = true;
    throw error;
  }

  if (drone.status !== 'available') {
    const error: AppError = new Error('Selected drone is not available');
    error.statusCode = 400;
    error.isOperational = true;
    throw error;
  }

  // Calculate estimated duration and distance (simplified calculation)
  const estimatedDuration = Math.ceil(req.body.surveyArea.coordinates.length * 2); // minutes
  const estimatedDistance = req.body.surveyArea.coordinates.length * 100; // meters

  // Create mission
  const mission = new Mission({
    ...req.body,
    estimatedDuration,
    estimatedDistance,
    createdBy: user._id
  });

  await mission.save();

  // Update drone status
  drone.status = 'in-mission';
  await drone.save();

  const populatedMission = await Mission.findById(mission._id)
    .populate('assignedPilot', 'firstName lastName email')
    .populate('assignedDrone', 'name droneModel manufacturer')
    .populate('createdBy', 'firstName lastName');

  res.status(201).json({
    success: true,
    message: 'Mission created successfully',
    data: populatedMission
  });
});

/**
 * @swagger
 * /api/missions/{id}/control:
 *   patch:
 *     summary: Control mission (start, pause, resume, abort)
 *     tags: [Missions]
 *     security:
 *       - bearerAuth: []
 */
router.patch('/:id/control', authenticate, async (req, res) => {
  const { action } = req.body;
  const { user } = req as any;
  const missionId = req.params.id;

  if (!['start', 'pause', 'resume', 'abort', 'complete'].includes(action)) {
    const error: AppError = new Error('Invalid action. Must be start, pause, resume, abort, or complete');
    error.statusCode = 400;
    error.isOperational = true;
    throw error;
  }

  const mission = await Mission.findById(missionId).populate('assignedDrone');
  
  if (!mission) {
    const error: AppError = new Error('Mission not found');
    error.statusCode = 404;
    error.isOperational = true;
    throw error;
  }

  // Check permissions
  if (user.role === 'pilot' && mission.assignedPilot.toString() !== user._id.toString()) {
    const error: AppError = new Error('Access denied. You can only control your assigned missions.');
    error.statusCode = 403;
    error.isOperational = true;
    throw error;
  }

  // Update mission status based on action
  const now = new Date();
  
  switch (action) {
    case 'start':
      if (mission.status !== 'planned') {
        const error: AppError = new Error('Mission can only be started from planned status');
        error.statusCode = 400;
        error.isOperational = true;
        throw error;
      }
      mission.status = 'in-progress';
      mission.actualStart = now;
      break;
      
    case 'pause':
      if (mission.status !== 'in-progress') {
        const error: AppError = new Error('Mission can only be paused when in progress');
        error.statusCode = 400;
        error.isOperational = true;
        throw error;
      }
      mission.status = 'paused';
      break;
      
    case 'resume':
      if (mission.status !== 'paused') {
        const error: AppError = new Error('Mission can only be resumed when paused');
        error.statusCode = 400;
        error.isOperational = true;
        throw error;
      }
      mission.status = 'in-progress';
      break;
      
    case 'abort':
      if (!['planned', 'in-progress', 'paused'].includes(mission.status)) {
        const error: AppError = new Error('Mission can only be aborted when planned, in progress, or paused');
        error.statusCode = 400;
        error.isOperational = true;
        throw error;
      }
      mission.status = 'aborted';
      mission.actualEnd = now;
      // Make drone available again
      if (mission.assignedDrone) {
        await Drone.findByIdAndUpdate(mission.assignedDrone._id, { status: 'available' });
      }
      break;
      
    case 'complete':
      if (mission.status !== 'in-progress') {
        const error: AppError = new Error('Mission can only be completed when in progress');
        error.statusCode = 400;
        error.isOperational = true;
        throw error;
      }
      mission.status = 'completed';
      mission.actualEnd = now;
      mission.progress = 100;
      // Make drone available again
      if (mission.assignedDrone) {
        await Drone.findByIdAndUpdate(mission.assignedDrone._id, { status: 'available' });
      }
      break;
  }

  await mission.save();

  res.json({
    success: true,
    message: `Mission ${action}ed successfully`,
    data: mission
  });
});

export { router as missionRoutes };