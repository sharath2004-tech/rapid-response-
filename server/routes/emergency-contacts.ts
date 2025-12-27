import express, { type Response } from 'express';
import { authenticateToken, type AuthRequest } from '../middleware/auth';
import { validate, validateBody } from '../middleware/validate';
import { EmergencyContact } from '../models/EmergencyContact';
import {
    contactIdSchema,
    createEmergencyContactSchema,
    updateEmergencyContactSchema,
} from '../validators/emergency-contact.validators';

const router = express.Router();

// Get all emergency contacts for user
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const contacts = await EmergencyContact.find({ userId: req.user?.userId })
      .sort({ isPrimary: -1, createdAt: -1 });
    
    res.json({ contacts });
  } catch (error: any) {
    console.error('Get contacts error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add new emergency contact
router.post('/', authenticateToken, validateBody(createEmergencyContactSchema), async (req: AuthRequest, res: Response) => {
  try {
    const { name, phone, email, relationship, isPrimary, notifyOnSOS } = req.body;

    // If this is set as primary, unset other primary contacts
    if (isPrimary) {
      await EmergencyContact.updateMany(
        { userId: req.user?.userId },
        { isPrimary: false }
      );
    }

    const contact = new EmergencyContact({
      name,
      phone,
      email,
      relationship,
      userId: req.user?.userId,
      isPrimary: isPrimary || false,
      notifyOnSOS: notifyOnSOS !== false,
    });

    await contact.save();
    
    res.status(201).json({ 
      message: 'Emergency contact added successfully',
      contact 
    });
  } catch (error: any) {
    console.error('Add contact error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update emergency contact
router.put('/:id', authenticateToken, validate(contactIdSchema), validateBody(updateEmergencyContactSchema), async (req: AuthRequest, res: Response) => {
  try {
    const contact = await EmergencyContact.findOne({
      _id: req.params.id,
      userId: req.user?.userId
    });
    
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    const { name, phone, email, relationship, isPrimary, notifyOnSOS } = req.body;

    // If this is set as primary, unset other primary contacts
    if (isPrimary && !contact.isPrimary) {
      await EmergencyContact.updateMany(
        { userId: req.user?.userId, _id: { $ne: contact._id } },
        { isPrimary: false }
      );
    }

    if (name) contact.name = name;
    if (phone) contact.phone = phone;
    if (email !== undefined) contact.email = email;
    if (relationship) contact.relationship = relationship;
    if (isPrimary !== undefined) contact.isPrimary = isPrimary;
    if (notifyOnSOS !== undefined) contact.notifyOnSOS = notifyOnSOS;

    await contact.save();
    
    res.json({ 
      message: 'Contact updated successfully',
      contact 
    });
  } catch (error: any) {
    console.error('Update contact error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete emergency contact
router.delete('/:id', authenticateToken, validate(contactIdSchema), async (req: AuthRequest, res: Response) => {
  try {
    const contact = await EmergencyContact.findOneAndDelete({
      _id: req.params.id,
      userId: req.user?.userId
    });
    
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }
    
    res.json({ message: 'Contact deleted successfully' });
  } catch (error: any) {
    console.error('Delete contact error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
