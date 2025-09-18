import express from 'express';
import authRoutes from './auth';
import droneRoutes from './drones';
import missionRoutes from './missions';
import reportRoutes from './reports';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/drones', droneRoutes);
router.use('/missions', missionRoutes);
router.use('/reports', reportRoutes);

export default router;