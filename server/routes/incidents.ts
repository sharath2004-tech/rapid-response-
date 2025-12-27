import express, { type Request, Response } from 'express';
import { authenticateToken, type AuthRequest } from '../middleware/auth';
import { validate, validateBody } from '../middleware/validate';
import { Incident } from '../models/Incident';
import {
    assignIncidentSchema,
    createIncidentSchema,
    incidentIdSchema,
    updateIncidentSchema,
    updateStatusSchema,
} from '../validators/incident.validators';

const router = express.Router();

// Get all incidents
router.get('/', async (req: Request, res: Response) => {
  try {
    const incidents = await Incident.find()
      .populate('reportedBy', 'name email')
      .sort({ createdAt: -1 });
    
    res.json({ incidents });
  } catch (error: any) {
    console.error('Get incidents error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get incident by ID
router.get('/:id', validate(incidentIdSchema), async (req: Request, res: Response) => {
  try {
    const incident = await Incident.findById(req.params.id)
      .populate('reportedBy', 'name email');
    
    if (!incident) {
      return res.status(404).json({ message: 'Incident not found' });
    }
    
    res.json({ incident });
  } catch (error: any) {
    console.error('Get incident error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new incident (requires authentication)
router.post('/', authenticateToken, validateBody(createIncidentSchema), async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, type, severity, location, media } = req.body;

    const incident = new Incident({
      title,
      description,
      type,
      severity,
      location,
      reportedBy: req.user?.userId,
      reportedByName: req.user?.email,
      media: media || [],
      timeline: [{
        time: new Date(),
        event: 'Incident reported',
        user: req.user?.email,
      }],
    });

    await incident.save();
    
    res.status(201).json({ 
      message: 'Incident reported successfully',
      incident 
    });
  } catch (error: any) {
    console.error('Create incident error:', error);
    console.error('Error details:', error.stack);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message,
      details: error.errors ? Object.keys(error.errors).map(key => error.errors[key].message) : []
    });
  }
});

// Update incident (requires authentication)
router.put('/:id', authenticateToken, validate(incidentIdSchema), validateBody(updateIncidentSchema), async (req: AuthRequest, res: Response) => {
  try {
    const incident = await Incident.findById(req.params.id);
    
    if (!incident) {
      return res.status(404).json({ message: 'Incident not found' });
    }

    // Update fields
    Object.keys(req.body).forEach(key => {
      if (key !== '_id' && key !== 'reportedBy') {
        (incident as any)[key] = req.body[key];
      }
    });

    // Add timeline entry
    incident.timeline.push({
      time: new Date(),
      event: 'Incident updated',
      user: req.user?.email,
    } as any);

    await incident.save();
    
    res.json({ 
      message: 'Incident updated successfully',
      incident 
    });
  } catch (error: any) {
    console.error('Update incident error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete incident (requires authentication)
router.delete('/:id', authenticateToken, validate(incidentIdSchema), async (req: AuthRequest, res: Response) => {
  try {
    const incident = await Incident.findById(req.params.id);
    
    if (!incident) {
      return res.status(404).json({ message: 'Incident not found' });
    }

    await Incident.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Incident deleted successfully' });
  } catch (error: any) {
    console.error('Delete incident error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Verify/Upvote incident (toggle - prevents duplicate votes)
router.post('/:id/verify', authenticateToken, validate(incidentIdSchema), async (req: AuthRequest, res: Response) => {
  try {
    const incident = await Incident.findById(req.params.id);
    
    if (!incident) {
      return res.status(404).json({ message: 'Incident not found' });
    }

    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Initialize verifiedBy array if not exists
    if (!incident.verifiedBy) {
      incident.verifiedBy = [];
    }

    // Check if user already verified this incident
    const hasVerified = incident.verifiedBy.some(
      (id: any) => id.toString() === userId.toString()
    );

    let action: 'added' | 'removed';

    if (hasVerified) {
      // Remove verification (toggle off)
      incident.verifiedBy = incident.verifiedBy.filter(
        (id: any) => id.toString() !== userId.toString()
      );
      incident.verificationCount = Math.max(0, (incident.verificationCount || 1) - 1);
      action = 'removed';
      
      incident.timeline.push({
        time: new Date(),
        event: 'Verification removed by user',
        user: req.user?.email,
      } as any);
    } else {
      // Add verification (toggle on)
      incident.verifiedBy.push(userId as any);
      incident.verificationCount = (incident.verificationCount || 0) + 1;
      action = 'added';
      
      incident.timeline.push({
        time: new Date(),
        event: 'Incident verified by community member',
        user: req.user?.email,
      } as any);
    }
    
    // Auto-verify incident if it reaches 3 verifications
    if (incident.verificationCount >= 3 && incident.status === 'unverified') {
      incident.status = 'verified';
      incident.verifiedAt = new Date();
      incident.timeline.push({
        time: new Date(),
        event: 'Incident auto-verified (3+ community verifications)',
        user: 'System',
      } as any);
    }
    
    // Revert to unverified if count drops below 3
    if (incident.verificationCount < 3 && incident.status === 'verified' && !incident.verifiedAt) {
      incident.status = 'unverified';
    }

    await incident.save();
    
    res.json({ 
      message: action === 'added' ? 'Verification added' : 'Verification removed',
      action,
      verificationCount: incident.verificationCount,
      hasVerified: action === 'added',
      status: incident.status
    });
  } catch (error: any) {
    console.error('Verify incident error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Check if current user has verified an incident
router.get('/:id/verify/status', authenticateToken, validate(incidentIdSchema), async (req: AuthRequest, res: Response) => {
  try {
    const incident = await Incident.findById(req.params.id);
    
    if (!incident) {
      return res.status(404).json({ message: 'Incident not found' });
    }

    const userId = req.user?.userId;
    const hasVerified = incident.verifiedBy?.some(
      (id: any) => id.toString() === userId?.toString()
    ) || false;
    
    res.json({ 
      hasVerified,
      verificationCount: incident.verificationCount || 0
    });
  } catch (error: any) {
    console.error('Check verification status error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update incident status (admin)
router.put('/:id/status', authenticateToken, validate(incidentIdSchema), validateBody(updateStatusSchema), async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;
    const incident = await Incident.findById(req.params.id);
    
    if (!incident) {
      return res.status(404).json({ message: 'Incident not found' });
    }

    incident.status = status;
    incident.timeline.push({
      time: new Date(),
      event: `Status changed to ${status}`,
      user: req.user?.email,
    } as any);

    await incident.save();
    
    res.json({ 
      message: 'Status updated successfully',
      incident
    });
  } catch (error: any) {
    console.error('Update status error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Assign incident to responder (admin)
router.put('/:id/assign', authenticateToken, validate(incidentIdSchema), validateBody(assignIncidentSchema), async (req: AuthRequest, res: Response) => {
  try {
    const { assignedTo } = req.body;
    const incident = await Incident.findById(req.params.id);
    
    if (!incident) {
      return res.status(404).json({ message: 'Incident not found' });
    }

    incident.assignedTo = assignedTo;
    if (incident.status === 'verified') {
      incident.status = 'in-progress';
    }
    
    incident.timeline.push({
      time: new Date(),
      event: `Assigned to ${assignedTo}`,
      user: req.user?.email,
    } as any);

    await incident.save();
    
    res.json({ 
      message: 'Incident assigned successfully',
      incident
    });
  } catch (error: any) {
    console.error('Assign incident error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get stats for dashboard
router.get('/stats/summary', async (req, res) => {
  try {
    const totalIncidents = await Incident.countDocuments();
    const activeIncidents = await Incident.countDocuments({ 
      status: { $in: ['unverified', 'verified', 'in-progress'] } 
    });
    const resolvedToday = await Incident.countDocuments({ 
      status: 'resolved',
      updatedAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
    });
    const criticalCount = await Incident.countDocuments({ 
      severity: 'critical',
      status: { $ne: 'resolved' }
    });
    const pendingVerification = await Incident.countDocuments({ 
      status: 'unverified' 
    });

    res.json({
      stats: {
        totalIncidents,
        activeIncidents,
        resolvedToday,
        criticalCount,
        pendingVerification
      }
    });
  } catch (error: any) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
