import express, { Response } from 'express';
import { Report } from '../models';
import { authenticateToken, AuthRequest } from '../middleware';

const router = express.Router();

// Get all reports
router.get('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const reports = await Report.find()
      .populate('missionId', 'name status')
      .populate('droneId', 'name droneModel')
      .populate('userId', 'username')
      .sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

// Get single report
router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('missionId')
      .populate('droneId')
      .populate('userId', 'username');
    
    if (!report) {
      res.status(404).json({ error: 'Report not found' });
      return;
    }
    
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch report' });
  }
});

// Create report (usually auto-generated)
router.post('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const report = new Report({
      ...req.body,
      userId: req.user?._id
    });
    
    await report.save();
    
    const populatedReport = await Report.findById(report._id)
      .populate('missionId', 'name')
      .populate('droneId', 'name droneModel')
      .populate('userId', 'username');
    
    res.status(201).json(populatedReport);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create report' });
  }
});

export default router;