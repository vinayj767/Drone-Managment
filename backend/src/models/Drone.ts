import mongoose, { Document, Schema } from 'mongoose';

export interface IDrone extends Document {
  _id: string;
  name: string;
  droneModel: string;
  manufacturer: string;
  serialNumber: string;
  type: 'quadcopter' | 'hexacopter' | 'octocopter' | 'fixed-wing';
  status: 'available' | 'in-mission' | 'maintenance' | 'offline' | 'charging';
  batteryLevel: number;
  flightHours: number;
  maxFlightTime: number; // minutes
  maxRange: number; // meters
  maxAltitude: number; // meters
  maxSpeed: number; // m/s
  weight: number; // grams
  sensors: string[];
  camera: {
    resolution: string;
    hasGimbal: boolean;
    hasZoom: boolean;
    videoFormats: string[];
  };
  gps: {
    accuracy: number; // meters
    hasRTK: boolean;
  };
  currentLocation?: {
    latitude: number;
    longitude: number;
    altitude: number;
    timestamp: Date;
  };
  lastMaintenance?: Date;
  nextMaintenanceHours: number;
  maintenanceHistory: Array<{
    date: Date;
    type: string;
    description: string;
    technician: string;
  }>;
  isActive: boolean;
  purchaseDate: Date;
  warrantyExpiry?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const droneSchema = new Schema<IDrone>({
  name: {
    type: String,
    required: [true, 'Drone name is required'],
    trim: true,
    maxlength: [100, 'Drone name cannot be more than 100 characters']
  },
  droneModel: {
    type: String,
    required: [true, 'Drone model is required'],
    trim: true,
    maxlength: [100, 'Model cannot be more than 100 characters']
  },
  manufacturer: {
    type: String,
    required: [true, 'Manufacturer is required'],
    trim: true,
    maxlength: [100, 'Manufacturer cannot be more than 100 characters']
  },
  serialNumber: {
    type: String,
    required: [true, 'Serial number is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  type: {
    type: String,
    enum: ['quadcopter', 'hexacopter', 'octocopter', 'fixed-wing'],
    required: true
  },
  status: {
    type: String,
    enum: ['available', 'in-mission', 'maintenance', 'offline', 'charging'],
    default: 'available'
  },
  batteryLevel: {
    type: Number,
    min: [0, 'Battery level cannot be negative'],
    max: [100, 'Battery level cannot be more than 100%'],
    default: 100
  },
  flightHours: {
    type: Number,
    min: [0, 'Flight hours cannot be negative'],
    default: 0
  },
  maxFlightTime: {
    type: Number,
    required: [true, 'Max flight time is required'],
    min: [1, 'Max flight time must be at least 1 minute']
  },
  maxRange: {
    type: Number,
    required: [true, 'Max range is required'],
    min: [100, 'Max range must be at least 100 meters']
  },
  maxAltitude: {
    type: Number,
    required: [true, 'Max altitude is required'],
    min: [10, 'Max altitude must be at least 10 meters']
  },
  maxSpeed: {
    type: Number,
    required: [true, 'Max speed is required'],
    min: [1, 'Max speed must be at least 1 m/s']
  },
  weight: {
    type: Number,
    required: [true, 'Weight is required'],
    min: [100, 'Weight must be at least 100 grams']
  },
  sensors: [{
    type: String,
    trim: true
  }],
  camera: {
    resolution: {
      type: String,
      required: true,
      trim: true
    },
    hasGimbal: {
      type: Boolean,
      default: false
    },
    hasZoom: {
      type: Boolean,
      default: false
    },
    videoFormats: [{
      type: String,
      trim: true
    }]
  },
  gps: {
    accuracy: {
      type: Number,
      required: true,
      min: [0.1, 'GPS accuracy must be at least 0.1 meters']
    },
    hasRTK: {
      type: Boolean,
      default: false
    }
  },
  currentLocation: {
    latitude: {
      type: Number,
      min: [-90, 'Latitude must be between -90 and 90'],
      max: [90, 'Latitude must be between -90 and 90']
    },
    longitude: {
      type: Number,
      min: [-180, 'Longitude must be between -180 and 180'],
      max: [180, 'Longitude must be between -180 and 180']
    },
    altitude: {
      type: Number,
      min: [0, 'Altitude cannot be negative']
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  lastMaintenance: {
    type: Date,
    default: null
  },
  nextMaintenanceHours: {
    type: Number,
    default: 100,
    min: [1, 'Next maintenance hours must be at least 1']
  },
  maintenanceHistory: [{
    date: {
      type: Date,
      required: true
    },
    type: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    technician: {
      type: String,
      required: true,
      trim: true
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  purchaseDate: {
    type: Date,
    required: true
  },
  warrantyExpiry: {
    type: Date,
    default: null
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot be more than 1000 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
droneSchema.index({ status: 1 });
droneSchema.index({ isActive: 1 });
droneSchema.index({ manufacturer: 1, droneModel: 1 });

// Virtual for health status
droneSchema.virtual('healthStatus').get(function(this: IDrone) {
  const batteryHealth = this.batteryLevel;
  const maintenanceNeeded = this.flightHours >= this.nextMaintenanceHours;
  
  if (maintenanceNeeded) return 'maintenance-required';
  if (batteryHealth < 20) return 'low-battery';
  if (batteryHealth < 50) return 'caution';
  return 'excellent';
});

// Virtual for next maintenance in hours
droneSchema.virtual('hoursUntilMaintenance').get(function(this: IDrone) {
  return Math.max(0, this.nextMaintenanceHours - this.flightHours);
});

export const Drone = mongoose.model<IDrone>('Drone', droneSchema);