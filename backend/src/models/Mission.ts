import mongoose, { Document, Schema } from 'mongoose';

export interface IWaypoint {
  latitude: number;
  longitude: number;
  altitude: number;
  action?: 'hover' | 'photo' | 'video' | 'scan';
  duration?: number; // seconds
  order: number;
}

export interface ISurveyArea {
  type: 'polygon' | 'circle' | 'rectangle';
  coordinates: Array<{
    latitude: number;
    longitude: number;
  }>;
  center?: {
    latitude: number;
    longitude: number;
  };
  radius?: number; // for circle type
}

export interface IMission extends Document {
  _id: string;
  title: string;
  description: string;
  type: 'survey' | 'inspection' | 'monitoring' | 'emergency' | 'commercial';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'planned' | 'in-progress' | 'paused' | 'completed' | 'aborted' | 'failed';
  
  // Assignment
  assignedPilot: mongoose.Types.ObjectId;
  assignedDrone: mongoose.Types.ObjectId;
  
  // Location and flight details
  surveyArea: ISurveyArea;
  waypoints: IWaypoint[];
  flightPattern: 'manual' | 'grid' | 'crosshatch' | 'perimeter' | 'spiral';
  
  // Flight parameters
  altitude: number; // meters
  speed: number; // m/s
  overlap: number; // percentage for photo overlap
  sideOverlap: number; // percentage for side overlap
  estimatedDuration: number; // minutes
  estimatedDistance: number; // meters
  
  // Scheduling
  scheduledStart: Date;
  scheduledEnd: Date;
  actualStart?: Date;
  actualEnd?: Date;
  
  // Progress tracking
  progress: number; // percentage
  currentWaypoint?: number;
  completedWaypoints: number[];
  
  // Weather and conditions
  weatherConditions?: {
    temperature: number;
    humidity: number;
    windSpeed: number;
    windDirection: number;
    visibility: number;
    conditions: string;
  };
  
  // Safety and restrictions
  maxWindSpeed: number; // m/s
  minVisibility: number; // meters
  noFlyZones: Array<{
    name: string;
    coordinates: Array<{
      latitude: number;
      longitude: number;
    }>;
  }>;
  
  // Results and data
  photosCount: number;
  videoDuration: number; // seconds
  dataCollected: number; // MB
  batteryUsed: number; // percentage
  
  // Files and media
  attachments: string[];
  flightLog?: string;
  reportId?: mongoose.Types.ObjectId;
  
