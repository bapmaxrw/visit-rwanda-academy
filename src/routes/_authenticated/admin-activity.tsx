import { createFileRoute } from '@tanstack/react-router';
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';
import { useState, Suspense } from 'react';
import { Clock3, RefreshCw, ShieldCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import { administratorAccess, administratorActivity } from '@/lib/admin.functions';
import { Button } from '@/components/ui/button';

const accessOptions = queryOptions({ queryKey: ['administrator-access'], queryFn: () => administratorAccess() });
export const Route = createFileRoute('/_authenticated/admin-activity')({
  loader: ({ context }) => context.queryClient.ensureQueryData(accessOptions),
  head: () => ({ meta: [{ title: 'Administrator Activity | Visit Rwanda Academy' }, { name: 'description', content: 'Review administrator actions and their timestamps.' }, { property: 'og:title', content: 'Administrator Activity | Visit Rwanda Academy' }, { property: 'og:description', content: 'Private administrator activity history.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' }] }),
  component: AdminActivity,
});
type Filters = { page: number; actor: string; action: 'all' | 'booking' | 'destination_prices' | 'user_roles'; from: string; to: string };
function AdminActivity() {
  const { data: allowed } = useSuspenseQuery(accessOptions);
  const [filters, setFilters] = useState<Filters>({ page: 0, actor: '', action: 'all', from: '', to: '' });
  return <section className="mx-auto min-h-screen max-w-6xl px-6 pb-24 pt-36">
    <p className="eyebrow">Administration</p><h1 className="mt-3 flex items-center gap-3 text-4xl"><ShieldCheck className="size-8 text-gold"/>Activity history</h1>
    {!allowed ? <p role="alert" className="mt-8 text-muted-foreground">Administrator access required.</p> : <>
      <form className="mt-10 grid gap-4 border-y border-border py-6 sm:grid-cols-2 lg:grid-cols-5" onSubmit={e => { e.preventDefault(); const form = new FormData(e.currentTarget); const action = form.get('action'); setFilters({ page: 0, actor: String(form.get('actor') ?? ''), action: action === 'booking' || action === 'destination_prices' || action === 'user_roles' ? action : 'all', from: String(form.get('from') ?? ''), to: String(form.get('to') ?? '') }); }}>
        <label className="text-sm">Administrator email<input name="actor" type="search" className="mt-2 w-full rounded-lg border border-input bg-background p-3"/></label>
        <label className="text-sm">Action<select name="action" className="mt-2 w-full rounded-lg border border-input bg-background p-3"><option value="all">All actions</option><option value="booking">Booking reviews</option><option value="destination_prices">Price changes</option><option value="user_roles">Access changes</option></select></label>
        <label className="text-sm">From (Kigali)<input name="from" type="date" className="mt-2 w-full rounded-lg border border-input bg-background p-3"/></label><label className="text-sm">To (Kigali)<input name="to" type="date" className="mt-2 w-full rounded-lg border border-input bg-background p-3"/></label><Button className="self-end">Apply filters</Button>
      </form>
      <Suspense fallback={<p role="status" className="py-8">Loading activity…</p>}><ActivityRows filters={filters} setPage={page => setFilters({ ...filters, page })}/></Suspense>
    </>}
  </section>;
}
function ActivityRows({ filters, setPage }: { filters: Filters; setPage: (page: number) => void }) {
  const { data, refetch } = useSuspenseQuery(queryOptions({ queryKey: ['admin-activity', filters], queryFn: () => administratorActivity({ data: filters }) }));
  return <><div className="flex items-center justify-between py-5"><p className="text-sm text-muted-foreground">{data.count} recorded actions · Kigali time (UTC+2)</p><Button variant="ghost" size="icon" aria-label="Refresh activity" title="Refresh activity" onClick={() => void refetch()}><RefreshCw className="size-4"/></Button></div>
    {!data.rows.length && <p className="border-y border-border py-12 text-muted-foreground">No recorded actions match these filters.</p>}
    <div className="divide-y divide-border">{data.rows.map(row => <article key={row.id} className="grid gap-3 py-6 md:grid-cols-[220px_1fr_220px]">
      <div><p className="font-semibold">{row.actor_name}</p><p className="break-all text-sm text-muted-foreground">{row.actor_email || 'System / managed operation'}</p><p className="mt-1 break-all font-mono text-xs text-muted-foreground">{row.actor_id ?? 'No signed-in actor'}</p></div>
      <div className="min-w-0"><p className="font-semibold text-gold">{row.action.replaceAll('_', ' ').replace('.', ' · ')}</p><p className="mt-1 break-all text-xs text-muted-foreground">{row.resource_type} · {row.resource_id}</p><details className="mt-3 text-sm"><summary className="cursor-pointer">Action details</summary><pre className="mt-3 whitespace-pre-wrap break-all rounded-lg bg-muted p-3 text-xs">{JSON.stringify(row.details, null, 2)}</pre></details></div>
      <time className="flex items-start gap-2 text-sm text-muted-foreground" dateTime={row.created_at}><Clock3 className="size-4 shrink-0"/>{new Intl.DateTimeFormat('en-GB', { timeZone: 'Africa/Kigali', dateStyle: 'medium', timeStyle: 'medium' }).format(new Date(row.created_at))}</time>
    </article>)}</div><div className="mt-6 flex items-center justify-end gap-4"><Button variant="outline" size="icon" title="Previous page" aria-label="Previous page" disabled={filters.page === 0} onClick={() => setPage(filters.page - 1)}><ChevronLeft/></Button><span className="text-sm">Page {filters.page + 1}</span><Button variant="outline" size="icon" title="Next page" aria-label="Next page" disabled={(filters.page + 1) * 25 >= data.count} onClick={() => setPage(filters.page + 1)}><ChevronRight/></Button></div>
  </>;
}