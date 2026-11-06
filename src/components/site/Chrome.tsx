import { Link } from "@tanstack/react-router";
import { motion, useScroll, useSpring } from "framer-motion";
import { useEffect, useState, type ReactNode } from "react";
import { Menu, X, Mountain } from "lucide-react";
import { Button } from '@/components/ui/button';
import { useVisitorSession } from './VisitorSession';

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 25 });
  return <motion.div style={{ scaleX }} className="fixed inset-x-0 top-0 z-[60] h-[3px] origin-left bg-brand-gradient shadow-glow" />;
}

const links = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About Rwanda" },
  { to: "/destinations", label: "Destinations" },
  { to: "/book", label: "Book" },
] as const;

export function Navbar() {
  const { user, loading } = useVisitorSession();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40);
    on();
    window.addEventListener("scroll", on);
    return () => window.removeEventListener("scroll", on);
  }, []);
  return (
    <header className="fixed inset-x-0 top-3 z-50 px-4">
      <nav className={`mx-auto flex max-w-6xl items-center justify-between rounded-full px-5 py-3 transition-all duration-500 ${scrolled ? "glass-strong shadow-elegant" : "glass"}`}>
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-semibold">
          <Mountain className="h-5 w-5 text-gold" /> Visit Rwanda
        </Link>
        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link key={l.to} to={l.to} activeOptions={{ exact: l.to === "/" }}
              className="rounded-full px-4 py-2 text-sm text-muted-foreground transition hover:text-foreground"
              activeProps={{ className: "rounded-full px-4 py-2 text-sm bg-glass text-foreground" }}>
              {l.label}
            </Link>
          ))}
        </div>
        <Button asChild variant="outline" className="hidden md:inline-flex"><Link to={user ? '/account' : '/auth'}>{loading ? 'Account' : user ? 'My bookings' : 'Sign in'}</Link></Button>
        <Button variant="ghost" size="icon" className="md:hidden" aria-label="Menu" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</Button>
      </nav>
      {open && (
        <div className="glass-strong mx-auto mt-2 flex max-w-6xl flex-col rounded-3xl p-4 md:hidden">
          {links.map((l) => <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="rounded-xl px-4 py-3">{l.label}</Link>)}
          <Button asChild variant="outline"><Link to={user ? '/account' : '/auth'} onClick={() => setOpen(false)}>{user ? 'My bookings' : 'Sign in'}</Link></Button>
        </div>
      )}
    </header>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-border bg-forest/30 px-6 pb-10 pt-16">
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="flex items-center gap-2 font-display text-2xl"><Mountain className="h-6 w-6 text-gold" /> Visit Rwanda</p>
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">The Land of a Thousand Hills — gorillas, rainforests, lakes and a culture of warm welcome.</p>
        </div>
        <div className="space-y-2 text-sm">
          <p className="eyebrow">Explore</p>
          <Link to="/destinations" className="block text-muted-foreground hover:text-foreground">Destinations</Link>
          <Link to="/about" className="block text-muted-foreground hover:text-foreground">About Rwanda</Link>
          <Link to="/book" className="block text-muted-foreground hover:text-foreground">Book an experience</Link>
        </div>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p className="eyebrow">Note</p>
          <p>Prices, contacts and opening hours are shown only once verified by our team.</p>
        </div>
      </div>
      <p className="mx-auto mt-12 max-w-6xl text-xs text-muted-foreground">© {new Date().getFullYear()} Visit Rwanda — demo content for development.</p>
    </footer>
  );
}

export function Reveal({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div className={className} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  );
}

export function SectionTitle({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) {
  return (
    <Reveal className="mb-12 max-w-2xl">
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="mt-3 text-4xl font-medium md:text-5xl">{title}</h2>
      {sub && <p className="mt-4 text-muted-foreground">{sub}</p>}
    </Reveal>
  );
}
