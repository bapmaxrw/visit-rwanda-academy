import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { z } from 'zod';

export const savedPacking = createServerFn({ method: 'GET' }).middleware([requireSupabaseAuth])
  .inputValidator(input => z.object({ itineraryId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const result = await context.supabase.from('packing_checklists').select('id,needs,checklist,created_at').eq('itinerary_id', data.itineraryId).eq('user_id', context.userId).order('created_at', { ascending: false }).limit(1).maybeSingle();
    if (result.error) throw new Error('Unable to load your packing checklist.');
    return result.data;
  });