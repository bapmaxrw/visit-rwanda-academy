import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
export const savedItineraries = createServerFn({ method: 'GET' }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const result = await context.supabase.from('itineraries').select('*').eq('user_id', context.userId).order('created_at', { ascending: false }).limit(20);
  if (result.error) throw new Error('Unable to load saved itineraries.');
  return result.data;
});