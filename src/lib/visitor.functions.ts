import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { bookingSchema } from './booking-validation';
import { z } from 'zod';

export const saveBooking = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator(input => bookingSchema.parse(input))
  .handler(async ({ data, context }) => {
    const result = await context.supabase.from('bookings').insert({ ...data, user_id: context.userId, status: 'Pending' }).select('reference').single();
    if (result.error) throw new Error('Unable to save your booking. Please try again.');
    return result.data;
  });

export const visitorAccount = createServerFn({ method: 'GET' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const [profile, bookings] = await Promise.all([
      context.supabase.from('profiles').select('display_name, phone').eq('id', context.userId).single(),
      context.supabase.from('bookings').select('*').eq('user_id', context.userId).order('created_at', { ascending: false }),
    ]);
    if (profile.error || bookings.error) throw new Error('Unable to load your account. Please try again.');
    return { profile: profile.data, bookings: bookings.data };
  });

export const updateProfile = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator(input => z.object({ display_name: z.string().trim().min(1).max(200), phone: z.string().trim().max(50) }).parse(input))
  .handler(async ({ data, context }) => {
    const result = await context.supabase.from('profiles').update(data).eq('id', context.userId);
    if (result.error) throw new Error('Unable to save your profile.');
    return { saved: true };
  });