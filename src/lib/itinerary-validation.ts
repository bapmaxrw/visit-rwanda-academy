import { z } from 'zod';
import { attractions } from '@/data/attractions';
import { kigaliToday } from './booking-validation';

const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(v => !Number.isNaN(Date.parse(v)) && new Date(v).toISOString().slice(0, 10) === v, 'Choose a valid date');
export const itineraryPreferences = z.object({
  startDate: date, endDate: date,
  interests: z.string().trim().min(1, 'Tell us your interests').max(2000),
  budget: z.coerce.number().positive().max(1000000),
  destinations: z.array(z.string().refine(v => attractions.some(a => a.slug === v), 'Choose a listed destination')).max(29),
}).refine(v => v.startDate >= kigaliToday(), 'Choose today or a future departure')
  .refine(v => v.endDate >= v.startDate, 'Return date must follow departure')
  .refine(v => (Date.parse(v.endDate) - Date.parse(v.startDate)) / 86400000 < 14, 'Choose a trip of up to 14 days');
export type ItineraryPreferences = z.infer<typeof itineraryPreferences>;
export const generatedPlanSchema = z.object({
  title: z.string(), summary: z.string(), budgetNotes: z.string(), warnings: z.array(z.string()),
  days: z.array(z.object({
    theme: z.string(), transfer: z.string(),
    stops: z.array(z.object({ slug: z.string(), time: z.enum(['Morning', 'Afternoon']), activity: z.string(), notes: z.string() }).strict()),
  }).strict()),
}).strict();
export type ItineraryPlan = z.infer<typeof generatedPlanSchema> & { days: (z.infer<typeof generatedPlanSchema>['days'][number] & { date: string })[] };
export function validateGeneratedPlan(raw: unknown, preferences: ItineraryPreferences): ItineraryPlan {
  const plan = generatedPlanSchema.parse(raw);
  const count = Math.round((Date.parse(preferences.endDate) - Date.parse(preferences.startDate)) / 86400000) + 1;
  if (plan.days.length !== count) throw new Error('The itinerary did not cover your travel dates. Please start a new request.');
  const used = new Set<string>();
  const days = plan.days.map((day, index) => {
    if (!day.stops.length || day.stops.length > 3) throw new Error('The itinerary contains an invalid daily schedule.');
    day.stops.forEach(stop => {
      const attraction = attractions.find(a => a.slug === stop.slug);
      if (!attraction || !attraction.activities.includes(stop.activity)) throw new Error('The itinerary contains an unrecognized activity.');
      used.add(stop.slug);
    });
    return { ...day, date: new Date(Date.parse(preferences.startDate) + index * 86400000).toISOString().slice(0, 10) };
  });
  if (preferences.destinations.some(slug => !used.has(slug))) throw new Error('The itinerary missed a preferred destination. Please start a new request.');
  return { ...plan, days };
}