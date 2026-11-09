import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';

export const loadItineraryConversation = createServerFn({ method: 'GET' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { itineraryId: string }) => z.object({ itineraryId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const trip = await context.supabase.from('itineraries').select('id').eq('id', data.itineraryId).eq('user_id', context.userId).maybeSingle();
    if (trip.error || !trip.data) throw new Error('This itinerary is not available to your account.');
    const result = await context.supabase.from('itinerary_conversations').select('messages').eq('itinerary_id', data.itineraryId).eq('user_id', context.userId).maybeSingle();
    if (result.error) throw new Error('Unable to load itinerary questions.');
    return result.data?.messages ?? [];
  });