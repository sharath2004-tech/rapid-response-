import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['incident', 'sos', 'alert', 'system', 'update'],
    default: 'system',
  },
  relatedIncident: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Incident',
  },
  relatedSOS: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SOSAlert',
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  readAt: Date,
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Notification = mongoose.model('Notification', notificationSchema);
