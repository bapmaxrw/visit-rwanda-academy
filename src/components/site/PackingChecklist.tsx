import { useEffect, useRef, useState, Suspense } from 'react';
import { queryOptions, useSuspenseQuery, useQueryClient } from '@tanstack/react-query';
import { Luggage, Sparkles, Square, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { savedPacking } from '@/lib/packing.functions';
import { packingRequest, packingSchema, type PackingChecklist as Checklist } from '@/lib/packing-validation';

export function PackingChecklist({ itineraryId }: { itineraryId: string }) {
  return <section className="mt-12 border-t border-border pt-8"><h2 className="flex items-center gap-3 text-3xl"><Luggage className="size-6 text-gold"/>Your packing list</h2><Suspense fallback={<p role="status" className="mt-4">Loading checklist…</p>}><PackingForm itineraryId={itineraryId}/></Suspense></section>;
}
function PackingForm({ itineraryId }: { itineraryId: string }) {
  const queryClient = useQueryClient();
  const { data: saved } = useSuspenseQuery(queryOptions({ queryKey: ['packing', itineraryId], queryFn: () => savedPacking({ data: { itineraryId } }) }));
  const initial = packingSchema.safeParse(saved?.checklist);
  const [list, setList] = useState<Checklist | null>(initial.success ? initial.data : null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [reasoning, setReasoning] = useState('');
  const abort = useRef<AbortController | null>(null);
  useEffect(() => () => abort.current?.abort(), []);
  async function generate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError('');
    const parsed = packingRequest.safeParse({ itineraryId, needs: new FormData(event.currentTarget).get('needs') });
    if (!parsed.success) { setError(parsed.error.issues[0]?.message ?? 'Check your packing needs.'); return; }
    const controller = new AbortController(); abort.current = controller; setBusy(true); setReasoning('');
    try {
      const session = await supabase.auth.getSession();
      if (!session.data.session) throw new Error('Sign in to create a checklist.');
      const response = await fetch('/api/public/packing', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.data.session.access_token}` }, body: JSON.stringify(parsed.data), signal: controller.signal });
      if (!response.ok) { const body = await response.json(); throw new Error(body.message ?? 'Unable to create checklist.'); }
      const reader = response.body?.getReader(); if (!reader) throw new Error('No packing checklist was returned.');
      const decoder = new TextDecoder(); let buffer = ''; let complete = false;
      while (true) {
        const chunk = await reader.read(); buffer += decoder.decode(chunk.value, { stream: !chunk.done });
        const lines = buffer.split('\n'); buffer = lines.pop() ?? '';
        for (const line of lines) {
          if (!line.trim()) continue;
          const part = JSON.parse(line);
          if (part.type === 'reasoning') setReasoning(value => value + part.text);
          if (part.type === 'error') throw new Error(part.message);
          if (part.type === 'complete') { setList(packingSchema.parse(part.checklist)); complete = true; }
        }
        if (chunk.done) break;
      }
      if (!complete) throw new Error('Your packing checklist ended before it was saved.');
      await queryClient.invalidateQueries({ queryKey: ['packing', itineraryId] });
    } catch (error) { setError(controller.signal.aborted ? 'Generation stopped. Your previous checklist is unchanged.' : error instanceof Error ? error.message : 'Unable to create checklist.'); }
    finally { setBusy(false); abort.current = null; }
  }
  function download() {
    if (!list) return;
    const text = [list.title, list.summary, ...list.categories.flatMap(c => [ '\n' + c.name, ...c.items.map(i => `[ ] ${i.item} (${i.quantity}) — ${i.reason}`) ]), ...list.warnings].join('\n');
    const url = URL.createObjectURL(new Blob([text], { type: 'text/plain' }));
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'rwanda-packing-checklist.txt'; anchor.click(); URL.revokeObjectURL(url);
  }
  return <><form onSubmit={generate} className="mt-6 space-y-4"><label className="block text-sm">Packing needs<textarea name="needs" aria-label="Packing needs" defaultValue={saved?.needs ?? ''} required maxLength={3000} rows={3} placeholder="Carry-on only, hiking boots already owned, traveling with children…" className="mt-2 w-full rounded-lg border border-input bg-background p-3"/></label><div className="flex flex-wrap gap-3"><Button disabled={busy}><Sparkles/>{busy ? 'Preparing checklist…' : list ? 'Create new checklist' : 'Create packing checklist'}</Button>{busy && <Button type="button" variant="outline" size="icon" title="Stop packing checklist" aria-label="Stop packing checklist" onClick={() => abort.current?.abort()}><Square/></Button>}{list && <Button type="button" variant="outline" size="icon" title="Download checklist" aria-label="Download checklist" onClick={download}><Download/></Button>}</div></form>{error && <p role="alert" className="mt-4 text-sm text-destructive">{error}</p>}{busy && <p role="status" className="mt-4 text-sm text-gold">Preparing for your Rwanda journey…</p>}{busy && reasoning && <details className="mt-3 text-sm text-muted-foreground"><summary>Planning notes</summary><p className="mt-2 whitespace-pre-wrap">{reasoning}</p></details>}{list && <div className="mt-8"><h3 className="text-2xl">{list.title}</h3><p className="mt-3 text-sm text-muted-foreground">{list.summary}</p><div className="mt-6 grid gap-8 sm:grid-cols-2">{list.categories.map((category, i) => <div key={i}><h4 className="border-b border-border pb-3 text-xl text-gold">{category.name}</h4><ul className="mt-3 space-y-4">{category.items.map((item, j) => <li key={j}><label className="flex items-start gap-3"><input type="checkbox" className="mt-1 size-4 shrink-0 accent-primary"/><span className="min-w-0"><span className="text-sm font-semibold">{item.item}</span><span className="ml-2 text-xs text-muted-foreground">{item.quantity} · {item.priority}</span><span className="mt-1 block text-xs text-muted-foreground">{item.reason}</span></span></label></li>)}</ul></div>)}</div>{list.warnings.length > 0 && <ul className="mt-6 list-disc space-y-2 border-t border-border pt-5 pl-5 text-sm text-muted-foreground">{list.warnings.map((warning, i) => <li key={i}>{warning}</li>)}</ul>}</div>}</>;
}