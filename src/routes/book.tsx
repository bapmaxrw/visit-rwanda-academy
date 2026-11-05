import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { attractions, nyungwe } from "@/data/attractions";

export const Route = createFileRoute("/book")({
  validateSearch: (s: Record<string, unknown>) => ({ attraction: typeof s.attraction === "string" ? s.attraction : undefined }),
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
  const today = new Date().toISOString().slice(0, 10);

  if (ref) return (
    <section className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-6 text-center">
      <CheckCircle2 className="h-16 w-16 text-gold" />
      <h1 className="mt-6 text-4xl">Request received</h1>
      <p className="mt-3 text-muted-foreground">Your booking reference</p>
      <p className="glass mt-2 rounded-2xl px-6 py-3 font-mono text-2xl tracking-widest text-gold">{ref}</p>
      <p className="mt-6 text-sm text-muted-foreground">Status: <span className="text-foreground">Pending</span>. Our team will confirm availability and pricing.</p>
      <Link to="/destinations" className="mt-8 rounded-full bg-accent px-6 py-3 font-semibold text-accent-foreground">Keep exploring</Link>
    </section>
  );

  return (
    <section className="relative min-h-screen px-6 pb-24 pt-32">
      <img src={nyungwe} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />
      <div className="absolute inset-0 bg-hero-overlay" />
      <div className="relative mx-auto max-w-3xl">
        <p className="eyebrow">Booking</p>
        <h1 className="mt-3 text-5xl">Book your experience</h1>
        <form onSubmit={(e) => { e.preventDefault(); setRef("VR-" + Date.now().toString(36).toUpperCase().slice(-6)); }}
          className="glass-strong mt-10 grid gap-5 rounded-[2rem] p-8 md:grid-cols-2">
          <L label="Full name"><input required className={field} /></L>
          <L label="Email"><input required type="email" className={field} /></L>
          <L label="Phone"><input required type="tel" className={field} /></L>
          <L label="Nationality"><input required className={field} /></L>
          <L label="Attraction" full>
            <select required defaultValue={attraction ?? ""} className={field}>
              <option value="" disabled>Select an attraction</option>
              {attractions.map((a) => <option key={a.slug} value={a.slug} className="bg-background">{a.name}</option>)}
            </select>
          </L>
          <L label="Date"><input required type="date" min={today} className={field} /></L>
          <L label="Preferred time"><select className={field}><option className="bg-background">Morning</option><option className="bg-background">Afternoon</option></select></L>
          <L label="Visitors"><input required type="number" min={1} max={20} defaultValue={2} className={field} /></L>
          <L label="Experience"><input placeholder="e.g. Guided tour" className={field} /></L>
          <L label="Special requests" full><textarea rows={3} className={field} /></L>
          <button className="rounded-full bg-accent py-4 font-semibold text-accent-foreground transition hover:shadow-glow md:col-span-2">Request booking</button>
        </form>
      </div>
    </section>
  );
}

function L({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return <label className={`block text-sm ${full ? "md:col-span-2" : ""}`}><span className="mb-2 block text-muted-foreground">{label}</span>{children}</label>;
}
