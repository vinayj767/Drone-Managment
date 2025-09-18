import express, { Response } from 'express';
import { Drone } from '../models';
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware';

const router = express.Router();

// Get all drones
router.get('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const drones = await Drone.find().sort({ createdAt: -1 });
    res.json(drones);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch drones' });
  }
});

// Get single drone
router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const drone = await Drone.findById(req.params.id);
    if (!drone) {
      res.status(404).json({ error: 'Drone not found' });
      return;
    }
    res.json(drone);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch drone' });
  }
});

// Create drone (admin only)
router.post('/', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const drone = new Drone(req.body);
    await drone.save();
    res.status(201).json(drone);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create drone' });
  }
});

// Update drone
router.put('/:id', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const drone = await Drone.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!drone) {
      res.status(404).json({ error: 'Drone not found' });
      return;
    }
    
    res.json(drone);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update drone' });
  }
});

// Delete drone (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const drone = await Drone.findByIdAndDelete(req.params.id);
    if (!drone) {
      res.status(404).json({ error: 'Drone not found' });
      return;
    }
    res.json({ message: 'Drone deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete drone' });
  }
});

export default router;