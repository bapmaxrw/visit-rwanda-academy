import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Clock, MapPin, Calendar, ShieldAlert, Phone, Ticket } from "lucide-react";
import { attractions, getAttraction } from "@/data/attractions";
import { AttractionCard } from "@/components/site/AttractionCard";
import { Reveal } from "@/components/site/Chrome";

export const Route = createFileRoute("/destinations/$slug")({
  loader: ({ params }) => {
    const a = getAttraction(params.slug);
    if (!a) throw notFound();
    return { slug: a.slug };
  },
  head: ({ loaderData }) => {
    const a = loaderData ? getAttraction(loaderData.slug) : undefined;
    const title = a ? `${a.name} | Visit Rwanda` : "Destination not found | Visit Rwanda";
    return {
      meta: [
        { title },
        { name: "description", content: a?.short ?? "Rwanda destination" },
        { property: "og:title", content: title },
        { property: "og:description", content: a?.short ?? "Rwanda destination" },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
        ...(a ? [] : [{ name: "robots", content: "noindex" }]),
      ],
    };
  },
  notFoundComponent: () => (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4"><h1 className="text-4xl">Destination not found</h1><Link to="/destinations" className="text-gold">Back to destinations</Link></div>
  ),
  component: Detail,
});

function Detail() {
  const { slug } = Route.useLoaderData();
  const a = getAttraction(slug)!;
  const related = attractions.filter((x) => x.category === a.category && x.slug !== a.slug).slice(0, 3);
  const [lat, lng] = a.coords;
  return (
    <>
      <section className="relative flex h-[85vh] items-end overflow-hidden">
        <motion.img initial={{ scale: 1.15 }} animate={{ scale: 1 }} transition={{ duration: 1.6 }} src={a.image} alt={a.name} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-hero-overlay" />
        <div className="relative mx-auto w-full max-w-6xl px-6 pb-16">
          <p className="eyebrow">{a.category}</p>
          <h1 className="mt-3 text-5xl md:text-7xl">{a.name}</h1>
          <p className="mt-3 flex items-center gap-2 text-muted-foreground"><MapPin className="h-4 w-4 text-gold" />{a.district}, {a.province} Province</p>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-12 px-6 py-16 lg:grid-cols-[1.6fr_1fr]">
        <div>
          <Reveal><p className="text-lg leading-relaxed text-muted-foreground">{a.description}</p></Reveal>
          <Reveal><h2 className="mt-12 text-3xl">Activities</h2>
            <div className="mt-4 flex flex-wrap gap-2">{a.activities.map((x) => <span key={x} className="glass rounded-full px-4 py-2 text-sm">{x}</span>)}</div>
          </Reveal>
          <Reveal><h2 className="mt-12 text-3xl">Location</h2>
            <iframe title={`Map of ${a.name}`} loading="lazy" className="mt-4 h-80 w-full rounded-3xl border border-border"
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.08}%2C${lat - 0.06}%2C${lng + 0.08}%2C${lat + 0.06}&marker=${lat}%2C${lng}`} />
            <a className="mt-3 inline-block text-sm text-gold hover:underline" target="_blank" rel="noreferrer" href={`https://www.google.com/maps?q=${lat},${lng}`}>Open in Google Maps ({lat.toFixed(3)}, {lng.toFixed(3)})</a>
          </Reveal>
        </div>
        <aside className="space-y-4">
          <div className="glass rounded-3xl p-6 space-y-4 text-sm">
            <Info icon={Calendar} label="Best time to visit" value={a.bestTime} />
            <Info icon={Clock} label="Suggested duration" value={a.duration} />
            <Info icon={Ticket} label="Entrance fees" value={a.verified ? "See booking" : "Awaiting verification"} />
            <Info icon={Phone} label="Official contact" value={a.verified ? "Verified" : "Awaiting verification"} />
            <Info icon={ShieldAlert} label="Safety" value="Follow ranger and guide instructions at all times." />
          </div>
          {!a.verified && <p className="rounded-2xl border border-gold/40 bg-gold/10 p-4 text-xs text-gold">Fees, hours and contacts for this attraction are awaiting verification. We never publish unverified contact details.</p>}
        </aside>
      </section>

      {related.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 pb-24">
          <h2 className="mb-8 text-3xl">Related attractions</h2>
          <div className="grid gap-6 md:grid-cols-3">{related.map((r) => <AttractionCard key={r.slug} a={r} />)}</div>
        </section>
      )}

      <Link to="/book" search={{ attraction: a.slug }}
        className="glass-strong fixed bottom-6 right-6 z-40 rounded-full px-7 py-4 font-semibold shadow-glow transition hover:scale-105">
        Book now
      </Link>
    </>
  );
}

function Info({ icon: Icon, label, value }: { icon: typeof Clock; label: string; value: string }) {
  return <div className="flex gap-3"><Icon className="mt-0.5 h-4 w-4 shrink-0 text-gold" /><div><p className="text-muted-foreground">{label}</p><p>{value}</p></div></div>;
}
