import { describe, it, expect } from 'vitest';
import { packingContext, packingRequest } from '@/lib/packing-validation';
import { validateGeneratedPlan } from '@/lib/itinerary-validation';
import { attractions } from '@/data/attractions';

describe('packing grounding', () => {
  it('includes exact saved travel dates, stops and budget', () => {
    const trip = { preferences: { startDate: '2026-11-20', endDate: '2026-11-22', budget: 1500 }, plan: { days: [{ stops: [{ slug: 'lake-kivu' }] }] } };
    const context = packingContext(trip);
    expect(JSON.parse(context.split('Saved trip: ')[1] ?? '')).toEqual(trip);
  });
  it('requires itinerary identity and nonempty packing needs', () => {
    expect(packingRequest.safeParse({ itineraryId: 'invalid', needs: 'carry-on' }).success).toBe(false);
    expect(packingRequest.safeParse({ itineraryId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', needs: ' ' }).success).toBe(false);
  });
  it('retains derived dates for every bookable itinerary day', () => {
    const destination = attractions[0]; if (!destination) throw new Error('Catalog missing');
    const plan = validateGeneratedPlan({ title: 'Trip', summary: '', budgetNotes: '', warnings: [], days: [0,1].map(() => ({ theme: 'Wildlife', transfer: '', stops: [{ slug: destination.slug, time: 'Morning', activity: destination.activities[0], notes: '' }] })) }, { startDate: '2026-11-20', endDate: '2026-11-21', budget: 1500, interests: 'Wildlife', destinations: [destination.slug] });
    expect(plan.days.map(day => day.date)).toEqual(['2026-11-20','2026-11-21']);
  });
});