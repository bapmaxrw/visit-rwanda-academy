import { createFileRoute, Link } from '@tanstack/react-router';
import { useState, useRef, useEffect, type FormEvent } from 'react';
import { ItineraryQuestions } from '@/components/site/ItineraryQuestions';
import { Compass, Sparkles, Square, MapPin, ArrowRight, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useVisitorSession } from '@/components/site/VisitorSession';
import { attractions, kivu } from '@/data/attractions';
import { supabase } from '@/integrations/supabase/client';
import { itineraryPreferences, type ItineraryPlan } from '@/lib/itinerary-validation';
import { kigaliToday } from '@/lib/booking-validation';

export const Route = createFileRoute('/itinerary')({
  head: () => ({ meta: [{ title: 'Personalized Rwanda Itinerary | Visit Rwanda Academy' }, { name: 'description', content: 'Plan a Rwanda trip around your dates, interests, budget and favorite destinations.' }, { property: 'og:title', content: 'Personalized Rwanda Itinerary | Visit Rwanda Academy' }, { property: 'og:description', content: 'An AI-powered Rwanda itinerary with bookable experiences.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }] }),
  component: Itinerary,
});
const field = 'mt-2 w-full rounded-lg border border-input bg-background p-3';
function Itinerary() {
  const { user } = useVisitorSession();
  const [selected, setSelected] = useState<string[]>([]);
  const [plan, setPlan] = useState<ItineraryPlan | null>(null);
  const [planId, setPlanId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [reasoning, setReasoning] = useState('');
  const [progress, setProgress] = useState('');
  const abort = useRef<AbortController | null>(null);
  useEffect(() => () => abort.current?.abort(), []);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setError('');
    const form = new FormData(e.currentTarget);
    const parsed = itineraryPreferences.safeParse({ startDate: form.get('startDate'), endDate: form.get('endDate'), budget: form.get('budget'), interests: form.get('interests'), destinations: selected });
    if (!parsed.success) { setError(parsed.error.issues[0]?.message ?? 'Check your trip details.'); return; }
    setBusy(true); setReasoning(''); setProgress('');
    const controller = new AbortController(); abort.current = controller;
    try {
      const { data } = await supabase.auth.getSession();
      if (!data.session) throw new Error('Sign in to create your itinerary.');
      const response = await fetch('/api/public/itinerary', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${data.session.access_token}` }, body: JSON.stringify(parsed.data), signal: controller.signal });
      if (!response.ok) { const result = await response.json(); throw new Error(result.message ?? 'Unable to create your itinerary.'); }
      const reader = response.body?.getReader(); if (!reader) throw new Error('The itinerary service returned no content.');
      const decoder = new TextDecoder(); let buffer = ''; let completed = false;
      while (true) {
        const chunk = await reader.read(); buffer += decoder.decode(chunk.value, { stream: !chunk.done });
        const lines = buffer.split('\n'); buffer = lines.pop() ?? '';
        for (const line of lines) {
          if (!line.trim()) continue;
          const event = JSON.parse(line);
          if (event.type === 'reasoning') setReasoning(v => v + event.text);
          if (event.type === 'progress') setProgress(v => v + event.text);
          if (event.type === 'error') throw new Error(event.message);
          if (event.type === 'complete') { setPlan(event.plan); setPlanId(event.id); completed = true; }
        }
        if (chunk.done) break;
      }
      if (!completed) throw new Error('The itinerary ended before it was saved.');
    } catch (err) { setError(controller.signal.aborted ? 'Generation stopped. Your previous itinerary is unchanged.' : err instanceof Error ? err.message : 'Unable to create your itinerary.'); }
    finally { setBusy(false); abort.current = null; }
  }
  return <main className="mx-auto max-w-6xl px-6 pb-24 pt-32">
    <div className="relative overflow-hidden rounded-lg py-12 pl-6 pr-6 sm:pl-10"><img src={kivu} alt="Lake Kivu and Rwanda’s green hills" className="absolute inset-0 h-full w-full object-cover"/><div className="absolute inset-0 bg-hero-overlay"/><div className="relative max-w-xl"><p className="eyebrow">Your Rwanda, your way</p><h1 className="mt-3 text-4xl sm:text-5xl">Rwanda itinerary</h1><p className="mt-4 text-foreground">A journey shaped by your dates, interests and budget.</p></div></div>
    <div className="mt-10 grid items-start gap-12 lg:grid-cols-[380px_1fr]">
      <form onSubmit={submit} className="space-y-6">
        <h2 className="flex items-center gap-2 text-2xl"><Compass className="size-5 text-gold"/>Your trip</h2>
        <div className="grid grid-cols-2 gap-4"><label className="text-sm">Departure<input name="startDate" aria-label="Departure" type="date" min={kigaliToday()} required className={field}/></label><label className="text-sm">Return<input name="endDate" aria-label="Return" type="date" min={kigaliToday()} required className={field}/></label></div>
        <label className="block text-sm">Trip budget per person (USD)<input name="budget" aria-label="Trip budget per person (USD)" type="number" min="1" max="1000000" defaultValue="1500" required className={field}/></label>
        <label className="block text-sm">Interests<textarea name="interests" aria-label="Interests" rows={3} maxLength={2000} required placeholder="Wildlife, hiking, local food, lakeside relaxation…" className={field}/></label>
        <fieldset><legend className="text-sm">Preferred destinations</legend><div className="mt-3 max-h-64 space-y-3 overflow-y-auto border-y border-border py-4">{attractions.map(a => <label key={a.slug} className="flex cursor-pointer items-center gap-3 text-sm"><input type="checkbox" checked={selected.includes(a.slug)} onChange={e => setSelected(v => e.target.checked ? [...v, a.slug] : v.filter(s => s !== a.slug))} className="size-4 accent-primary"/>{a.name}</label>)}</div></fieldset>
        {user ? <div className="flex gap-3"><Button disabled={busy} className="flex-1"><Sparkles className="size-4"/>{busy ? 'Planning…' : 'Create itinerary'}</Button>{busy && <Button variant="outline" title="Stop generation" aria-label="Stop generation" size="icon" type="button" onClick={() => abort.current?.abort()}><Square className="size-4"/></Button>}</div> : <Button asChild className="w-full"><Link to="/auth">Sign in to create itinerary</Link></Button>}
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      </form>
      <div className="min-w-0">
        {busy && <div role="status" className="mb-8 border-y border-border py-6"><p className="flex items-center gap-2 font-semibold text-gold"><Sparkles className="size-4"/>{progress ? 'Writing your daily plan…' : 'Planning your journey…'}</p>{reasoning && <details className="mt-4"><summary className="cursor-pointer text-sm text-muted-foreground">Planning notes</summary><p className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground">{reasoning}</p></details>}</div>}
        {plan ? <PlanView plan={plan}/> : <div className="py-8"><img src={attractions[0]?.image} alt="Mountain gorilla in Volcanoes National Park" className="aspect-[16/10] w-full rounded-lg object-cover"/><div className="mt-6 flex items-center gap-3 text-gold"><MapPin className="size-5"/><h2 className="text-2xl">From rainforest to lakeshore</h2></div></div>}
        {planId && user && <ItineraryQuestions key={`${user.id}-${planId}`} itineraryId={planId}/>}
        <Button asChild variant="link" className="mt-6 px-0"><Link to="/my-itineraries">My saved itineraries<ArrowRight className="size-4"/></Link></Button>
      </div>
    </div>
  </main>;
}
export function PlanView({ plan }: { plan: ItineraryPlan }) {
  return <div><h2 className="text-3xl">{plan.title}</h2><p className="mt-4 text-muted-foreground">{plan.summary}</p><p className="mt-5 border-l-2 border-gold pl-4 text-sm">{plan.budgetNotes}</p>{plan.warnings.length > 0 && <ul className="mt-5 list-disc space-y-2 pl-5 text-sm text-muted-foreground">{plan.warnings.map((warning, i) => <li key={i}>{warning}</li>)}</ul>}
    <div className="mt-8 space-y-8">{plan.days.map((day, index) => <section key={day.date} className="border-t border-border pt-6"><p className="flex items-center gap-2 text-xs font-semibold uppercase text-gold"><CalendarDays className="size-4"/>Day {index + 1} · {day.date}</p><h3 className="mt-3 text-2xl">{day.theme}</h3><p className="mt-2 text-sm text-muted-foreground">{day.transfer}</p><div className="mt-5 space-y-4">{day.stops.map((stop, i) => { const destination = attractions.find(a => a.slug === stop.slug); return <article key={i} className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4 sm:flex-row">{destination && <img src={destination.image} alt={destination.name} className="h-24 w-full shrink-0 rounded-lg object-cover sm:w-28"/>}<div className="min-w-0 flex-1"><p className="text-xs text-gold">{stop.time}</p><h4 className="mt-1 text-xl">{destination?.name ?? stop.slug}</h4><p className="mt-2 text-sm">{stop.activity}</p><p className="mt-2 text-sm text-muted-foreground">{stop.notes}</p><Button asChild variant="link" className="mt-2 h-auto px-0"><Link to="/book" search={{ attraction: stop.slug, date: day.date, time: stop.time, experience: stop.activity }}>Request booking<ArrowRight className="size-4"/></Link></Button></div></article>; })}</div></section>)}</div>
  </div>;
}