import mongoose from 'mongoose';

const incidentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
  },
  type: {
    type: String,
    enum: ['medical', 'accident', 'fire', 'infrastructure', 'public-safety'],
    required: [true, 'Type is required'],
  },
  severity: {
    type: String,
    enum: ['critical', 'high', 'medium', 'low'],
    required: [true, 'Severity is required'],
  },
  status: {
    type: String,
    enum: ['unverified', 'verified', 'in-progress', 'resolved'],
    default: 'unverified',
  },
  location: {
    address: {
      type: String,
      required: [true, 'Address is required'],
    },
    lat: {
      type: Number,
      required: [true, 'Latitude is required'],
    },
    lng: {
      type: Number,
      required: [true, 'Longitude is required'],
    },
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  reportedByName: String,
  verificationCount: {
    type: Number,
    default: 0,
  },
  verifiedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  verifiedAt: {
    type: Date,
  },
  media: [{
    type: String,
  }],
  timeline: [{
    time: {
      type: Date,
      default: Date.now,
    },
    event: String,
    user: String,
  }],
  assignedTo: String,
  notes: [String],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt timestamp
incidentSchema.pre('save', function () {
  this.updatedAt = new Date();
});

export const Incident = mongoose.model('Incident', incidentSchema);
