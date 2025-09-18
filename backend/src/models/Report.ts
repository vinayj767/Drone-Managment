import mongoose, { Document, Schema } from 'mongoose';

export interface IReport extends Document {
  missionId: mongoose.Types.ObjectId;
  droneId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  duration: number; // in minutes
  distanceFlown: number; // in kilometers
  areaCovered: number; // in square kilometers
  averageSpeed: number; // in km/h
  averageAltitude: number; // in meters
  batteryUsed: number; // percentage
  imagesCapture: number;
  status: 'success' | 'partial' | 'failed';
  notes?: string;
  generatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const reportSchema = new Schema<IReport>({
  missionId: {
    type: Schema.Types.ObjectId,
    ref: 'Mission',
    required: true
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
  duration: {
    type: Number,
    required: true,
    min: 0
  },
  distanceFlown: {
    type: Number,
    required: true,
    min: 0
  },
  areaCovered: {
    type: Number,
    required: true,
    min: 0
  },
  averageSpeed: {
    type: Number,
    required: true,
    min: 0
  },
  averageAltitude: {
    type: Number,
    required: true,
    min: 0
  },
  batteryUsed: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  imagesCapture: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  status: {
    type: String,
    enum: ['success', 'partial', 'failed'],
    required: true
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  generatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export const Report = mongoose.model<IReport>('Report', reportSchema);