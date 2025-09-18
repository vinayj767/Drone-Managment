import express, { Response } from 'express';
import { Mission, Drone } from '../models';
import { authenticateToken, AuthRequest } from '../middleware';

const router = express.Router();

// Get all missions
router.get('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const missions = await Mission.find()
      .populate('droneId', 'name droneModel status')
      .populate('userId', 'username')
      .sort({ createdAt: -1 });
    res.json(missions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch missions' });
  }
});

// Get single mission
router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const mission = await Mission.findById(req.params.id)
      .populate('droneId')
      .populate('userId', 'username');
    
    if (!mission) {
      res.status(404).json({ error: 'Mission not found' });
      return;
    }
    
    res.json(mission);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch mission' });
  }
});

// Create mission
router.post('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Check if drone is available
    const drone = await Drone.findById(req.body.droneId);
    if (!drone) {
      res.status(404).json({ error: 'Drone not found' });
      return;
    }
    
    if (drone.status !== 'available') {
      res.status(400).json({ error: 'Drone is not available' });
      return;
    }

    const mission = new Mission({
      ...req.body,
      userId: req.user?._id
    });
    
    await mission.save();
    
    // Update drone status
    await Drone.findByIdAndUpdate(req.body.droneId, { status: 'in-mission' });
    
    const populatedMission = await Mission.findById(mission._id)
      .populate('droneId', 'name droneModel')
      .populate('userId', 'username');
    
    res.status(201).json(populatedMission);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create mission' });
  }
});

// Update mission
router.put('/:id', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const mission = await Mission.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('droneId').populate('userId', 'username');
    
    if (!mission) {
      res.status(404).json({ error: 'Mission not found' });
      return;
    }
    
    res.json(mission);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update mission' });
  }
});

// Delete mission
router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const mission = await Mission.findById(req.params.id);
    if (!mission) {
      res.status(404).json({ error: 'Mission not found' });
      return;
    }
    
    // Update drone status back to available if mission is not completed
    if (mission.status !== 'completed') {
      await Drone.findByIdAndUpdate(mission.droneId, { status: 'available' });
    }
    
    await Mission.findByIdAndDelete(req.params.id);
    res.json({ message: 'Mission deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete mission' });
  }
});

// Mission control endpoints
router.post('/:id/start', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const mission = await Mission.findById(req.params.id);
    if (!mission) {
      res.status(404).json({ error: 'Mission not found' });
      return;
    }
    
    mission.status = 'in-progress';
    mission.startTime = new Date();
    await mission.save();
    
    res.json({ message: 'Mission started', mission });
  } catch (error) {
    res.status(500).json({ error: 'Failed to start mission' });
  }
});

router.post('/:id/pause', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const mission = await Mission.findById(req.params.id);
    if (!mission) {
      res.status(404).json({ error: 'Mission not found' });
      return;
    }
    
    mission.status = 'paused';
    await mission.save();
    
    res.json({ message: 'Mission paused', mission });
  } catch (error) {
    res.status(500).json({ error: 'Failed to pause mission' });
  }
});

router.post('/:id/resume', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const mission = await Mission.findById(req.params.id);
    if (!mission) {
      res.status(404).json({ error: 'Mission not found' });
      return;
    }
    
    mission.status = 'in-progress';
    await mission.save();
    
    res.json({ message: 'Mission resumed', mission });
  } catch (error) {
    res.status(500).json({ error: 'Failed to resume mission' });
  }
});

router.post('/:id/abort', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const mission = await Mission.findById(req.params.id);
    if (!mission) {
      res.status(404).json({ error: 'Mission not found' });
      return;
    }
    
    mission.status = 'aborted';
    mission.endTime = new Date();
    await mission.save();
    
    // Update drone status back to available
    await Drone.findByIdAndUpdate(mission.droneId, { status: 'available' });
    
    res.json({ message: 'Mission aborted', mission });
  } catch (error) {
    res.status(500).json({ error: 'Failed to abort mission' });
  }
});

export default router;