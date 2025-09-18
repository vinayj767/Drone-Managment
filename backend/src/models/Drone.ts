import mongoose, { Document, Schema } from 'mongoose';

export interface IDrone extends Document {
  name: string;
  droneModel: string;
  serialNumber: string;
  status: 'available' | 'in-mission' | 'maintenance' | 'offline';
  batteryLevel: number;
  currentLocation: {
    latitude: number;
    longitude: number;
  };
  maxSpeed: number;
  maxAltitude: number;
  flightTime: number; // in minutes
  lastMaintenance: Date;
  createdAt: Date;
  updatedAt: Date;
}

const droneSchema = new Schema<IDrone>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  droneModel: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  serialNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['available', 'in-mission', 'maintenance', 'offline'],
    default: 'available'
  },
  batteryLevel: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    default: 100
  },
  currentLocation: {
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
    }
  },
  maxSpeed: {
    type: Number,
    required: true,
    min: 0
  },
  maxAltitude: {
    type: Number,
    required: true,
    min: 0
  },
  flightTime: {
    type: Number,
    required: true,
    min: 0
  },
  lastMaintenance: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export const Drone = mongoose.model<IDrone>('Drone', droneSchema);