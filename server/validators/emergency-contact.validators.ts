import { z } from 'zod';

const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/;

export const createEmergencyContactSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters'),
  phone: z.string()
    .regex(phoneRegex, 'Invalid phone number format'),
  email: z.string()
    .email('Invalid email address')
    .optional(),
  relationship: z.string()
    .min(2, 'Relationship must be at least 2 characters')
    .max(50, 'Relationship must not exceed 50 characters'),
  isPrimary: z.boolean().optional().default(false),
  notifyOnSOS: z.boolean().optional().default(true),
});

export const updateEmergencyContactSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().regex(phoneRegex, 'Invalid phone number format').optional(),
  email: z.string().email('Invalid email address').optional(),
  relationship: z.string().min(2).max(50).optional(),
  isPrimary: z.boolean().optional(),
  notifyOnSOS: z.boolean().optional(),
});

export const contactIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid contact ID format'),
  }),
});
