import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { MapPin, ArrowUpRight } from "lucide-react";
import type { Attraction } from "@/data/attractions";

export function AttractionCard({ a, tall = false }: { a: Attraction; tall?: boolean }) {
  return (
    <motion.div whileHover={{ y: -8, rotateX: 3, rotateY: -3 }} transition={{ type: "spring", stiffness: 200, damping: 18 }} style={{ transformPerspective: 900 }}>
      <Link to="/destinations/$slug" params={{ slug: a.slug }}
        className={`group relative block overflow-hidden rounded-3xl shadow-elegant ${tall ? "h-[30rem]" : "h-80"}`}>
        <img src={a.image} alt={a.name} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-110" />
        <div className="absolute inset-0 bg-card-overlay" />
        <span className="glass absolute left-4 top-4 rounded-full px-3 py-1 text-xs">{a.category}</span>
        <span className="glass absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full opacity-0 transition group-hover:opacity-100"><ArrowUpRight className="h-4 w-4" /></span>
        <div className="absolute inset-x-0 bottom-0 p-6">
          <p className="flex items-center gap-1 text-xs text-gold"><MapPin className="h-3 w-3" />{a.province} Province · {a.district}</p>
          <h3 className="mt-1 text-2xl">{a.name}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{a.short}</p>
        </div>
      </Link>
    </motion.div>
  );
}
