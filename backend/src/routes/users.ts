import express from 'express';
import { User } from '../models/User';
import { authenticate, authorize } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { validateRequest, validateQuery, validateParams } from '../utils/validation';
import Joi from 'joi';

const router = express.Router();

// Validation schemas
const createUserSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).required(),
  lastName: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('admin', 'pilot').default('pilot'),
  phone: Joi.string().pattern(/^\+?[\d\s\-\(\)]+$/).optional(),
  pilotLicense: Joi.string().when('role', {
    is: 'pilot',
    then: Joi.required(),
    otherwise: Joi.optional()
  }),
  experience: Joi.number().min(0).max(50).default(0),
  specializations: Joi.array().items(
    Joi.string().valid('infrastructure', 'environmental', 'commercial', 'security', 'survey', 'inspection')
  ).optional()
});

const updateUserSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).optional(),
  lastName: Joi.string().min(2).max(50).optional(),
  email: Joi.string().email().optional(),
  phone: Joi.string().pattern(/^\+?[\d\s\-\(\)]+$/).optional(),
  role: Joi.string().valid('admin', 'pilot').optional(),
  pilotLicense: Joi.string().optional(),
  experience: Joi.number().min(0).max(50).optional(),
  specializations: Joi.array().items(
    Joi.string().valid('infrastructure', 'environmental', 'commercial', 'security', 'survey', 'inspection')
  ).optional(),
  isActive: Joi.boolean().optional()
});

const querySchema = Joi.object({
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(100).default(10),
  search: Joi.string().optional(),
  role: Joi.string().valid('admin', 'pilot').optional(),
  isActive: Joi.boolean().optional(),
  sortBy: Joi.string().valid('firstName', 'lastName', 'email', 'createdAt', 'lastLogin').default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

const paramsSchema = Joi.object({
  id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required()
});

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', authenticate, authorize('admin'), validateQuery(querySchema), async (req, res) => {
  const { page, limit, search, role, isActive, sortBy, sortOrder } = req.query as any;
  
  // Build filter object
  const filter: any = {};
  if (search) {
    filter.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }
  if (role) filter.role = role;
  if (isActive !== undefined) filter.isActive = isActive;

  // Build sort object
  const sort: any = {};
  sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

  // Calculate pagination
  const skip = (page - 1) * limit;

  // Execute query
  const [users, total] = await Promise.all([
    User.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('assignedMissions', 'title status'),
    User.countDocuments(filter)
  ]);

  res.json({
    success: true,
    data: users,
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
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', authenticate, validateParams(paramsSchema), async (req, res) => {
  const { id } = req.params;
  const { user: currentUser } = req as any;

  // Check if user can access this profile
  if (currentUser.role !== 'admin' && currentUser._id.toString() !== id) {
    const error: AppError = new Error('Access denied. You can only view your own profile.');
    error.statusCode = 403;
    error.isOperational = true;
    throw error;
  }

  const user = await User.findById(id).populate('assignedMissions', 'title status scheduledStart');
  
  if (!user) {
    const error: AppError = new Error('User not found');
    error.statusCode = 404;
    error.isOperational = true;
    throw error;
  }

  res.json({
    success: true,
    data: user
  });
});

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create new user (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.post('/', authenticate, authorize('admin'), validateRequest(createUserSchema), async (req, res) => {
  const { email } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const error: AppError = new Error('User already exists with this email');
    error.statusCode = 409;
    error.isOperational = true;
    throw error;
  }

  // Create new user
  const user = new User(req.body);
  await user.save();

  res.status(201).json({
    success: true,
    message: 'User created successfully',
    data: user.toJSON()
  });
});

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id', authenticate, validateParams(paramsSchema), validateRequest(updateUserSchema), async (req, res) => {
  const { id } = req.params;
  const { user: currentUser } = req as any;
  const updates = req.body;

  // Check permissions
  if (currentUser.role !== 'admin' && currentUser._id.toString() !== id) {
    const error: AppError = new Error('Access denied. You can only update your own profile.');
    error.statusCode = 403;
    error.isOperational = true;
    throw error;
  }

  // Non-admin users cannot change certain fields
  if (currentUser.role !== 'admin') {
    delete updates.role;
    delete updates.isActive;
  }

  // Check if email is being changed and already exists
  if (updates.email) {
    const existingUser = await User.findOne({ email: updates.email, _id: { $ne: id } });
    if (existingUser) {
      const error: AppError = new Error('Email already exists');
      error.statusCode = 409;
      error.isOperational = true;
      throw error;
    }
  }

  const user = await User.findByIdAndUpdate(id, updates, { 
    new: true, 
    runValidators: true 
  }).populate('assignedMissions', 'title status');

  if (!user) {
    const error: AppError = new Error('User not found');
    error.statusCode = 404;
    error.isOperational = true;
    throw error;
  }

  res.json({
    success: true,
    message: 'User updated successfully',
    data: user
  });
});

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete user (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', authenticate, authorize('admin'), validateParams(paramsSchema), async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id);
  
  if (!user) {
    const error: AppError = new Error('User not found');
    error.statusCode = 404;
    error.isOperational = true;
    throw error;
  }

  // Soft delete by setting isActive to false
  user.isActive = false;
  await user.save();

  res.json({
    success: true,
    message: 'User deleted successfully'
  });
});

/**
 * @swagger
 * /api/users/{id}/assign-missions:
 *   post:
 *     summary: Assign missions to pilot (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.post('/:id/assign-missions', 
  authenticate, 
  authorize('admin'), 
  validateParams(paramsSchema),
  async (req, res) => {
    const { id } = req.params;
    const { missionIds } = req.body;

    if (!Array.isArray(missionIds)) {
      const error: AppError = new Error('missionIds must be an array');
      error.statusCode = 400;
      error.isOperational = true;
      throw error;
    }

    const user = await User.findById(id);
    
    if (!user) {
      const error: AppError = new Error('User not found');
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }

    if (user.role !== 'pilot') {
      const error: AppError = new Error('Can only assign missions to pilots');
      error.statusCode = 400;
      error.isOperational = true;
      throw error;
    }

    // Add new mission IDs to the assigned missions
    const newMissionIds = missionIds.filter((missionId: string) => 
      !user.assignedMissions?.includes(missionId as any)
    );
    
    user.assignedMissions = [...(user.assignedMissions || []), ...newMissionIds];
    await user.save();

    const updatedUser = await User.findById(id).populate('assignedMissions', 'title status scheduledStart');

    res.json({
      success: true,
      message: 'Missions assigned successfully',
      data: updatedUser
    });
  }
);

/**
 * @swagger
 * /api/users/pilots:
 *   get:
 *     summary: Get all pilots
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.get('/role/pilots', authenticate, async (req, res) => {
  const pilots = await User.find({ 
    role: 'pilot', 
    isActive: true 
  }).select('firstName lastName email pilotLicense experience specializations assignedMissions')
    .populate('assignedMissions', 'title status');

  res.json({
    success: true,
    data: pilots
  });
});

export { router as userRoutes };