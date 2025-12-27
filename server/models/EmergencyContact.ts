import mongoose from 'mongoose';

const emergencyContactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Contact name is required'],
    trim: true,
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
  },
  relationship: {
    type: String,
    required: [true, 'Relationship is required'],
    enum: ['family', 'friend', 'neighbor', 'colleague', 'other'],
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  isPrimary: {
    type: Boolean,
    default: false,
  },
  notifyOnSOS: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const EmergencyContact = mongoose.model('EmergencyContact', emergencyContactSchema);
