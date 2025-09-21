import express from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { AppError } from '../middleware/errorHandler';
import { validateRequest } from '../utils/validation';
import Joi from 'joi';

const router = express.Router();

// Validation schemas
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

const registerSchema = Joi.object({
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

// Helper function to generate JWT token
const generateToken = (userId: string, role: string): string => {
  const payload = { userId, role };
  const secret = process.env.JWT_SECRET!;
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign(payload, secret, { expiresIn } as any);
};

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: User login
 *     tags: [Authentication]
 */
router.post('/login', validateRequest(loginSchema), async (req, res) => {
  const { email, password } = req.body;

  // Find user with password field
  const user = await User.findOne({ email, isActive: true }).select('+password');
  
  if (!user || !(await user.comparePassword(password))) {
    const error: AppError = new Error('Invalid email or password');
    error.statusCode = 401;
    error.isOperational = true;
    throw error;
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  // Generate JWT token
  const token = generateToken(user._id.toString(), user.role);

  res.json({
    success: true,
    message: 'Login successful',
    token,
    user: user.toJSON()
  });
});

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register new user
 *     tags: [Authentication]
 */
router.post('/register', validateRequest(registerSchema), async (req, res) => {
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

  // Generate JWT token
  const token = generateToken(user._id.toString(), user.role);

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    token,
    user: user.toJSON()
  });
});

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Authentication]
 */
router.get('/me', async (req, res) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    const error: AppError = new Error('Access denied. No token provided.');
    error.statusCode = 401;
    error.isOperational = true;
    throw error;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      const error: AppError = new Error('User not found');
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }

    res.json({
      success: true,
      user: user.toJSON()
    });
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      const authError: AppError = new Error('Invalid token');
      authError.statusCode = 401;
      authError.isOperational = true;
      throw authError;
    }
    throw error;
  }
});

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh JWT token
 *     tags: [Authentication]
 */
router.post('/refresh', async (req, res) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    const error: AppError = new Error('Access denied. No token provided.');
    error.statusCode = 401;
    error.isOperational = true;
    throw error;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const user = await User.findById(decoded.userId);
    
    if (!user || !user.isActive) {
      const error: AppError = new Error('User not found or inactive');
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }

    // Generate new token
    const newToken = generateToken(user._id.toString(), user.role);

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      token: newToken
    });
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      const authError: AppError = new Error('Invalid or expired token');
      authError.statusCode = 401;
      authError.isOperational = true;
      throw authError;
    }
    throw error;
  }
});

export { router as authRoutes };