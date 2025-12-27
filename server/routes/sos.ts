import express, { type Response } from 'express';
import { authenticateToken, type AuthRequest } from '../middleware/auth';
import { validate, validateBody } from '../middleware/validate';
import { EmergencyContact } from '../models/EmergencyContact';
import { Notification } from '../models/Notification';
import { SOSAlert } from '../models/SOSAlert';
import { User } from '../models/User';
import { NotificationService } from '../services/NotificationService';
import { sosIdSchema, triggerSOSSchema } from '../validators/sos.validators';

const router = express.Router();

// Trigger SOS Alert
router.post('/trigger', authenticateToken, validateBody(triggerSOSSchema), async (req: AuthRequest, res: Response) => {
  try {
    const { location, alertType, message } = req.body;

    // Get user's emergency contacts
    const contacts = await EmergencyContact.find({
      userId: req.user?.userId,
      notifyOnSOS: true
    });

    console.log(`📋 Found ${contacts.length} emergency contacts for user ${req.user?.userId}`);
    
    if (contacts.length === 0) {
      console.warn('⚠️  No emergency contacts found! User needs to add contacts first.');
    }

    // Create SOS Alert
    const sosAlert = new SOSAlert({
      userId: req.user?.userId,
      location,
      alertType: alertType || 'sos',
      message,
      notifiedContacts: contacts.map(c => ({
        contactId: c._id,
        notifiedAt: new Date(),
        acknowledged: false
      }))
    });

    await sosAlert.save();

    // Get user info for notifications
    const user = await User.findById(req.user?.userId);

    // Send SMS and Email notifications to emergency contacts
    const contactsWithEmail = contacts.map(c => ({
      name: c.name,
      phone: c.phone,
      email: c.email
    }));

    console.log(`📱 Sending notifications to ${contactsWithEmail.length} contacts:`, 
      contactsWithEmail.map(c => `${c.name} (${c.phone}, ${c.email || 'no email'})`));

    const notificationResults = await NotificationService.sendSOSAlerts(
      user?.name || user?.email || 'User',
      (user as any).phone,
      location,
      contactsWithEmail,
      alertType
    );

    console.log(`📧 Notifications sent: ${notificationResults.emailsSent} emails, ${notificationResults.smsSent} SMS`);

    // Create notifications for all admins
    const admins = await User.find({ role: 'admin' });

    for (const admin of admins) {
      await Notification.create({
        userId: admin._id,
        title: '🚨 SOS Alert Triggered',
        message: `User ${user?.name || user?.email} has triggered an SOS alert at ${location.address || 'Unknown location'}`,
        type: 'sos',
        relatedSOS: sosAlert._id,
        priority: 'critical'
      });
    }
    
    res.status(201).json({ 
      message: 'SOS Alert triggered successfully',
      sosAlert,
      contactsNotified: contacts.length,
      notifications: {
        emailsSent: notificationResults.emailsSent,
        smsSent: notificationResults.smsSent,
        adminsNotified: admins.length
      }
    });
  } catch (error: any) {
    console.error('SOS trigger error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user's active SOS alerts
router.get('/my-alerts', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const alerts = await SOSAlert.find({ 
      userId: req.user?.userId 
    })
      .sort({ createdAt: -1 })
      .limit(10);
    
    res.json({ alerts });
  } catch (error: any) {
    console.error('Get alerts error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all active SOS alerts (admin only)
router.get('/all', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?.userId);
    if (user?.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const alerts = await SOSAlert.find({ status: 'active' })
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 });
    
    res.json({ alerts });
  } catch (error: any) {
    console.error('Get all alerts error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Cancel SOS Alert
router.put('/:id/cancel', authenticateToken, validate(sosIdSchema), async (req: AuthRequest, res: Response) => {
  try {
    const alert = await SOSAlert.findOne({
      _id: req.params.id,
      userId: req.user?.userId,
      status: 'active'
    });
    
    if (!alert) {
      return res.status(404).json({ message: 'Active SOS alert not found' });
    }

    alert.status = 'cancelled';
    alert.resolvedAt = new Date();
    alert.resolvedBy = req.user?.userId;
    
    await alert.save();
    
    res.json({ 
      message: 'SOS alert cancelled',
      alert 
    });
  } catch (error: any) {
    console.error('Cancel SOS error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Resolve SOS Alert (admin)
router.put('/:id/resolve', authenticateToken, validate(sosIdSchema), async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?.userId);
    if (user?.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const alert = await SOSAlert.findById(req.params.id);
    
    if (!alert) {
      return res.status(404).json({ message: 'SOS alert not found' });
    }

    alert.status = 'resolved';
    alert.resolvedAt = new Date();
    alert.resolvedBy = req.user?.userId;
    
    await alert.save();

    // Notify the user
    await Notification.create({
      userId: alert.userId,
      title: 'SOS Alert Resolved',
      message: 'Your SOS alert has been resolved by emergency services.',
      type: 'sos',
      relatedSOS: alert._id,
      priority: 'high'
    });
    
    res.json({ 
      message: 'SOS alert resolved',
      alert 
    });
  } catch (error: any) {
    console.error('Resolve SOS error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
