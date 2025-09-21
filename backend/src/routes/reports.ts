import express from 'express';
import { Report } from '../models/Report';
import { Mission } from '../models/Mission';
import { authenticate, authorize } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { validateRequest, validateQuery, validateParams } from '../utils/validation';
import Joi from 'joi';

const router = express.Router();

// Get reports with filtering and pagination
router.get('/', authenticate, validateQuery(Joi.object({
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(100).default(10),
  search: Joi.string().optional(),
  status: Joi.string().valid('draft', 'pending-review', 'approved', 'rejected').optional(),
  missionId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).optional()
})), async (req, res) => {
  const { page, limit, search, status, missionId } = req.query as any;
  const { user } = req as any;
  
  const filter: any = {};
  
  // Pilots can only see their own reports
  if (user.role === 'pilot') {
    filter.generatedBy = user._id;
  }
  
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { summary: { $regex: search, $options: 'i' } }
    ];
  }
  if (status) filter.status = status;
  if (missionId) filter.missionId = missionId;

  const skip = (page - 1) * limit;

  const [reports, total] = await Promise.all([
    Report.find(filter)
      .sort({ generatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('missionId', 'title type')
      .populate('generatedBy', 'firstName lastName')
      .populate('reviewedBy', 'firstName lastName'),
    Report.countDocuments(filter)
  ]);

  res.json({
    success: true,
    data: reports,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

// Get single report
router.get('/:id', authenticate, validateParams(Joi.object({ 
  id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required() 
})), async (req, res) => {
  const { user } = req as any;
  const report = await Report.findById(req.params.id)
    .populate('missionId')
    .populate('generatedBy', 'firstName lastName')
    .populate('reviewedBy', 'firstName lastName');
  
  if (!report) {
    const error: AppError = new Error('Report not found');
    error.statusCode = 404;
    error.isOperational = true;
    throw error;
  }

  // Check permissions
  if (user.role === 'pilot' && report.generatedBy._id.toString() !== user._id.toString()) {
    const error: AppError = new Error('Access denied');
    error.statusCode = 403;
    error.isOperational = true;
    throw error;
  }

  res.json({
    success: true,
    data: report
  });
});

// Create report
router.post('/', authenticate, async (req, res) => {
  const { user } = req as any;
  
  // Verify mission exists and user has access
  const mission = await Mission.findById(req.body.missionId);
  if (!mission) {
    const error: AppError = new Error('Mission not found');
    error.statusCode = 404;
    error.isOperational = true;
    throw error;
  }

  if (user.role === 'pilot' && mission.assignedPilot.toString() !== user._id.toString()) {
    const error: AppError = new Error('Access denied');
    error.statusCode = 403;
    error.isOperational = true;
    throw error;
  }

  const report = new Report({
    ...req.body,
    generatedBy: user._id
  });

  await report.save();

  // Update mission with report ID
  mission.reportId = report._id as any;
  await mission.save();

  res.status(201).json({
    success: true,
    message: 'Report created successfully',
    data: report
  });
});

export { router as reportRoutes };