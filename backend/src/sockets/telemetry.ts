import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { Mission, Drone, Report } from '../models';

export class TelemetryService {
  private io: SocketIOServer;
  private activeMissions: Map<string, NodeJS.Timeout> = new Map();

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"]
      }
    });

    this.setupSocketHandlers();
  }

  private setupSocketHandlers(): void {
    this.io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      socket.on('joinMission', (missionId: string) => {
        socket.join(`mission-${missionId}`);
        console.log(`Client ${socket.id} joined mission ${missionId}`);
      });

      socket.on('leaveMission', (missionId: string) => {
        socket.leave(`mission-${missionId}`);
        console.log(`Client ${socket.id} left mission ${missionId}`);
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });
  }

  public async startMissionTelemetry(missionId: string): Promise<void> {
    try {
      const mission = await Mission.findById(missionId).populate('droneId');
      if (!mission || !mission.droneId) {
        return;
      }

      // Clear any existing telemetry for this mission
      this.stopMissionTelemetry(missionId);

      const drone = mission.droneId as any;
      const waypoints = mission.waypoints;
      let currentWaypointIndex = mission.currentWaypoint || 0;
      let currentProgress = mission.progress || 0;

      const simulationInterval = setInterval(async () => {
        try {
          if (currentWaypointIndex >= waypoints.length) {
            // Mission completed
            await this.completeMission(missionId);
            clearInterval(simulationInterval);
            this.activeMissions.delete(missionId);
            return;
          }

          const currentWaypoint = waypoints[currentWaypointIndex];
          const nextWaypoint = waypoints[currentWaypointIndex + 1];

          // Simulate drone movement
          const telemetryData = {
            missionId,
            droneId: drone._id,
            position: {
              latitude: currentWaypoint.latitude,
              longitude: currentWaypoint.longitude,
              altitude: currentWaypoint.altitude
            },
            speed: mission.speed,
            batteryLevel: Math.max(10, drone.batteryLevel - Math.random() * 2),
            progress: Math.min(100, currentProgress + Math.random() * 5),
            currentWaypoint: currentWaypointIndex,
            totalWaypoints: waypoints.length,
            eta: this.calculateETA(mission, currentProgress),
            timestamp: new Date()
          };

          // Update drone location and battery
          await Drone.findByIdAndUpdate(drone._id, {
            currentLocation: {
              latitude: currentWaypoint.latitude,
              longitude: currentWaypoint.longitude
            },
            batteryLevel: telemetryData.batteryLevel
          });

          // Update mission progress
          await Mission.findByIdAndUpdate(missionId, {
            currentWaypoint: currentWaypointIndex,
            progress: telemetryData.progress
          });

          // Emit telemetry data to connected clients
          this.io.to(`mission-${missionId}`).emit('telemetry', telemetryData);

          currentProgress = telemetryData.progress;
          
          // Move to next waypoint after some time
          if (Math.random() > 0.7) {
            currentWaypointIndex++;
          }

        } catch (error) {
          console.error('Error in telemetry simulation:', error);
        }
      }, 2000); // Update every 2 seconds

      this.activeMissions.set(missionId, simulationInterval);
    } catch (error) {
      console.error('Error starting mission telemetry:', error);
    }
  }

  public stopMissionTelemetry(missionId: string): void {
    const interval = this.activeMissions.get(missionId);
    if (interval) {
      clearInterval(interval);
      this.activeMissions.delete(missionId);
    }
  }

  private async completeMission(missionId: string): Promise<void> {
    try {
      const mission = await Mission.findById(missionId).populate('droneId userId');
      if (!mission) return;

      // Update mission status
      await Mission.findByIdAndUpdate(missionId, {
        status: 'completed',
        endTime: new Date(),
        progress: 100
      });

      // Update drone status
      await Drone.findByIdAndUpdate(mission.droneId, {
        status: 'available'
      });

      // Generate report
      const drone = mission.droneId as any;
      const duration = mission.startTime ? 
        (new Date().getTime() - mission.startTime.getTime()) / (1000 * 60) : 
        mission.estimatedDuration;

      const report = new Report({
        missionId: mission._id,
        droneId: drone._id,
        userId: mission.userId,
        duration: Math.round(duration),
        distanceFlown: this.calculateDistance(mission.waypoints),
        areaCovered: this.calculateArea(mission.polygon.coordinates[0]),
        averageSpeed: mission.speed,
        averageAltitude: mission.altitude,
        batteryUsed: 100 - drone.batteryLevel,
        imagesCapture: Math.floor(Math.random() * 100) + 50,
        status: 'success',
        notes: 'Mission completed successfully'
      });

      await report.save();

      // Emit mission completion
      this.io.to(`mission-${missionId}`).emit('missionCompleted', {
        missionId,
        reportId: report._id
      });

    } catch (error) {
      console.error('Error completing mission:', error);
    }
  }

  private calculateETA(mission: any, progress: number): number {
    const remainingProgress = 100 - progress;
    const estimatedTimeRemaining = (mission.estimatedDuration * remainingProgress) / 100;
    return Math.round(estimatedTimeRemaining);
  }

  private calculateDistance(waypoints: any[]): number {
    let totalDistance = 0;
    for (let i = 1; i < waypoints.length; i++) {
      const prev = waypoints[i - 1];
      const curr = waypoints[i];
      totalDistance += this.haversineDistance(
        prev.latitude, prev.longitude,
        curr.latitude, curr.longitude
      );
    }
    return totalDistance;
  }

  private haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private calculateArea(coordinates: number[][]): number {
    // Simple polygon area calculation using shoelace formula
    let area = 0;
    const n = coordinates.length;
    
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      area += coordinates[i][0] * coordinates[j][1];
      area -= coordinates[j][0] * coordinates[i][1];
    }
    
    return Math.abs(area) / 2;
  }
}

export default TelemetryService;