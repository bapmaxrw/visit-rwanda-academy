import { createFileRoute, Link } from "@tanstack/react-router";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Compass, Leaf, Mountain, Sun, Plane, Shield, Quote, Mail } from "lucide-react";
import { attractions, hills, gorilla, akagera, nyungwe, kivu, culture, bisoke, kigali } from "@/data/attractions";
import { AttractionCard } from "@/components/site/AttractionCard";
import { Reveal, SectionTitle } from "@/components/site/Chrome";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Visit Rwanda — Discover the Land of a Thousand Hills" },
      { name: "description", content: "Gorilla trekking, rainforest canopy walks, Big Five safaris and Lake Kivu sunsets. Plan and book your Rwanda journey." },
      { property: "og:title", content: "Visit Rwanda — Discover the Land of a Thousand Hills" },
      { property: "og:description", content: "Gorillas, rainforests, savannah and lakes. Plan and book your Rwanda journey." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const words = ["Discover", "Explore", "Experience", "Feel", "Love"];

function Hero() {
  const [i, setI] = useState(0);
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % words.length), 2400);
    return () => clearInterval(t);
  }, []);
  return (
    <section ref={ref} className="relative flex h-screen min-h-[640px] items-center overflow-hidden">
      {/* Background video will be managed by administrators; image fallback for now */}
      <motion.img style={{ y }} src={hills} alt="Misty green hills of Rwanda at sunrise" width={1920} height={1088}
        className="absolute inset-0 h-[120%] w-full scale-105 object-cover" />
      <div className="absolute inset-0 bg-hero-overlay" />
      <div className="relative mx-auto w-full max-w-6xl px-6">
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="eyebrow">Rwanda – The Land of a Thousand Hills</motion.p>
        <h1 className="mt-6 text-5xl font-light leading-[1.05] md:text-8xl">
          <span className="relative inline-block h-[1.1em] overflow-hidden align-bottom">
            <AnimatePresence mode="wait">
              <motion.span key={words[i]} className="inline-block text-gradient italic"
                initial={{ y: "100%", opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: "-100%", opacity: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>{words[i]}</motion.span>
            </AnimatePresence>
          </span>{" "}
          <br />Rwanda.
        </h1>
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-6 max-w-lg text-lg text-muted-foreground">
          Discover. Explore. Experience. Gorillas in the mist, ancient rainforest and lakes that glow at dusk.
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="mt-10 flex flex-wrap gap-4">
          <Link to="/destinations" className="group inline-flex items-center gap-2 rounded-full bg-accent px-7 py-4 font-semibold text-accent-foreground transition hover:shadow-glow">
            Explore Destinations <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
          </Link>
          <Link to="/book" className="glass inline-flex items-center gap-2 rounded-full px-7 py-4 font-semibold transition hover:bg-glass-border">Book Your Experience</Link>
        </motion.div>
      </div>
      <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute bottom-8 left-1/2 h-12 w-7 -translate-x-1/2 rounded-full border border-glass-border">
        <span className="mx-auto mt-2 block h-2 w-1 rounded-full bg-gold" />
      </motion.div>
    </section>
  );
}

function Split({ img, eyebrow, title, text, reverse, to }: { img: string; eyebrow: string; title: string; text: string; reverse?: boolean; to: string }) {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <div className={`grid items-center gap-12 md:grid-cols-2 ${reverse ? "md:[&>*:first-child]:order-2" : ""}`}>
        <Reveal><div className="overflow-hidden rounded-[2rem] shadow-elegant"><img src={img} alt={title} loading="lazy" className="h-[28rem] w-full object-cover transition duration-1000 hover:scale-105" /></div></Reveal>
        <Reveal delay={0.15}>
          <p className="eyebrow">{eyebrow}</p>
          <h2 className="mt-3 text-4xl md:text-5xl">{title}</h2>
          <p className="mt-5 text-muted-foreground">{text}</p>
          <a href={to} className="mt-8 inline-flex items-center gap-2 text-gold hover:underline">Learn more <ArrowRight className="h-4 w-4" /></a>
        </Reveal>
      </div>
    </section>
  );
}