  // Metadata
  createdBy: mongoose.Types.ObjectId;
  notes?: string;
  tags: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const waypointSchema = new Schema<IWaypoint>({
  latitude: {
    type: Number,
    required: true,
    min: [-90, 'Latitude must be between -90 and 90'],
    max: [90, 'Latitude must be between -90 and 90']
  },
  longitude: {
    type: Number,
    required: true,
    min: [-180, 'Longitude must be between -180 and 180'],
    max: [180, 'Longitude must be between -180 and 180']
  },
  altitude: {
    type: Number,
    required: true,
    min: [0, 'Altitude cannot be negative']
  },
  action: {
    type: String,
    enum: ['hover', 'photo', 'video', 'scan'],
    default: 'photo'
  },
  duration: {
    type: Number,
    min: [0, 'Duration cannot be negative'],
    default: 0
  },
  order: {
    type: Number,
    required: true,
    min: [1, 'Order must be at least 1']
  }
});

const surveyAreaSchema = new Schema<ISurveyArea>({
  type: {
    type: String,
    enum: ['polygon', 'circle', 'rectangle'],
    required: true
  },
  coordinates: [{
    latitude: {
      type: Number,
      required: true,
      min: [-90, 'Latitude must be between -90 and 90'],
      max: [90, 'Latitude must be between -90 and 90']
    },
    longitude: {
      type: Number,
      required: true,
      min: [-180, 'Longitude must be between -180 and 180'],
      max: [180, 'Longitude must be between -180 and 180']
    }
  }],
  center: {
    latitude: {
      type: Number,
      min: [-90, 'Latitude must be between -90 and 90'],
      max: [90, 'Latitude must be between -90 and 90']
    },
    longitude: {
      type: Number,
      min: [-180, 'Longitude must be between -180 and 180'],
      max: [180, 'Longitude must be between -180 and 180']
    }
  },
  radius: {
    type: Number,
    min: [1, 'Radius must be at least 1 meter']
  }
});

const missionSchema = new Schema<IMission>({
  title: {
    type: String,
    required: [true, 'Mission title is required'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Mission description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot be more than 2000 characters']
  },
  type: {
    type: String,
    enum: ['survey', 'inspection', 'monitoring', 'emergency', 'commercial'],
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['planned', 'in-progress', 'paused', 'completed', 'aborted', 'failed'],
    default: 'planned'
  },
  assignedPilot: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Assigned pilot is required']
  },
  assignedDrone: {
    type: Schema.Types.ObjectId,
    ref: 'Drone',
    required: [true, 'Assigned drone is required']
  },
  surveyArea: {
    type: surveyAreaSchema,
    required: true
  },
  waypoints: [waypointSchema],
  flightPattern: {
    type: String,
    enum: ['manual', 'grid', 'crosshatch', 'perimeter', 'spiral'],
    default: 'grid'
  },
  altitude: {
    type: Number,
    required: [true, 'Flight altitude is required'],
    min: [10, 'Altitude must be at least 10 meters'],
    max: [120, 'Altitude cannot exceed 120 meters']
  },
  speed: {
    type: Number,
    required: [true, 'Flight speed is required'],
    min: [1, 'Speed must be at least 1 m/s'],
    max: [15, 'Speed cannot exceed 15 m/s']
  },
  overlap: {
    type: Number,
    min: [0, 'Overlap cannot be negative'],
    max: [100, 'Overlap cannot exceed 100%'],
    default: 80
  },
  sideOverlap: {
    type: Number,
    min: [0, 'Side overlap cannot be negative'],
    max: [100, 'Side overlap cannot exceed 100%'],
    default: 60
  },
  estimatedDuration: {
    type: Number,
    required: true,
    min: [1, 'Estimated duration must be at least 1 minute']
  },
  estimatedDistance: {
    type: Number,
    required: true,
    min: [1, 'Estimated distance must be at least 1 meter']
  },
  scheduledStart: {
    type: Date,
    required: true
  },
  scheduledEnd: {
    type: Date,
    required: true
  },
  actualStart: {
    type: Date,
    default: null
  },
  actualEnd: {
    type: Date,
    default: null
  },
  progress: {
    type: Number,
    min: [0, 'Progress cannot be negative'],
    max: [100, 'Progress cannot exceed 100%'],
    default: 0
  },
  currentWaypoint: {
    type: Number,
    min: [0, 'Current waypoint cannot be negative'],
    default: 0
  },
  completedWaypoints: [{
    type: Number,
    min: [0, 'Waypoint number cannot be negative']
  }],
  weatherConditions: {
    temperature: Number,
    humidity: Number,
    windSpeed: Number,
    windDirection: Number,
    visibility: Number,
    conditions: String
  },
  maxWindSpeed: {
    type: Number,
    default: 10,
    min: [0, 'Max wind speed cannot be negative']
  },
  minVisibility: {
    type: Number,
    default: 1000,
    min: [0, 'Min visibility cannot be negative']
  },
  noFlyZones: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    coordinates: [{
      latitude: {
        type: Number,
        required: true,
        min: [-90, 'Latitude must be between -90 and 90'],
        max: [90, 'Latitude must be between -90 and 90']
      },
      longitude: {
        type: Number,
        required: true,
        min: [-180, 'Longitude must be between -180 and 180'],
        max: [180, 'Longitude must be between -180 and 180']
      }
    }]
  }],
  photosCount: {
    type: Number,
    min: [0, 'Photos count cannot be negative'],
    default: 0
  },
  videoDuration: {
    type: Number,
    min: [0, 'Video duration cannot be negative'],
    default: 0
  },
  dataCollected: {
    type: Number,
    min: [0, 'Data collected cannot be negative'],
    default: 0
  },
  batteryUsed: {
    type: Number,
    min: [0, 'Battery used cannot be negative'],
    max: [100, 'Battery used cannot exceed 100%'],
    default: 0
  },
  attachments: [{
    type: String,
    trim: true
  }],
  flightLog: {
    type: String,
    trim: true
  },
  reportId: {
    type: Schema.Types.ObjectId,
    ref: 'Report',
    default: null
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [2000, 'Notes cannot be more than 2000 characters']
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
missionSchema.index({ status: 1 });
missionSchema.index({ assignedPilot: 1 });
missionSchema.index({ assignedDrone: 1 });
missionSchema.index({ type: 1 });
missionSchema.index({ priority: 1 });
missionSchema.index({ scheduledStart: 1 });
missionSchema.index({ createdBy: 1 });
missionSchema.index({ tags: 1 });

// Virtual for actual duration
missionSchema.virtual('actualDuration').get(function(this: IMission) {
  if (this.actualStart && this.actualEnd) {
    return Math.round((this.actualEnd.getTime() - this.actualStart.getTime()) / (1000 * 60)); // minutes
  }
  return null;
});

// Virtual for mission efficiency
missionSchema.virtual('efficiency').get(function(this: IMission) {
  const actualDuration = this.actualStart && this.actualEnd ? 
    Math.round((this.actualEnd.getTime() - this.actualStart.getTime()) / (1000 * 60)) : null;
  
  if (actualDuration && this.estimatedDuration) {
    return Math.round((this.estimatedDuration / actualDuration) * 100);
  }
  return null;
});

// Pre-save validation
missionSchema.pre('save', function(next) {
  if (this.scheduledEnd <= this.scheduledStart) {
    next(new Error('Scheduled end time must be after start time'));
  }
  
  if (this.actualStart && this.actualEnd && this.actualEnd <= this.actualStart) {
    next(new Error('Actual end time must be after start time'));
  }
  
  next();
});

export const Mission = mongoose.model<IMission>('Mission', missionSchema);