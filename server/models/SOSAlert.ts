import mongoose from 'mongoose';

const sosAlertSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  location: {
    address: String,
    lat: {
      type: Number,
      required: true,
    },
    lng: {
      type: Number,
      required: true,
    },
  },
  status: {
    type: String,
    enum: ['active', 'resolved', 'cancelled'],
    default: 'active',
  },
  alertType: {
    type: String,
    enum: ['sos', 'panic', 'medical', 'safety'],
    default: 'sos',
  },
  message: String,
  notifiedContacts: [{
    contactId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EmergencyContact',
    },
    notifiedAt: {
      type: Date,
      default: Date.now,
    },
    acknowledged: {
      type: Boolean,
      default: false,
    },
  }],
  resolvedAt: Date,
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const SOSAlert = mongoose.model('SOSAlert', sosAlertSchema);
