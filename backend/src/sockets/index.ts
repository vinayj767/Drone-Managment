import { Server as SocketIOServer } from 'socket.io';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';

export const setupSocketHandlers = (io: SocketIOServer): void => {
  // Authentication middleware for socket connections
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      socket.data.user = decoded;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    const { userId, role } = socket.data.user;
    logger.info(`User connected: ${userId} (${role})`);

    // Join user-specific room
    socket.join(`user_${userId}`);
    
    // Join role-specific room
    socket.join(`role_${role}`);

    // Handle drone telemetry updates (from pilots)
    socket.on('drone-telemetry', (data) => {
      if (role === 'pilot') {
        // Broadcast to all connected clients
        socket.broadcast.emit('drone-telemetry-update', {
          droneId: data.droneId,
          location: data.location,
          batteryLevel: data.batteryLevel,
          status: data.status,
          timestamp: new Date()
        });
        
        logger.info(`Drone telemetry update from pilot ${userId}: ${data.droneId}`);
      }
    });

    // Handle mission progress updates
    socket.on('mission-progress', (data) => {
      if (role === 'pilot') {
        socket.broadcast.emit('mission-progress-update', {
          missionId: data.missionId,
          progress: data.progress,
          currentWaypoint: data.currentWaypoint,
          estimatedTimeRemaining: data.estimatedTimeRemaining,
          timestamp: new Date()
        });
        
        logger.info(`Mission progress update from pilot ${userId}: ${data.missionId}`);
      }
    });

    // Handle mission status changes
    socket.on('mission-status-change', (data) => {
      socket.broadcast.emit('mission-status-update', {
        missionId: data.missionId,
        status: data.status,
        timestamp: new Date()
      });
      
      logger.info(`Mission status change: ${data.missionId} -> ${data.status}`);
    });

    // Handle emergency alerts
    socket.on('emergency-alert', (data) => {
      if (role === 'pilot') {
        // Send to all admins
        io.to('role_admin').emit('emergency-alert', {
          pilotId: userId,
          missionId: data.missionId,
          droneId: data.droneId,
          message: data.message,
          location: data.location,
          severity: data.severity,
          timestamp: new Date()
        });
        
        logger.warn(`Emergency alert from pilot ${userId}: ${data.message}`);
      }
    });

    // Handle real-time notifications
    socket.on('send-notification', (data) => {
      if (role === 'admin') {
        // Send to specific user or broadcast
        if (data.targetUserId) {
          io.to(`user_${data.targetUserId}`).emit('notification', {
            message: data.message,
            type: data.type,
            timestamp: new Date()
          });
        } else {
          socket.broadcast.emit('notification', {
            message: data.message,
            type: data.type,
            timestamp: new Date()
          });
        }
      }
    });

    // Handle drone command (admin only)
    socket.on('drone-command', (data) => {
      if (role === 'admin') {
        // Send command to the pilot assigned to the drone
        socket.broadcast.emit('drone-command-issued', {
          droneId: data.droneId,
          command: data.command,
          parameters: data.parameters,
          timestamp: new Date()
        });
        
        logger.info(`Drone command issued by admin ${userId}: ${data.command} for drone ${data.droneId}`);
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      logger.info(`User disconnected: ${userId}`);
    });
  });

  // Periodic health check broadcast
  setInterval(() => {
    io.emit('system-heartbeat', {
      timestamp: new Date(),
      connectedClients: io.engine.clientsCount
    });
  }, 30000); // Every 30 seconds
};