import { z } from 'zod';

export const createIncidentSchema = z.object({
  title: z.string()
    .min(5, 'Title must be at least 5 characters')
    .max(100, 'Title must not exceed 100 characters'),
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description must not exceed 2000 characters'),
  type: z.enum(['medical', 'accident', 'fire', 'infrastructure', 'public-safety'], {
    errorMap: () => ({ message: 'Invalid incident type' }),
  }),
  severity: z.enum(['critical', 'high', 'medium', 'low'], {
    errorMap: () => ({ message: 'Invalid severity level' }),
  }),
  location: z.object({
    address: z.string().min(1, 'Address is required'),
    lat: z.number()
      .min(-90, 'Latitude must be between -90 and 90')
      .max(90, 'Latitude must be between -90 and 90'),
    lng: z.number()
      .min(-180, 'Longitude must be between -180 and 180')
      .max(180, 'Longitude must be between -180 and 180'),
  }),
  media: z.array(z.string()).optional().default([]),
});

export const updateIncidentSchema = z.object({
  title: z.string().min(5).max(100).optional(),
  description: z.string().min(10).max(2000).optional(),
  type: z.enum(['medical', 'accident', 'fire', 'infrastructure', 'public-safety']).optional(),
  severity: z.enum(['critical', 'high', 'medium', 'low']).optional(),
  status: z.enum(['unverified', 'verified', 'in-progress', 'resolved']).optional(),
  location: z.object({
    address: z.string().min(1),
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  }).optional(),
});

export const updateStatusSchema = z.object({
  status: z.enum(['unverified', 'verified', 'in-progress', 'resolved'], {
    errorMap: () => ({ message: 'Invalid status value' }),
  }),
});

export const assignIncidentSchema = z.object({
  assignedTo: z.string().min(1, 'Assigned user is required'),
});

export const incidentIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid incident ID format'),
  }),
});
