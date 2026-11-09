import { createFileRoute, Link } from '@tanstack/react-router';
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';
import { savedItineraries } from '@/lib/itinerary.functions';
import { PlanView } from '@/routes/itinerary';
import type { ItineraryPlan } from '@/lib/itinerary-validation';
import { Button } from '@/components/ui/button';
import { ItineraryQuestions } from '@/components/site/ItineraryQuestions';
const options = queryOptions({ queryKey: ['saved-itineraries'], queryFn: () => savedItineraries(), staleTime: 0 });
export const Route = createFileRoute('/_authenticated/my-itineraries')({
  loader: ({ context }) => context.queryClient.ensureQueryData(options),
  head: () => ({ meta: [{ title: 'My Itineraries | Visit Rwanda Academy' }, { name: 'description', content: 'Revisit your saved personalized Rwanda travel plans.' }, { property: 'og:title', content: 'My Itineraries | Visit Rwanda Academy' }, { property: 'og:description', content: 'Your private saved Rwanda itineraries.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' }] }),
  component: SavedItineraries,
});
function SavedItineraries() {
  const { data } = useSuspenseQuery(options);
  return <main className="mx-auto min-h-screen max-w-4xl px-6 pb-24 pt-36"><div className="flex flex-wrap items-center justify-between gap-4"><h1 className="text-4xl">My itineraries</h1><Button asChild><Link to="/itinerary">Plan a trip</Link></Button></div>{!data.length && <p className="mt-10 text-muted-foreground">No saved itineraries yet.</p>}<div className="mt-10 space-y-8">{data.map((item, i) => <details key={item.id} open={i === 0} className="border-t border-border py-6"><summary className="mb-6 cursor-pointer text-lg">Trip saved {new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeZone: 'Africa/Kigali' }).format(new Date(item.created_at))}</summary><PlanView plan={item.plan as unknown as ItineraryPlan}/><ItineraryQuestions key={item.id} itineraryId={item.id}/></details>)}</div></main>;
}