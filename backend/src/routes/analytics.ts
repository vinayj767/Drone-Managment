import express from 'express'
import { Request, Response } from 'express'
import { Mission, IMission } from '../models/Mission'
import { Drone, IDrone } from '../models/Drone'
import { User, IUser } from '../models/User'
import { authenticate } from '../middleware/auth'

const router = express.Router()

interface AnalyticsData {
  totalFlights: number
  totalFlightTime: number
  averageFlightTime: number
  successRate: number
  dronesActive: number
  pilotsActive: number
  topPilot: string
  topDrone: string
  recentMissions: any[]
  flightHours: { month: string; hours: number }[]
  missionTypes: { type: string; count: number }[]
  droneUtilization: { drone: string; hours: number }[]
}

// Get comprehensive analytics
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const { timeRange = '30d' } = req.query
    
    // Calculate date range
    const now = new Date()
    let startDate = new Date()
    
    switch (timeRange) {
      case '7d':
        startDate.setDate(now.getDate() - 7)
        break
      case '30d':
        startDate.setDate(now.getDate() - 30)
        break
      case '90d':
        startDate.setDate(now.getDate() - 90)
        break
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1)
        break
      default:
        startDate.setDate(now.getDate() - 30)
    }

    // Get missions within date range
    const missions = await Mission.find({
      createdAt: { $gte: startDate, $lte: now }
    }).populate('assignedDrone').populate('assignedPilot')

    // Get all drones and users
    const drones = await Drone.find()
    const users = await User.find({ role: 'pilot' })

    // Calculate metrics
    const totalFlights = missions.length
    const completedMissions = missions.filter((m: any) => m.status === 'completed')
    const totalFlightTime = completedMissions.reduce((sum: number, mission: any) => {
      return sum + (mission.estimatedDuration || 30) // Default 30 minutes if not specified
    }, 0)
    
    const averageFlightTime = totalFlights > 0 ? totalFlightTime / totalFlights : 0
    const successRate = totalFlights > 0 ? (completedMissions.length / totalFlights) * 100 : 0
    const dronesActive = drones.filter((d: any) => d.status === 'available' || d.status === 'in-mission').length
    const pilotsActive = users.filter((u: any) => u.isActive).length

    // Find top pilot and drone
    const pilotStats: { [key: string]: number } = {}
    const droneStats: { [key: string]: number } = {}
    
    missions.forEach((mission: any) => {
      if (mission.assignedPilot) {
        const pilotId = typeof mission.assignedPilot === 'object' 
          ? mission.assignedPilot._id.toString() 
          : mission.assignedPilot
        pilotStats[pilotId] = (pilotStats[pilotId] || 0) + 1
      }
      
      if (mission.assignedDrone) {
        const droneId = typeof mission.assignedDrone === 'object' 
          ? mission.assignedDrone._id.toString() 
          : mission.assignedDrone
        droneStats[droneId] = (droneStats[droneId] || 0) + 1
      }
    })

    const topPilotId = Object.keys(pilotStats).reduce((a, b) => 
      pilotStats[a] > pilotStats[b] ? a : b, Object.keys(pilotStats)[0]
    )
    const topDroneId = Object.keys(droneStats).reduce((a, b) => 
      droneStats[a] > droneStats[b] ? a : b, Object.keys(droneStats)[0]
    )

    const topPilot = topPilotId ? users.find((u: any) => u._id.toString() === topPilotId)?.firstName + ' ' + users.find((u: any) => u._id.toString() === topPilotId)?.lastName || 'Unknown' : 'No data'
    const topDrone = topDroneId ? drones.find((d: any) => d._id.toString() === topDroneId)?.name || 'Unknown' : 'No data'

    // Generate flight hours by month (last 6 months)
    const flightHours = []
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date()
      monthDate.setMonth(monthDate.getMonth() - i)
      const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1)
      const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0)
      
      const monthMissions = missions.filter((m: any) => 
        m.createdAt >= monthStart && m.createdAt <= monthEnd && m.status === 'completed'
      )
      
      const monthHours = monthMissions.reduce((sum: number, mission: any) => 
        sum + (mission.estimatedDuration || 30), 0
      ) / 60 // Convert to hours
      
      flightHours.push({
        month: monthDate.toLocaleDateString('en-US', { month: 'short' }),
        hours: Math.round(monthHours)
      })
    }

    // Mission types distribution
    const missionTypeCounts: { [key: string]: number } = {}
    missions.forEach((mission: any) => {
      missionTypeCounts[mission.type] = (missionTypeCounts[mission.type] || 0) + 1
    })

    const missionTypes = Object.entries(missionTypeCounts).map(([type, count]) => ({
      type: type.charAt(0).toUpperCase() + type.slice(1),
      count
    }))

    // Drone utilization
    const droneUtilization = Object.entries(droneStats)
      .map(([droneId, count]) => {
        const drone = drones.find((d: any) => d._id.toString() === droneId)
        return {
          drone: drone?.name || 'Unknown',
          hours: Math.round((count * averageFlightTime) / 60) // Convert to hours
        }
      })
      .sort((a, b) => b.hours - a.hours)
      .slice(0, 5) // Top 5 drones

    const analytics: AnalyticsData = {
      totalFlights,
      totalFlightTime,
      averageFlightTime: Math.round(averageFlightTime * 10) / 10,
      successRate: Math.round(successRate * 10) / 10,
      dronesActive,
      pilotsActive,
      topPilot,
      topDrone,
      recentMissions: missions.slice(0, 10),
      flightHours,
      missionTypes,
      droneUtilization
    }

    res.json({
      success: true,
      data: analytics
    })
  } catch (error) {
    console.error('Analytics error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics data'
    })
  }
})

