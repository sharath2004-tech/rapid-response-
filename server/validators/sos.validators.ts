import { z } from 'zod';

export const triggerSOSSchema = z.object({
  location: z.object({
    address: z.string().optional(),
    lat: z.number()
      .min(-90, 'Latitude must be between -90 and 90')
      .max(90, 'Latitude must be between -90 and 90'),
    lng: z.number()
      .min(-180, 'Longitude must be between -180 and 180')
      .max(180, 'Longitude must be between -180 and 180'),
  }),
  alertType: z.enum(['emergency', 'panic', 'medical', 'safety', 'sos'], {
    errorMap: () => ({ message: 'Invalid alert type' }),
  }).optional().default('emergency'),
  message: z.string().max(500, 'Message must not exceed 500 characters').optional(),
});

export const sosIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid SOS alert ID format'),
  }),
});
