import { z } from 'zod';
import { attractions } from '@/data/attractions';

export const kigaliToday = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Kigali', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());

export const bookingSchema = z.object({
  full_name: z.string().trim().min(1).max(200),
  email: z.string().email().max(320),
  phone: z.string().trim().min(1).max(50),
  nationality: z.string().trim().min(1).max(100),
  attraction_slug: z.string().refine((value) => attractions.some((a) => a.slug === value), 'Choose a destination'),
  visiting_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine((value) => !Number.isNaN(Date.parse(value)) && value >= kigaliToday(), 'Choose today or a future date'),
  preferred_time: z.enum(['Morning', 'Afternoon']),
  visitors: z.coerce.number().int().min(1).max(20),
  children: z.coerce.number().int().min(0).max(19).default(0),
  visitor_category: z.enum(['International visitor', 'Regional visitor', 'East African Community', 'Rwanda resident']).default('International visitor'),
  experience: z.string().trim().max(500),
  special_requests: z.string().trim().max(3000),
});
