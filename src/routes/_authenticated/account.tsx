import { createFileRoute, Link } from '@tanstack/react-router';
import { useSuspenseQuery, queryOptions, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { useState } from 'react';
import { visitorAccount, updateProfile } from '@/lib/visitor.functions';
import { Button } from '@/components/ui/button';
import { useVisitorSession } from '@/components/site/VisitorSession';
import { attractions } from '@/data/attractions';

const accountOptions = () => queryOptions({ queryKey: ['visitor-account'], queryFn: () => visitorAccount() });
export const Route = createFileRoute('/_authenticated/account')({
  loader: ({ context }) => context.queryClient.ensureQueryData(accountOptions()),
  head: () => ({ meta: [{ title: 'My Bookings & Profile | Visit Rwanda' }, { name: 'description', content: 'Review your Rwanda bookings and manage your visitor profile.' }, { property: 'og:title', content: 'My Bookings & Profile | Visit Rwanda' }, { property: 'og:description', content: 'Your visitor account and booking history.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }] }), component: Account,
});
function Account() {
  const { data } = useSuspenseQuery(accountOptions());
  const save = useServerFn(updateProfile);
  const { signOut } = useVisitorSession();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  return <section className="mx-auto min-h-screen max-w-5xl px-6 pb-24 pt-36">
    <div className="flex flex-wrap items-center justify-between gap-4"><div><p className="eyebrow">Visitor account</p><h1 className="mt-3 text-4xl">My bookings</h1></div><Button variant="outline" onClick={() => signOut().catch(() => setMessage('Unable to sign out. Try again.'))}>Sign out</Button></div>
    <div className="mt-10 grid gap-5">
      {!data.bookings.length && <div className="border-y border-border py-10"><p className="text-muted-foreground">No booking requests yet.</p><Button asChild className="mt-5"><Link to="/book">Book an experience</Link></Button></div>}
      {data.bookings.map(booking => { const destination = attractions.find(a => a.slug === booking.attraction_slug); return <article key={booking.id} className="grid gap-4 rounded-lg border border-border bg-card p-5 sm:grid-cols-[100px_1fr_auto]">
        {destination && <img src={destination.image} alt={destination.name} className="h-24 w-full rounded-lg object-cover"/>}
        <div className="min-w-0"><h2 className="text-2xl">{destination?.name ?? booking.attraction_slug}</h2><p className="mt-2 text-sm text-muted-foreground">{booking.visiting_date} · {booking.preferred_time} · {booking.visitors} visitors</p><p className="mt-2 break-all font-mono text-xs text-gold">{booking.reference}</p>{booking.special_requests && <p className="mt-2 text-sm">{booking.special_requests}</p>}</div><span className="text-sm font-semibold text-gold">{booking.status}</span>
      </article>; })}
    </div>
    <div className="mt-16 border-t border-border pt-10"><h2 className="text-3xl">My profile</h2><form className="mt-6 grid max-w-lg gap-4" onSubmit={async e => { e.preventDefault(); const form = new FormData(e.currentTarget); setBusy(true); setMessage(''); try { await save({ data: { display_name: String(form.get('display_name')), phone: String(form.get('phone')) } }); await queryClient.invalidateQueries({ queryKey: ['visitor-account'] }); setMessage('Profile saved.'); } catch { setMessage('Unable to save your profile. Try again.'); } finally { setBusy(false); } }}>
      <label>Full name<input name="display_name" required defaultValue={data.profile.display_name} className="mt-2 w-full rounded-lg border border-input bg-background p-3"/></label><label>Phone<input name="phone" type="tel" defaultValue={data.profile.phone} className="mt-2 w-full rounded-lg border border-input bg-background p-3"/></label><Button disabled={busy}>Save profile</Button></form><p role="status" className="mt-4 text-sm text-gold">{message}</p></div>
  </section>;
}