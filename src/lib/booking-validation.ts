import { z } from 'zod';
import { attractions } from '@/data/attractions';

export const kigaliToday = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Kigali', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());

const commonBookingFields = {
  full_name: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(320),
  phone: z.string().trim().min(1).max(50),
  nationality: z.string().trim().min(1).max(100),
  attraction_slug: z.string().refine((value) => attractions.some((a) => a.slug === value), 'Choose a destination'),
  visiting_date: z.string().regex(/^\\d{4}-\\d{2}-\\d{2}$/).refine((value) => !Number.isNaN(Date.parse(value)) && value >= kigaliToday(), 'Choose today or a future date'),
  preferred_time: z.enum(['Morning', 'Afternoon']),
  children: z.coerce.number().int().min(0).max(19).default(0),
  visitor_category: z.enum(['International visitor', 'Regional visitor', 'East African Community', 'Rwanda resident']).default('International visitor'),
  experience: z.string().trim().max(500),
  special_requests: z.string().trim().max(3000),
};

/** Form-facing schema: adults + children become the existing database party-size fields. */
export const bookingFormSchema = z.object({
  ...commonBookingFields,
  adults: z.coerce.number().int().min(1).max(20),
}).superRefine((booking, context) => {
  if (booking.adults + booking.children > 20) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['children'], message: 'A booking can include no more than 20 visitors.' });
  }
}).transform(({ adults, ...booking }) => ({ ...booking, visitors: adults + booking.children }));

/** Server-facing schema validates exactly the columns accepted by bookings inserts. */
export const bookingSchema = z.object({
  ...commonBookingFields,
  visitors: z.coerce.number().int().min(1).max(20),
}).superRefine((booking, context) => {
  if (booking.children >= booking.visitors) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['children'], message: 'At least one adult is required.' });
  }
});
