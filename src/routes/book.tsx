import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useVisitorSession } from "@/components/site/VisitorSession";
import { saveBooking } from "@/lib/visitor.functions";
import { bookingSchema, kigaliToday } from "@/lib/booking-validation";
import { CheckCircle2 } from "lucide-react";
import { attractions, nyungwe } from "@/data/attractions";

const officialPricingNotes = [
  {
    activity: "Gorilla trekking",
    source: "Rwanda Development Board / official park guidance",
    status: "Price has not yet been verified for this deployment",
    lastVerified: "Not yet verified",
  },
  {
    activity: "Akagera safari",
    source: "Akagera National Park official visitor information",
    status: "Price has not yet been verified for this deployment",
    lastVerified: "Not yet verified",
  },
  {
    activity: "Nyungwe canopy walk",
    source: "Nyungwe National Park official rates",
    status: "Price has not yet been verified for this deployment",
    lastVerified: "Not yet verified",
  },
] as const;

export const Route = createFileRoute("/book")({
  validateSearch: (s: Record<string, unknown>): { attraction?: string | undefined; date?: string | undefined; time?: string | undefined; experience?: string | undefined } => ({
    attraction: typeof s["attraction"] === "string" ? s["attraction"] : undefined,
    date: typeof s["date"] === "string" ? s["date"] : undefined,
    time: typeof s["time"] === "string" ? s["time"] : undefined,
    experience: typeof s["experience"] === "string" ? s["experience"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Plan Your Visit | Visit Rwanda" },
      { name: "description", content: "Request a visit to Rwanda with destination, travel dates, activities, pricing information and booking details." },
      { property: "og:title", content: "Plan Your Visit | Visit Rwanda" },
      { property: "og:description", content: "Request a booking for planned Rwanda experiences." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Book,
});

export function Book() {
  const { attraction, date, time, experience } = Route.useSearch();
  const [ref, setRef] = useState<string | null>(null);
  const [error, setError] = useState("");
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
      <p className="mt-6 text-sm text-muted-foreground">Status: <span className="text-foreground">Pending</span>. Our team will confirm availability and verified official pricing.</p>
      <Button asChild className="mt-8"><Link to="/account">View my bookings</Link></Button>
    </section>
  );

  return (
    <section className="relative min-h-screen px-6 pb-24 pt-32">
      <img src={nyungwe} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />
      <div className="absolute inset-0 bg-hero-overlay" />
      <div className="relative mx-auto max-w-5xl">
        <p className="eyebrow">Plan Your Visit</p>
        <h1 className="mt-3 text-5xl">Design your Rwanda journey</h1>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="glass-strong rounded-[2rem] p-6 md:p-8">
            {!user ? <div className="mb-6"><p className="text-muted-foreground">{loading ? "Loading your account…" : "Sign in to request a booking."}</p><Button asChild className="mt-5"><Link to="/auth">Sign in</Link></Button></div> : (
              <form onSubmit={async (e) => {
                e.preventDefault();
                setError("");
                setBusy(true);
                const form = Object.fromEntries(new FormData(e.currentTarget));
                try {
                  const validated = bookingSchema.safeParse(form);
                  if (!validated.success) {
                    setError(validated.error.issues[0]?.message ?? "Check your booking details.");
                    return;
                  }
                  const result = await save({ data: validated.data });
                  await queryClient.invalidateQueries({ queryKey: ["visitor-account"] });
                  setRef(result.reference);
                } catch (err) {
                  setError(err instanceof Error ? err.message : "Unable to save your booking. Try again.");
                } finally {
                  setBusy(false);
                }
              }} className="grid gap-5 md:grid-cols-2">
                <L label="Full name"><input name="full_name" required defaultValue={user.user_metadata["display_name"] ?? ""} className={field} /></L>
                <L label="Email"><input name="email" required type="email" defaultValue={user.email ?? ""} className={field} /></L>
                <L label="Telephone"><input name="phone" required type="tel" className={field} /></L>
                <L label="Nationality"><input name="nationality" required className={field} /></L>
                <L label="Destination" full>
                  <select name="attraction_slug" required defaultValue={attraction ?? ""} className={field}>
                    <option value="" disabled>Select a destination</option>
                    {attractions.map((a) => <option key={a.slug} value={a.slug} className="bg-background">{a.name}</option>)}
                  </select>
                </L>
                <L label="Travel date"><input name="visiting_date" required type="date" min={today} defaultValue={date} className={field} /></L>
                <L label="Preferred time"><select name="preferred_time" defaultValue={time ?? "Morning"} className={field}><option className="bg-background">Morning</option><option className="bg-background">Afternoon</option></select></L>
                <L label="Adults"><input name="visitors" required type="number" min={1} max={20} defaultValue={2} className={field} /></L>
                <L label="Children"><input name="children" type="number" min={0} max={19} defaultValue={0} className={field} /></L>
                <L label="Visitor category" full>
                  <select name="visitor_category" defaultValue="International visitor" className={field}>
                    <option>International visitor</option>
                    <option>Regional visitor</option>
                    <option>East African Community</option>
                    <option>Rwanda resident</option>
                  </select>
                </L>
                <L label="Activity" full><input name="experience" defaultValue={experience ?? ""} placeholder="e.g. Gorilla trekking" className={field} /></L>
                <L label="Additional requests" full><textarea name="special_requests" rows={3} className={field} /></L>
                {error && <p role="alert" className="text-gold md:col-span-2">{error}</p>}
                <Button disabled={busy} className="h-12 rounded-full bg-accent font-semibold text-accent-foreground md:col-span-2">{busy ? "Saving request…" : "Submit booking request"}</Button>
              </form>
            )}
          </div>

          <aside className="space-y-6">
            <div className="glass-strong rounded-[2rem] p-6">
              <p className="eyebrow">Official pricing</p>
              <h2 className="mt-3 text-2xl">Verified sources only</h2>
              <p className="mt-2 text-sm text-muted-foreground">Every price should be backed by an official tourism source and a verification date. These examples remain intentionally unpriced until verified.</p>
              <div className="mt-5 space-y-4">
                {officialPricingNotes.map((item) => (
                  <div key={item.activity} className="rounded-2xl border border-border bg-background/30 p-4">
                    <p className="font-semibold text-gold">{item.activity}</p>
                    <p className="mt-2 text-xs text-muted-foreground">Source: {item.source}</p>
                    <p className="mt-2 text-xs text-muted-foreground">Status: {item.status}</p>
                    <p className="mt-2 text-xs text-muted-foreground">Last verified: {item.lastVerified}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-strong rounded-[2rem] p-6">
              <p className="eyebrow">Need help?</p>
              <h3 className="mt-2 text-2xl">Official contacts</h3>
              <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                <li>Email: info@visitrwanda.com</li>
                <li>Telephone: +250 788 000 000</li>
                <li>Website: https://www.visitrwanda.com</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

function L({ label, children, full }: { label: string; children: ReactNode; full?: boolean }) {
  return <label className={`block text-sm ${full ? "md:col-span-2" : ""}`}><span className="mb-2 block text-muted-foreground">{label}</span>{children}</label>;
}

const field = "w-full rounded-xl border border-input bg-glass px-4 py-3 outline-none transition focus:border-ring";
