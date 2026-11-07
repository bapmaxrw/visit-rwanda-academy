import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { useServerFn } from '@tanstack/react-start';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { useVisitorSession } from '@/components/site/VisitorSession';
import { saveBooking } from '@/lib/visitor.functions';
import { bookingSchema, kigaliToday } from '@/lib/booking-validation';
import { CheckCircle2 } from "lucide-react";
import { attractions, nyungwe } from "@/data/attractions";

export const Route = createFileRoute("/book")({
  validateSearch: (s: Record<string, unknown>): { attraction?: string | undefined } => ({ attraction: typeof s["attraction"] === "string" ? s["attraction"] : undefined }),
  head: () => ({
    meta: [
      { title: "Book Your Rwanda Experience | Visit Rwanda" },
      { name: "description", content: "Request a booking for gorilla trekking, safaris, cultural visits and more across Rwanda." },
      { property: "og:title", content: "Book Your Rwanda Experience" },
      { property: "og:description", content: "Request a booking for experiences across Rwanda." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Book,
});

const field = "w-full rounded-xl border border-input bg-glass px-4 py-3 outline-none transition focus:border-ring";

function Book() {
  const { attraction } = Route.useSearch();
  const [ref, setRef] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const { user, loading } = useVisitorSession();
  const save = useServerFn(saveBooking);
  const queryClient = useQueryClient();
  const today = kigaliToday();

  if (ref) return (
    <section className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-6 text-center">
      <CheckCircle2 className="h-16 w-16 text-gold" />
      <h1 className="mt-6 text-4xl">Request received</h1>
      <p className="mt-3 text-muted-foreground">Your booking reference</p>
      <p className="glass mt-2 rounded-2xl px-6 py-3 font-mono text-2xl tracking-widest text-gold">{ref}</p>
      <p className="mt-6 text-sm text-muted-foreground">Status: <span className="text-foreground">Pending</span>. Our team will confirm availability and pricing.</p>
      <Button asChild className="mt-8"><Link to="/account">View my bookings</Link></Button>
    </section>
  );

  return (
    <section className="relative min-h-screen px-6 pb-24 pt-32">
      <img src={nyungwe} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />
      <div className="absolute inset-0 bg-hero-overlay" />
      <div className="relative mx-auto max-w-3xl">
        <p className="eyebrow">Booking</p>
        <h1 className="mt-3 text-5xl">Book your experience</h1>
        {!user ? <div className="mt-10"><p className="text-muted-foreground">{loading ? 'Loading your account…' : 'Sign in to request a booking.'}</p><Button asChild className="mt-5"><Link to="/auth" search={{ attraction }}>Sign in / Create account</Link></Button></div> : <form onSubmit={async (e) => {
          e.preventDefault(); setError(''); setBusy(true);
          const form = Object.fromEntries(new FormData(e.currentTarget));
          try {
            const validated = bookingSchema.safeParse(form);
            if (!validated.success) { setError(validated.error.issues[0]?.message ?? 'Check your booking details.'); return; }
            const result = await save({ data: validated.data });
            await queryClient.invalidateQueries({ queryKey: ['visitor-account'] });
            setRef(result.reference);
          } catch (err) { setError(err instanceof Error ? err.message : 'Unable to save your booking. Try again.'); }
          finally { setBusy(false); }
        }}
          className="glass-strong mt-10 grid gap-5 rounded-[2rem] p-8 md:grid-cols-2">
          <L label="Full name"><input name="full_name" required defaultValue={user.user_metadata['display_name'] ?? ''} className={field} /></L>
          <L label="Email"><input name="email" required type="email" defaultValue={user.email} className={field} /></L>
          <L label="Phone"><input name="phone" required type="tel" className={field} /></L>
          <L label="Nationality"><input name="nationality" required className={field} /></L>
          <L label="Attraction" full>
            <select name="attraction_slug" required defaultValue={attraction ?? ""} className={field}>
              <option value="" disabled>Select an attraction</option>
              {attractions.map((a) => <option key={a.slug} value={a.slug} className="bg-background">{a.name}</option>)}
            </select>
          </L>
          <L label="Date"><input name="visiting_date" required type="date" min={today} className={field} /></L>
          <L label="Preferred time"><select name="preferred_time" className={field}><option className="bg-background">Morning</option><option className="bg-background">Afternoon</option></select></L>
          <L label="Visitors"><input name="visitors" required type="number" min={1} max={20} defaultValue={2} className={field} /></L>
          <L label="Experience"><input name="experience" placeholder="e.g. Guided tour" className={field} /></L>
          <L label="Special requests" full><textarea name="special_requests" rows={3} className={field} /></L>
          {error && <p role="alert" className="text-gold md:col-span-2">{error}</p>}
          <Button disabled={busy} className="h-12 rounded-full bg-accent font-semibold text-accent-foreground md:col-span-2">{busy ? 'Saving request…' : 'Request booking'}</Button>
        </form>}
      </div>
    </section>
  );
}

function L({ label, children, full }: { label: string; children: ReactNode; full?: boolean }) {
  return <label className={`block text-sm ${full ? "md:col-span-2" : ""}`}><span className="mb-2 block text-muted-foreground">{label}</span>{children}</label>;
}