// Get flight hours breakdown
router.get('/flight-hours', authenticate, async (req: Request, res: Response) => {
  try {
    const { timeRange = '30d' } = req.query
    const now = new Date()
    let startDate = new Date()
    
    switch (timeRange) {
      case '7d':
        startDate.setDate(now.getDate() - 7)
        break
      case '30d':
        startDate.setDate(now.getDate() - 30)
        break
      case '90d':
        startDate.setDate(now.getDate() - 90)
        break
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1)
        break
    }

    const missions = await Mission.find({
      createdAt: { $gte: startDate, $lte: now },
      status: 'completed'
    })

    const dailyHours = missions.reduce((acc: any, mission: any) => {
      const date = mission.createdAt.toDateString()
      acc[date] = (acc[date] || 0) + (mission.estimatedDuration || 30) / 60
      return acc
    }, {} as { [key: string]: number })

    res.json({
      success: true,
      data: Object.entries(dailyHours).map(([date, hours]) => ({
        date,
        hours: Math.round((hours as number) * 10) / 10
      }))
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch flight hours data'
    })
  }
})

// Get mission type statistics
router.get('/mission-types', authenticate, async (req: Request, res: Response) => {
  try {
    const { timeRange = '30d' } = req.query
    const now = new Date()
    let startDate = new Date()
    
    switch (timeRange) {
      case '7d':
        startDate.setDate(now.getDate() - 7)
        break
      case '30d':
        startDate.setDate(now.getDate() - 30)
        break
      case '90d':
        startDate.setDate(now.getDate() - 90)
        break
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1)
        break
    }

    const missions = await Mission.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: now }
        }
      },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          successRate: {
            $avg: {
              $cond: [{ $eq: ['$status', 'completed'] }, 1, 0]
            }
          }
        }
      }
    ])

    res.json({
      success: true,
      data: missions.map((m: any) => ({
        type: m._id,
        count: m.count,
        successRate: Math.round(m.successRate * 100)
      }))
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch mission type statistics'
    })
  }
})

// Get drone utilization
router.get('/drone-utilization', authenticate, async (req: Request, res: Response) => {
  try {
    const { timeRange = '30d' } = req.query
    const now = new Date()
    let startDate = new Date()
    
    switch (timeRange) {
      case '7d':
        startDate.setDate(now.getDate() - 7)
        break
      case '30d':
        startDate.setDate(now.getDate() - 30)
        break
      case '90d':
        startDate.setDate(now.getDate() - 90)
        break
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1)
        break
    }

    const utilization = await Mission.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: now },
          assignedDrone: { $exists: true }
        }
      },
      {
        $lookup: {
          from: 'drones',
          localField: 'assignedDrone',
          foreignField: '_id',
          as: 'drone'
        }
      },
      {
        $unwind: '$drone'
      },
      {
        $group: {
          _id: '$assignedDrone',
          droneName: { $first: '$drone.name' },
          totalMissions: { $sum: 1 },
          totalHours: { $sum: { $ifNull: ['$estimatedDuration', 30] } },
          completedMissions: {
            $sum: {
              $cond: [{ $eq: ['$status', 'completed'] }, 1, 0]
            }
          }
        }
      },
      {
        $sort: { totalHours: -1 }
      }
    ])

    res.json({
      success: true,
      data: utilization.map((u: any) => ({
        droneId: u._id,
        droneName: u.droneName,
        totalMissions: u.totalMissions,
        totalHours: Math.round(u.totalHours / 60 * 10) / 10,
        completedMissions: u.completedMissions,
        utilization: u.totalMissions > 0 ? Math.round((u.completedMissions / u.totalMissions) * 100) : 0
      }))
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch drone utilization data'
    })
  }
})

// Get battery statistics
router.get('/battery-stats', authenticate, async (req: Request, res: Response) => {
  try {
    const drones = await Drone.find()
    
    const batteryStats = {
      average: Math.round(drones.reduce((sum: number, drone: any) => sum + (drone.batteryLevel || 0), 0) / drones.length),
      low: drones.filter((d: any) => (d.batteryLevel || 0) < 20).length,
      medium: drones.filter((d: any) => (d.batteryLevel || 0) >= 20 && (d.batteryLevel || 0) < 50).length,
      good: drones.filter((d: any) => (d.batteryLevel || 0) >= 50 && (d.batteryLevel || 0) < 80).length,
      excellent: drones.filter((d: any) => (d.batteryLevel || 0) >= 80).length,
      distribution: drones.map((drone: any) => ({
        name: drone.name,
        battery: drone.batteryLevel || 0,
        status: drone.status
      }))
    }

    res.json({
      success: true,
      data: batteryStats
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch battery statistics'
    })
  }
})

export default router