import mongoose, { Document, Schema } from 'mongoose';

export interface IWaypoint {
  latitude: number;
  longitude: number;
  altitude: number;
  order: number;
}

export interface IMission extends Document {
  name: string;
  description?: string;
  droneId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  waypoints: IWaypoint[];
  polygon: {
    type: 'Polygon';
    coordinates: number[][][];
  };
  altitude: number;
  speed: number;
  overlap: number; // percentage
  status: 'planned' | 'in-progress' | 'completed' | 'aborted' | 'paused';
  startTime?: Date;
  endTime?: Date;
  estimatedDuration: number; // in minutes
  currentWaypoint: number;
  progress: number; // percentage
  createdAt: Date;
  updatedAt: Date;
}

const waypointSchema = new Schema<IWaypoint>({
  latitude: {
    type: Number,
    required: true,
    min: -90,
    max: 90
  },
  longitude: {
    type: Number,
    required: true,
    min: -180,
    max: 180
  },
  altitude: {
    type: Number,
    required: true,
    min: 0
  },
  order: {
    type: Number,
    required: true,
    min: 0
  }
});

const missionSchema = new Schema<IMission>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  droneId: {
    type: Schema.Types.ObjectId,
    ref: 'Drone',
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  waypoints: [waypointSchema],
  polygon: {
    type: {
      type: String,
      enum: ['Polygon'],
      required: true
    },
    coordinates: {
      type: [[[Number]]],
      required: true
    }
  },
  altitude: {
    type: Number,
    required: true,
    min: 0,
    max: 500 // max altitude in meters
  },
  speed: {
    type: Number,
    required: true,
    min: 1,
    max: 100 // max speed in km/h
  },
  overlap: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    default: 60
  },
  status: {
    type: String,
    enum: ['planned', 'in-progress', 'completed', 'aborted', 'paused'],
    default: 'planned'
  },
  startTime: Date,
  endTime: Date,
  estimatedDuration: {
    type: Number,
    required: true,
    min: 1
  },
  currentWaypoint: {
    type: Number,
    default: 0,
    min: 0
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  }
}, {
  timestamps: true
});

export const Mission = mongoose.model<IMission>('Mission', missionSchema);