import { createClient } from '@supabase/supabase-js';
import { createOpenAI } from '@ai-sdk/openai';
import { streamText, Output } from 'ai';
import type { Database } from '@/integrations/supabase/types';
import { packingRequest, packingSchema, packingContext } from './packing-validation';
import { createLovableAiGatewayRunIdFetch, getLovableAiGatewayResponseHeaders } from './ai/run-id.ts';

export async function generatePacking(request: Request, config: { key: string; url: string; publishableKey: string }) {
  const errorResponse = (message: string, status: number) => Response.json({ message }, { status, headers: { 'Cache-Control': 'no-store' } });
  const token = request.headers.get('Authorization')?.replace(/^Bearer /, '');
  if (!token) return errorResponse('Sign in to create a packing checklist.', 401);
  const client = createClient<Database>(config.url, config.publishableKey, { auth: { persistSession: false, autoRefreshToken: false }, global: { headers: { Authorization: `Bearer ${token}` } } });
  const identity = await client.auth.getUser(token);
  if (identity.error || !identity.data.user) return errorResponse('Sign in to create a packing checklist.', 401);
  const userId = identity.data.user.id;
  const parsed = packingRequest.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return errorResponse(parsed.error.issues[0]?.message ?? 'Check your packing needs.', 400);
  const trip = await client.from('itineraries').select('preferences,plan').eq('id', parsed.data.itineraryId).eq('user_id', userId).maybeSingle();
  if (trip.error || !trip.data) return errorResponse('This itinerary is not available to your account.', 404);
  const availability = await client.rpc('itinerary_availability').maybeSingle();
  if (availability.error) return errorResponse('Unable to check trip guide availability.', 503);
  if (availability.data?.blocked) return errorResponse(availability.data.reason, 403);
  let failure: { message: string; status: number } | undefined;
  const getFailure = () => failure;
  const gateway = createLovableAiGatewayRunIdFetch(request.headers.get('X-Lovable-AIG-Run-ID') ?? undefined);
  const provider = createOpenAI({ apiKey: config.key, baseURL: 'https://ai.gateway.lovable.dev/v1', headers: { 'Lovable-API-Key': config.key, 'X-Lovable-AIG-SDK': 'vercel-ai-sdk' }, fetch: async (input, init) => {
    const response = await gateway.fetch(input, init);
    if (!response.ok) {
      const body = await response.clone().json().catch(() => ({}));
      const message = typeof body.message === 'string' ? body.message : typeof body.error?.message === 'string' ? body.error.message : 'The packing guide is unavailable.';
      failure = { message, status: response.status };
      if (response.status === 402 || response.status === 403) {
        const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
        const pause = await supabaseAdmin.from('ai_feature_state').upsert({ feature: 'itinerary', blocked: true, reason: message });
        if (pause.error) throw new Error('Unable to save trip guide availability.');
      }
    }
    return response;
  } });
  const result = streamText({ model: provider.responses('openai/gpt-6-astra'), instructions: packingContext(trip.data), messages: [{ role: 'user', content: parsed.data.needs }], output: Output.object({ schema: packingSchema }), maxRetries: 0, abortSignal: request.signal, providerOptions: { openai: { forceReasoning: true, reasoningEffort: 'low', reasoningSummary: 'auto', store: false, include: ['reasoning.encrypted_content'] } } });
  const iterator = result.fullStream[Symbol.asyncIterator]();
  const first = await iterator.next();
  await gateway.waitForRunId();
  const failed = getFailure();
  if (failed) { await Promise.resolve(result.output).catch(() => undefined); return errorResponse(failed.message, failed.status); }
  const encoder = new TextEncoder();
  const body = new ReadableStream({
    async start(controller) {
      const send = (event: object) => controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
      try {
        send({ type: 'status' });
        let part = first;
        while (!part.done) {
          if (part.value.type === 'error') throw part.value.error;
          if (part.value.type === 'reasoning-delta') send({ type: 'reasoning', text: part.value.text });
          part = await iterator.next();
        }
        const checklist = packingSchema.parse(await result.output);
        if (!checklist.categories.length || checklist.categories.flatMap(c => c.items).length > 50) throw new Error('The checklist could not be validated. Start a new request.');
        if (request.signal.aborted) throw new DOMException('Stopped', 'AbortError');
        const saved = await client.from('packing_checklists').insert({ itinerary_id: parsed.data.itineraryId, user_id: userId, needs: parsed.data.needs, checklist }).select('id').single();
        if (saved.error) throw new Error('Your checklist could not be saved.');
        send({ type: 'complete', checklist, id: saved.data.id });
      } catch (error) {
        await Promise.resolve(result.output).catch(() => undefined);
        const stopped = request.signal.aborted;
        send({ type: 'error', message: stopped ? 'Packing checklist stopped.' : getFailure()?.message ?? (error instanceof Error ? error.message : 'Unable to create packing checklist.'), status: stopped ? 499 : getFailure()?.status ?? 500 });
      } finally { controller.close(); }
    },
    async cancel() { await iterator.return?.(); },
  });
  return new Response(body, { headers: getLovableAiGatewayResponseHeaders({ 'X-Lovable-AIG-Run-ID': gateway.getRunId() ?? '' }, { 'Content-Type': 'application/x-ndjson', 'Cache-Control': 'no-store, no-transform' }) });
}