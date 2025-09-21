import mongoose, { Document, Schema } from 'mongoose';

export interface IReport extends Document {
  _id: string;
  missionId: mongoose.Types.ObjectId;
  title: string;
  summary: string;
  
  // Flight details
  flightData: {
    totalFlightTime: number; // minutes
    totalDistance: number; // meters
    averageSpeed: number; // m/s
    maxAltitude: number; // meters
    minAltitude: number; // meters
    batteryUsed: number; // percentage
    waypointsCompleted: number;
    totalWaypoints: number;
  };
  
  // Data collection
  dataCollection: {
    photosCount: number;
    videoDuration: number; // seconds
    dataSize: number; // MB
    coverageArea: number; // square meters
    overlapsAchieved: number; // percentage
  };
  
  // Weather conditions during flight
  weatherConditions: {
    temperature: number;
    humidity: number;
    windSpeed: number;
    windDirection: number;
    visibility: number;
    conditions: string;
  };
  
  // Performance metrics
  performance: {
    efficiency: number; // percentage (actual vs estimated time)
    accuracy: number; // percentage (GPS accuracy)
    completionRate: number; // percentage
    qualityScore: number; // 1-10 scale
  };
  
  // Findings and observations
  findings: Array<{
    type: 'observation' | 'anomaly' | 'damage' | 'issue' | 'recommendation';
    title: string;
    description: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
    severity: 'low' | 'medium' | 'high' | 'critical';
    images?: string[];
    timestamp: Date;
  }>;
  
  // Generated files
  files: {
    images: string[];
    videos: string[];
    rawData: string[];
    processedData: string[];
    maps: string[];
    reports: string[];
  };
  
  // Analysis results
  analysis: {
    recommendations: string[];
    nextActions: string[];
    followUpRequired: boolean;
    riskAssessment: 'low' | 'medium' | 'high' | 'critical';
    estimatedCost?: number;
  };
  
  // Metadata
  generatedBy: mongoose.Types.ObjectId; // pilot who generated
  reviewedBy?: mongoose.Types.ObjectId; // admin who reviewed
  status: 'draft' | 'pending-review' | 'approved' | 'rejected';
  version: number;
  tags: string[];
  isPublic: boolean;
  
  // Timestamps
  generatedAt: Date;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const reportSchema = new Schema<IReport>({
  missionId: {
    type: Schema.Types.ObjectId,
    ref: 'Mission',
    required: [true, 'Mission ID is required']
  },
  title: {
    type: String,
    required: [true, 'Report title is required'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  summary: {
    type: String,
    required: [true, 'Report summary is required'],
    trim: true,
    maxlength: [2000, 'Summary cannot be more than 2000 characters']
  },
  flightData: {
    totalFlightTime: {
      type: Number,
      required: true,
      min: [0, 'Flight time cannot be negative']
    },
    totalDistance: {
      type: Number,
      required: true,
      min: [0, 'Distance cannot be negative']
    },
    averageSpeed: {
      type: Number,
      required: true,
      min: [0, 'Speed cannot be negative']
    },
    maxAltitude: {
      type: Number,
      required: true,
      min: [0, 'Altitude cannot be negative']
    },
    minAltitude: {
      type: Number,
      required: true,
      min: [0, 'Altitude cannot be negative']
    },
    batteryUsed: {
      type: Number,
      required: true,
      min: [0, 'Battery used cannot be negative'],
      max: [100, 'Battery used cannot exceed 100%']
    },
    waypointsCompleted: {
      type: Number,
      required: true,
      min: [0, 'Waypoints completed cannot be negative']
    },
    totalWaypoints: {
      type: Number,
      required: true,
      min: [0, 'Total waypoints cannot be negative']
    }
  },
  dataCollection: {
    photosCount: {
      type: Number,
      default: 0,
      min: [0, 'Photos count cannot be negative']
    },
    videoDuration: {
      type: Number,
      default: 0,
      min: [0, 'Video duration cannot be negative']
    },
    dataSize: {
      type: Number,
      default: 0,
      min: [0, 'Data size cannot be negative']
    },
    coverageArea: {
      type: Number,
      default: 0,
      min: [0, 'Coverage area cannot be negative']
    },
    overlapsAchieved: {
      type: Number,
      default: 0,
      min: [0, 'Overlaps achieved cannot be negative'],
      max: [100, 'Overlaps achieved cannot exceed 100%']
    }
  },
  weatherConditions: {
    temperature: Number,
    humidity: Number,
    windSpeed: Number,
    windDirection: Number,
    visibility: Number,
    conditions: String
  },
  performance: {
    efficiency: {
      type: Number,
      min: [0, 'Efficiency cannot be negative'],
      max: [200, 'Efficiency cannot exceed 200%']
    },
    accuracy: {
      type: Number,
      min: [0, 'Accuracy cannot be negative'],
      max: [100, 'Accuracy cannot exceed 100%']
    },
    completionRate: {
      type: Number,
      min: [0, 'Completion rate cannot be negative'],
      max: [100, 'Completion rate cannot exceed 100%']
    },
    qualityScore: {
      type: Number,
      min: [1, 'Quality score must be at least 1'],
      max: [10, 'Quality score cannot exceed 10']
    }
  },
  findings: [{
    type: {
      type: String,
      enum: ['observation', 'anomaly', 'damage', 'issue', 'recommendation'],
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: [200, 'Finding title cannot be more than 200 characters']
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: [1000, 'Finding description cannot be more than 1000 characters']
    },
    coordinates: {
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
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      required: true
    },
    images: [{
      type: String,
      trim: true
    }],
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  files: {
    images: [{
      type: String,
      trim: true
    }],
    videos: [{
      type: String,
      trim: true
    }],
    rawData: [{
      type: String,
      trim: true
    }],
    processedData: [{
      type: String,
      trim: true
    }],
    maps: [{
      type: String,
      trim: true
    }],
    reports: [{
      type: String,
      trim: true
    }]
  },
  analysis: {
    recommendations: [{
      type: String,
      trim: true
    }],
    nextActions: [{
      type: String,
      trim: true
    }],
    followUpRequired: {
      type: Boolean,
      default: false
    },
    riskAssessment: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'low'
    },
    estimatedCost: {
      type: Number,
      min: [0, 'Estimated cost cannot be negative']
    }
  },
  generatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reviewedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  status: {
    type: String,
    enum: ['draft', 'pending-review', 'approved', 'rejected'],
    default: 'draft'
  },
  version: {
    type: Number,
    default: 1,
    min: [1, 'Version must be at least 1']
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  isPublic: {
    type: Boolean,
    default: false
  },
  generatedAt: {
    type: Date,
    default: Date.now
  },
  reviewedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
reportSchema.index({ missionId: 1 });
reportSchema.index({ generatedBy: 1 });
reportSchema.index({ status: 1 });
reportSchema.index({ generatedAt: -1 });
reportSchema.index({ tags: 1 });

// Virtual for completion percentage
reportSchema.virtual('completionPercentage').get(function(this: IReport) {
  if (this.flightData.totalWaypoints === 0) return 0;
  return Math.round((this.flightData.waypointsCompleted / this.flightData.totalWaypoints) * 100);
});

// Virtual for total findings count
reportSchema.virtual('totalFindings').get(function(this: IReport) {
  return this.findings.length;
});

// Virtual for critical findings count
reportSchema.virtual('criticalFindings').get(function(this: IReport) {
  return this.findings.filter(finding => finding.severity === 'critical').length;
});

export const Report = mongoose.model<IReport>('Report', reportSchema);