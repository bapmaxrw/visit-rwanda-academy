import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { attractions, categories, kivu } from "@/data/attractions";
import { AttractionCard } from "@/components/site/AttractionCard";
import { Reveal } from "@/components/site/Chrome";

export const Route = createFileRoute("/destinations/")({
  head: () => ({
    meta: [
      { title: "Destinations & Attractions in Rwanda | Visit Rwanda" },
      { name: "description", content: "Browse national parks, lakes, mountains, museums and Kigali attractions across Rwanda's five provinces." },
      { property: "og:title", content: "Destinations & Attractions in Rwanda" },
      { property: "og:description", content: "National parks, lakes, mountains, museums and Kigali highlights." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Destinations,
});

function Destinations() {
  const [cat, setCat] = useState<string>("All");
  const [q, setQ] = useState("");
  const list = useMemo(() => attractions.filter((a) =>
    (cat === "All" || a.category === cat) && (a.name + a.district + a.province).toLowerCase().includes(q.toLowerCase())), [cat, q]);
  return (
    <>
      <section className="relative flex h-[60vh] items-end overflow-hidden">
        <img src={kivu} alt="Lake Kivu" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-hero-overlay" />
        <div className="relative mx-auto w-full max-w-6xl px-6 pb-12">
          <p className="eyebrow">Destinations</p>
          <h1 className="mt-3 text-5xl md:text-7xl">Explore Rwanda</h1>
          <p className="mt-3 max-w-xl text-muted-foreground">A growing directory across all five provinces — not yet exhaustive, and expanding as our team verifies new places.</p>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="glass-strong sticky top-24 z-30 mb-10 flex flex-col gap-3 rounded-3xl p-3 md:flex-row md:items-center">
          <div className="flex flex-1 items-center gap-2 px-3"><Search className="h-4 w-4 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search attractions, districts…" className="w-full bg-transparent py-2 outline-none" /></div>
          <div className="flex flex-wrap gap-2">
            {["All", ...categories].map((c) => (
              <button key={c} onClick={() => setCat(c)} className={`rounded-full px-4 py-2 text-sm transition ${cat === c ? "bg-accent text-accent-foreground" : "glass"}`}>{c}</button>
            ))}
          </div>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((a, i) => <Reveal key={a.slug} delay={(i % 3) * 0.06}><AttractionCard a={a} /></Reveal>)}
        </div>
        {list.length === 0 && <p className="py-20 text-center text-muted-foreground">No attractions match your search.</p>}
      </section>
    </>
  );
}
