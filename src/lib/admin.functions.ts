import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { z } from 'zod';

export const administratorAccess = createServerFn({ method: 'GET' }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const result = await context.supabase.rpc('has_role', { _user_id: context.userId, _role: 'admin' });
  if (result.error) throw new Error('Unable to check administrator access.');
  return Boolean(result.data);
});
export const administratorActivity = createServerFn({ method: 'GET' }).middleware([requireSupabaseAuth])
  .inputValidator(input => z.object({ page: z.number().int().min(0), actor: z.string().max(200), action: z.enum(['all', 'booking', 'destination_prices', 'user_roles']), from: z.string(), to: z.string() }).parse(input))
  .handler(async ({ context, data }) => {
    const role = await context.supabase.rpc('has_role', { _user_id: context.userId, _role: 'admin' });
    if (role.error || !role.data) throw new Error('Administrator access required.');
    let query = context.supabase.from('admin_activity_log').select('*', { count: 'exact' }).order('created_at', { ascending: false }).order('id', { ascending: false });
    if (data.actor) query = query.ilike('actor_email', `%${data.actor.replace(/[%_]/g, '')}%`);
    if (data.action !== 'all') query = query.like('action', `${data.action}.%`);
    if (data.from) query = query.gte('created_at', z.string().datetime().parse(`${data.from}T00:00:00+02:00`));
    if (data.to) query = query.lte('created_at', z.string().datetime({ offset: true }).parse(`${data.to}T23:59:59.999+02:00`));
    const result = await query.range(data.page * 25, data.page * 25 + 24);
    if (result.error) throw new Error('Unable to load administrator activity.');
    return { rows: result.data, count: result.count ?? 0 };
  });