import express from 'express';
import { Mission } from '../models/Mission';
import { Drone } from '../models/Drone';
import { User } from '../models/User';
import { Report } from '../models/Report';
import { authenticate } from '../middleware/auth';

const router = express.Router();

/**
 * @swagger
 * /api/dashboard/stats:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 */
router.get('/stats', authenticate, async (req, res) => {
  const { user } = req as any;
  
  // Get basic counts
  const [missionStats, droneStats, userStats, reportStats] = await Promise.all([
    Mission.aggregate([
      ...(user.role === 'pilot' ? [{ $match: { assignedPilot: user._id } }] : []),
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]),
    
    user.role === 'admin' ? Drone.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          avgBattery: { $avg: '$batteryLevel' }
        }
      }
    ]) : Promise.resolve([]),
    
    user.role === 'admin' ? User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]) : Promise.resolve([]),
    
    Report.aggregate([
      ...(user.role === 'pilot' ? [{ $match: { generatedBy: user._id } }] : []),
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ])
  ]);

  // Calculate fleet availability for admin
  let fleetAvailability = null;
  if (user.role === 'admin' && droneStats.length > 0) {
    const totalDrones = droneStats.reduce((sum, stat) => sum + stat.count, 0);
    const availableDrones = droneStats.find(stat => stat._id === 'available')?.count || 0;
    fleetAvailability = totalDrones > 0 ? (availableDrones / totalDrones) * 100 : 0;
  }

  res.json({
    success: true,
    data: {
      missions: missionStats,
      drones: droneStats,
      users: userStats,
      reports: reportStats,
      fleetAvailability
    }
  });
});

/**
 * @swagger
 * /api/dashboard/recent-activity:
 *   get:
 *     summary: Get recent activity
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 */
router.get('/recent-activity', authenticate, async (req, res) => {
  const { user } = req as any;
  
  const filter = user.role === 'pilot' ? { assignedPilot: user._id } : {};
  
  const recentMissions = await Mission.find(filter)
    .sort({ updatedAt: -1 })
    .limit(10)
    .populate('assignedPilot', 'firstName lastName')
    .populate('assignedDrone', 'name')
    .select('title status progress updatedAt');

  res.json({
    success: true,
    data: recentMissions
  });
});

export { router as dashboardRoutes };