function Index() {
  const featured = attractions.filter((a) => a.featured);
  const popular = attractions.filter((a) => ["Kigali", "Culture & History"].includes(a.category)).slice(0, 6);
  return (
    <>
      <Hero />

      {/* Intro */}
      <section className="mx-auto max-w-6xl px-6 py-28">
        <div className="grid gap-12 md:grid-cols-[1.2fr_1fr]">
          <Reveal>
            <p className="eyebrow">Welcome</p>
            <h2 className="mt-3 text-4xl leading-tight md:text-6xl">A small country with a <em className="text-gradient">boundless</em> heart.</h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="text-muted-foreground">Rwanda packs volcanoes, rainforests, savannah and Great Rift lakes into a country you can cross in a day. Clean, safe and welcoming, it is one of Africa's most rewarding destinations.</p>
            <div className="mt-8 grid grid-cols-3 gap-3">
              {[["4", "National parks"], ["1,000", "Hills"], ["5", "Provinces"]].map(([n, l]) => (
                <div key={l} className="glass rounded-2xl p-4 text-center"><p className="font-display text-3xl text-gold">{n}</p><p className="text-xs text-muted-foreground">{l}</p></div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Featured */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <SectionTitle eyebrow="Featured destinations" title="Where will Rwanda take you?" />
        <div className="grid gap-6 md:grid-cols-3">
          {featured.slice(0, 6).map((a, i) => <Reveal key={a.slug} delay={i * 0.08}><AttractionCard a={a} tall={i % 3 === 1} /></Reveal>)}
        </div>
        <div className="mt-10 text-center"><Link to="/destinations" className="glass inline-flex items-center gap-2 rounded-full px-6 py-3">View all {attractions.length} destinations <ArrowRight className="h-4 w-4" /></Link></div>
      </section>

      {/* Popular */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <SectionTitle eyebrow="Popular attractions" title="City life & living heritage" />
        <div className="flex snap-x gap-5 overflow-x-auto pb-4">
          {popular.map((a) => <div key={a.slug} className="w-72 shrink-0 snap-start"><AttractionCard a={a} /></div>)}
        </div>
      </section>

      <Split img={gorilla} eyebrow="Wildlife" title="Face to face with mountain gorillas" to="/destinations/volcanoes-national-park"
        text="Roughly a third of the world's mountain gorillas live in the Virungas. Add chimpanzees in Nyungwe and the Big Five in Akagera, and Rwanda becomes a complete wildlife journey." />
      <Split reverse img={bisoke} eyebrow="Adventure" title="Hike volcanoes, cycle the Congo Nile Trail" to="/destinations/mount-bisoke"
        text="Summit crater lakes, kayak Lake Kivu, zipline over Mount Kigali or cross the Nyungwe canopy walkway." />
      <Split img={culture} eyebrow="Culture" title="Drums, dance and royal heritage" to="/destinations/kings-palace-museum"
        text="Feel the energy of Intore dancers, visit the King's Palace in Nyanza and share a meal in a community cultural village." />

      {/* Lakes parallax band */}
      <section className="relative my-20 h-[70vh] overflow-hidden">
        <div className="absolute inset-0 bg-fixed bg-cover bg-center" style={{ backgroundImage: `url(${kivu})` }} />
        <div className="absolute inset-0 bg-hero-overlay" />
        <Reveal className="relative mx-auto flex h-full max-w-6xl flex-col justify-end px-6 pb-16">
          <p className="eyebrow">Lakes & landscapes</p>
          <h2 className="mt-3 max-w-2xl text-5xl md:text-6xl">Sunsets over Lake Kivu</h2>
          <Link to="/destinations/$slug" params={{ slug: "lake-kivu" }} className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-accent px-6 py-3 font-semibold text-accent-foreground">Discover the lakes <ArrowRight className="h-4 w-4" /></Link>
        </Reveal>
      </section>

      {/* Hotels */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <SectionTitle eyebrow="Stay" title="Where to stay" sub="Accommodation partners will be listed here once verified by our team." />
        <div className="grid gap-6 md:grid-cols-3">
          {[[nyungwe, "Rainforest lodges", "Nyungwe"], [kigali, "City hotels", "Kigali"], [kivu, "Lakeside retreats", "Lake Kivu"]].map(([img, t, p], i) => (
            <Reveal key={t} delay={i * 0.1}>
              <div className="glass overflow-hidden rounded-3xl">
                <img src={img} alt={t} loading="lazy" className="h-48 w-full object-cover" />
                <div className="p-6"><h3 className="text-xl">{t}</h3><p className="text-sm text-muted-foreground">{p}</p></div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Packages */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <SectionTitle eyebrow="Packages" title="Curated journeys" />
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { t: "Primate Trail", d: "5 days", s: "Volcanoes · Nyungwe · Gishwati", icon: Leaf },
            { t: "Big Five Safari", d: "3 days", s: "Akagera · Lake Ihema", icon: Sun },
            { t: "Hills & Lakes", d: "7 days", s: "Kigali · Kivu · Congo Nile Trail", icon: Mountain },
          ].map((p, i) => (
            <Reveal key={p.t} delay={i * 0.1}>
              <motion.div whileHover={{ y: -6 }} className="glass rounded-3xl p-8">
                <p.icon className="h-8 w-8 text-gold" />
                <h3 className="mt-6 text-2xl">{p.t}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{p.s}</p>
                <div className="mt-8 flex items-center justify-between">
                  <span className="rounded-full bg-primary/30 px-3 py-1 text-xs">{p.d}</span>
                  <Link to="/book" className="text-sm text-gold hover:underline">Enquire →</Link>
                </div>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Gallery */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <SectionTitle eyebrow="Gallery" title="Moments from the hills" />
        <div className="grid auto-rows-[180px] grid-cols-2 gap-4 md:grid-cols-4">
          {[hills, gorilla, akagera, nyungwe, kivu, culture, bisoke, kigali].map((src, i) => (
            <Reveal key={i} delay={i * 0.05} className={i === 0 ? "col-span-2 row-span-2" : i === 5 ? "row-span-2" : ""}>
              <img src={src} alt="Rwanda" loading="lazy" className="h-full w-full rounded-2xl object-cover transition duration-500 hover:scale-[1.03]" />
            </Reveal>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <SectionTitle eyebrow="Testimonials" title="Travellers say" sub="Sample testimonials for demonstration." />
        <div className="grid gap-6 md:grid-cols-3">
          {[["The hour with the gorillas changed how I see the world.", "Sample traveller, UK"], ["Kigali is the cleanest, friendliest city I've visited.", "Sample traveller, Kenya"], ["Akagera surprised us — lions on day one!", "Sample traveller, Germany"]].map(([q, n], i) => (
            <Reveal key={n} delay={i * 0.1}><div className="glass rounded-3xl p-8"><Quote className="h-6 w-6 text-gold" /><p className="mt-4 font-display text-xl">{q}</p><p className="mt-4 text-sm text-muted-foreground">{n}</p></div></Reveal>
          ))}
        </div>
      </section>

      {/* Travel info */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <SectionTitle eyebrow="Travel information" title="Before you go" />
        <div className="grid gap-4 md:grid-cols-4">
          {[[Plane, "Getting there", "Kigali International Airport connects Rwanda to major hubs."], [Sun, "Climate", "Mild year-round; dry seasons June–Sept and Dec–Feb."], [Compass, "Currency", "Rwandan Franc (RWF). Cards accepted in Kigali."], [Shield, "Safety", "Consistently ranked among Africa's safest destinations."]].map(([Icon, t, d]) => {
            const I = Icon as typeof Plane;
            return <Reveal key={t as string}><div className="glass h-full rounded-3xl p-6"><I className="h-6 w-6 text-sky" /><h3 className="mt-4 text-lg">{t as string}</h3><p className="mt-2 text-sm text-muted-foreground">{d as string}</p></div></Reveal>;
          })}
        </div>
      </section>

      <Newsletter />
    </>
  );
}

function Newsletter() {
  const [done, setDone] = useState(false);
  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <Reveal>
        <div className="relative overflow-hidden rounded-[2.5rem] bg-forest p-10 md:p-16">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-gold/30 blur-3xl" />
          <div className="absolute -bottom-20 left-10 h-72 w-72 rounded-full bg-sky/30 blur-3xl" />
          <div className="relative max-w-xl">
            <Mail className="h-8 w-8 text-gold" />
            <h2 className="mt-4 text-4xl md:text-5xl">Stories from the hills, in your inbox.</h2>
            {done ? <p className="mt-6 text-gold">Thank you — you're on the list!</p> : (
              <form onSubmit={(e) => { e.preventDefault(); setDone(true); }} className="glass mt-8 flex rounded-full p-1.5">
                <input required type="email" placeholder="Your email" aria-label="Email" className="flex-1 bg-transparent px-5 outline-none placeholder:text-muted-foreground" />
                <button className="rounded-full bg-accent px-6 py-3 font-semibold text-accent-foreground">Subscribe</button>
              </form>
            )}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
