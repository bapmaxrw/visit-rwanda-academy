import { createClient } from '@supabase/supabase-js';
import { createOpenAI } from '@ai-sdk/openai';
import { convertToModelMessages, streamText, validateUIMessages, type UIMessage } from 'ai';
import type { Database, Json } from '@/integrations/supabase/types';
import { itineraryQuestionRequest, ownedItinerary, itineraryQuestionContext } from './itinerary-chat-validation';
import { createLovableAiGatewayRunIdFetch, withLovableAiGatewayRunIdHeader } from './ai/run-id.ts';

export async function answerItineraryQuestion(request: Request, config: { key: string; url: string; publishableKey: string }) {
  const error = (message: string, status: number) => Response.json({ message }, { status, headers: { 'Cache-Control': 'no-store' } });
  const token = request.headers.get('Authorization')?.replace(/^Bearer /, '');
  if (!token) return error('Sign in to ask about your itinerary.', 401);
  const client = createClient<Database>(config.url, config.publishableKey, { auth: { persistSession: false, autoRefreshToken: false }, global: { headers: { Authorization: `Bearer ${token}` } } });
  const identity = await client.auth.getUser(token);
  if (identity.error || !identity.data.user) return error('Sign in to ask about your itinerary.', 401);
  const userId = identity.data.user.id;
  const parsed = itineraryQuestionRequest.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return error('Enter a question about your saved itinerary.', 400);
  const { itineraryId } = parsed.data;
  const latest = parsed.data.messages.at(-1);
  if (!latest || latest.role !== 'user' || !latest.parts.length) return error('Enter a question about your itinerary.', 400);
  const tripResult = await client.from('itineraries').select('user_id,preferences,plan').eq('id', itineraryId).eq('user_id', userId).maybeSingle();
  if (tripResult.error || !tripResult.data) return error('This itinerary is not available to your account.', 404);
  const trip = ownedItinerary(tripResult.data, userId);
  const availability = await client.from('ai_feature_state').select('blocked,reason').eq('feature', 'itinerary').maybeSingle();
  if (availability.error) return error('Unable to check itinerary availability.', 503);
  if (availability.data?.blocked) return error(availability.data.reason, 403);
  const initialized = await client.from('itinerary_conversations').upsert({ itinerary_id: itineraryId, user_id: userId }, { onConflict: 'itinerary_id', ignoreDuplicates: true });
  if (initialized.error) return error('Unable to prepare your conversation.', 503);
  const stored = await client.from('itinerary_conversations').select('messages,revision').eq('itinerary_id', itineraryId).eq('user_id', userId).single();
  if (stored.error) return error('Unable to load your conversation.', 503);
  let messages: UIMessage[];
  try {
    messages = await validateUIMessages({ messages: [...(Array.isArray(stored.data.messages) ? stored.data.messages : []), latest] });
  } catch { return error('Your saved conversation could not be read.', 400); }
  const revision = stored.data.revision + 1;
  const saveQuestion = await client.from('itinerary_conversations').update({ messages: messages as unknown as Json, revision, updated_at: new Date().toISOString() }).eq('itinerary_id', itineraryId).eq('user_id', userId).eq('revision', stored.data.revision).select('revision');
  if (saveQuestion.error || !saveQuestion.data?.length) return error('This conversation changed. Reload before asking again.', 409);
  let failure: { message: string; status: number } | undefined;
  const getFailure = () => failure;
  const gateway = createLovableAiGatewayRunIdFetch(request.headers.get('X-Lovable-AIG-Run-ID') ?? undefined);
  const provider = createOpenAI({ apiKey: config.key, baseURL: 'https://ai.gateway.lovable.dev/v1', headers: { 'Lovable-API-Key': config.key, 'X-Lovable-AIG-SDK': 'vercel-ai-sdk' }, fetch: async (input, init) => {
    const response = await gateway.fetch(input, init);
    if (!response.ok) {
      const body = await response.clone().json().catch(() => ({}));
      const message = typeof body.message === 'string' ? body.message : typeof body.error?.message === 'string' ? body.error.message : 'The itinerary question service is unavailable.';
      failure = { message, status: response.status };
      if (response.status === 402 || response.status === 403) {
        const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
        const paused = await supabaseAdmin.from('ai_feature_state').upsert({ feature: 'itinerary', blocked: true, reason: message });
        if (paused.error) throw new Error('Unable to save itinerary availability.');
      }
    }
    return response;
  } });
  // Persist and replay text only: no provider item references or unpaired tool results.
  const history = messages.map(message => ({ ...message, parts: message.parts.filter(part => part.type === 'text') }));
  const result = streamText({ model: provider.responses('openai/gpt-6-astra'), instructions: itineraryQuestionContext(trip), messages: await convertToModelMessages(history), maxRetries: 0, abortSignal: request.signal, providerOptions: { openai: { forceReasoning: true, reasoningEffort: 'low', reasoningSummary: 'auto', store: false, include: ['reasoning.encrypted_content'] } } });
  const response = result.toUIMessageStreamResponse({ originalMessages: messages, sendReasoning: true, onError: err => getFailure()?.message ?? (err instanceof Error ? err.message : 'Unable to answer this question.'), onFinish: async ({ messages: finished, isAborted }) => {
    if (isAborted || getFailure()) return;
    const saved = await client.from('itinerary_conversations').update({ messages: finished as unknown as Json, updated_at: new Date().toISOString() }).eq('itinerary_id', itineraryId).eq('user_id', userId).eq('revision', revision).select('revision');
    if (saved.error || !saved.data?.length) throw new Error('Your answer could not be saved. Reload before continuing.');
  } });
  const wrapped = await withLovableAiGatewayRunIdHeader(response, gateway, { 'Cache-Control': 'no-store' });
  const upstreamFailure = getFailure();
  if (upstreamFailure) { await wrapped.body?.cancel(); return error(upstreamFailure.message, upstreamFailure.status); }
  return wrapped;
}