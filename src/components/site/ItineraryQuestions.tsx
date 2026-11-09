import { useEffect, useMemo, useRef, useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, type UIMessage } from 'ai';
import { queryOptions, useQuery } from '@tanstack/react-query';
import { loadItineraryConversation } from '@/lib/itinerary-chat.functions';
import { supabase } from '@/integrations/supabase/client';
import { Conversation, ConversationContent, ConversationScrollButton } from '@/components/ai-elements/conversation';
import { Message, MessageContent, MessageResponse } from '@/components/ai-elements/message';
import { PromptInput, PromptInputTextarea, PromptInputFooter, PromptInputSubmit } from '@/components/ai-elements/prompt-input';
import { Shimmer } from '@/components/ai-elements/shimmer';
import { kivu } from '@/data/attractions';

export function ItineraryQuestions({ itineraryId }: { itineraryId: string }) {
  const history = useQuery(queryOptions({ queryKey: ['itinerary-questions', itineraryId], queryFn: () => loadItineraryConversation({ data: { itineraryId } }), staleTime: 0 }));
  if (history.isPending) return <p role="status" className="mt-8 text-sm text-muted-foreground">Loading your questions…</p>;
  if (history.error) return <p role="alert" className="mt-8 text-sm text-destructive">{history.error.message}</p>;
  return <QuestionConversation itineraryId={itineraryId} initialMessages={history.data as unknown as UIMessage[]}/>;
}

function QuestionConversation({ itineraryId, initialMessages }: { itineraryId: string; initialMessages: UIMessage[] }) {
  const [text, setText] = useState('');
  const textarea = useRef<HTMLTextAreaElement>(null);
  const transport = useMemo(() => new DefaultChatTransport({ api: '/api/public/itinerary-question', body: { itineraryId }, headers: async () => {
    const { data } = await supabase.auth.getSession();
    return data.session ? { Authorization: `Bearer ${data.session.access_token}` } : {};
  }, fetch: async (input, init) => {
    const response = await fetch(input, init);
    if (!response.ok) {
      const payload = await response.clone().json().catch(() => ({}));
      throw new Error(payload.message ?? 'Unable to answer your question.');
    }
    return response;
  } }), [itineraryId]);
  const { messages, sendMessage, status, stop, error } = useChat({ id: itineraryId, messages: initialMessages, transport });
  const busy = status === 'submitted' || status === 'streaming';
  useEffect(() => { textarea.current?.focus({ preventScroll: true }); }, [status, itineraryId]);
  useEffect(() => () => { void stop(); }, [stop]);
  return <section className="mt-10 min-w-0 border-t border-border pt-8" aria-label="Itinerary questions">
    <div className="flex items-center gap-3"><img src={kivu} alt="" className="size-10 rounded-full object-cover"/><h2 className="text-2xl">Ask your Rwanda guide</h2></div>
    <Conversation className="mt-5 h-[420px] min-h-0 border-y border-border">
      <ConversationContent className="px-0">
        {!messages.length && <p className="text-sm text-muted-foreground">What would you like to know about this trip?</p>}
        {messages.map(message => <Message key={message.id} from={message.role}><MessageContent className={message.role === 'user' ? 'bg-primary text-primary-foreground' : ''}>{message.parts.map((part, index) => part.type === 'text' ? <MessageResponse key={index}>{part.text}</MessageResponse> : part.type === 'reasoning' ? <details key={index} className="text-muted-foreground"><summary className="cursor-pointer text-xs">Trip planning notes</summary><p className="mt-2 whitespace-pre-wrap text-xs">{part.text}</p></details> : null)}</MessageContent></Message>)}
        {status === 'submitted' && <div role="status"><Shimmer>Reviewing your trip…</Shimmer></div>}
      </ConversationContent><ConversationScrollButton/>
    </Conversation>
    {error && <p role="alert" className="mt-3 text-sm text-destructive">{error.message}</p>}
    <PromptInput className="mt-4" onSubmit={({ text: question }) => { if (busy || !question.trim()) return; void sendMessage({ text: question.trim() }); setText(''); textarea.current?.focus(); }}>
      <PromptInputTextarea ref={textarea} aria-label="Question about your itinerary" placeholder="Will my budget cover these stops?" value={text} onChange={event => setText(event.target.value)} maxLength={4000}/>
      <PromptInputFooter className="justify-end"><PromptInputSubmit status={status} onStop={() => void stop()} disabled={!busy && !text.trim()} title={busy ? 'Stop answer' : 'Ask question'}/></PromptInputFooter>
    </PromptInput>
  </section>;
}