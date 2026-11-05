import { createFileRoute } from "@tanstack/react-router";
import { hills, culture, kigali, akagera, nyungwe, gorilla } from "@/data/attractions";
import { Reveal, SectionTitle } from "@/components/site/Chrome";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Rwanda — History, Culture & Nature | Visit Rwanda" },
      { name: "description", content: "Learn about Rwanda's history, geography, culture, languages, climate, national parks and conservation success." },
      { property: "og:title", content: "About Rwanda — History, Culture & Nature" },
      { property: "og:description", content: "Rwanda's history, geography, culture, climate and conservation." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: About,
});

const facts = [
  ["History", "A kingdom for centuries, Rwanda has rebuilt remarkably since the 1994 Genocide against the Tutsi, emphasising unity, reconciliation and remembrance.", culture],
  ["Geography", "A landlocked country of about 26,000 km² in East-Central Africa, with volcanoes in the north-west, rainforest in the south-west and savannah in the east.", hills],
  ["Culture & traditions", "Intore dance, drumming, Imigongo art and Umuganda community work define a culture of togetherness.", culture],
  ["People & lifestyle", "Warm, community-focused and young — Kigali blends innovation with tradition.", kigali],
  ["Languages", "Kinyarwanda, English, French and Swahili are official languages.", kigali],
  ["Climate", "Temperate highland climate, averaging around 20°C, with two rainy and two dry seasons.", nyungwe],
  ["Economy & tourism", "Tourism is a leading foreign exchange earner, with a focus on high-value, low-impact travel and conferences.", kigali],
  ["National parks", "Volcanoes, Akagera, Nyungwe and Gishwati-Mukura protect most of Rwanda's biodiversity.", akagera],
  ["Wildlife conservation", "Gorilla numbers in the Virungas have grown, and lions and rhinos were reintroduced to Akagera.", gorilla],
] as const;

function About() {
  return (
    <>
      <section className="relative flex h-[70vh] items-end overflow-hidden">
        <img src={hills} alt="Rwanda hills" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-hero-overlay" />
        <div className="relative mx-auto w-full max-w-6xl px-6 pb-16">
          <p className="eyebrow">About Rwanda</p>
          <h1 className="mt-3 text-5xl md:text-7xl">The heart of Africa</h1>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-6 py-20">
        <SectionTitle eyebrow="Know before you go" title="Rwanda at a glance" />
        <div className="grid gap-6 md:grid-cols-3">
          {facts.map(([t, d, img], i) => (
            <Reveal key={t} delay={(i % 3) * 0.1}>
              <article className="glass h-full overflow-hidden rounded-3xl">
                <img src={img} alt={t} loading="lazy" className="h-40 w-full object-cover" />
                <div className="p-6"><h2 className="text-2xl">{t}</h2><p className="mt-2 text-sm text-muted-foreground">{d}</p></div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <SectionTitle eyebrow="Map" title="Explore the country" />
        <Reveal>
          <iframe title="Map of Rwanda" className="h-[480px] w-full rounded-3xl border border-border"
            src="https://www.openstreetmap.org/export/embed.html?bbox=28.8%2C-2.85%2C30.9%2C-1.05&layer=mapnik" loading="lazy" />
        </Reveal>
      </section>
    </>
  );
}
