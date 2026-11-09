import { describe, expect, it } from 'vitest';
import { ownedItinerary, itineraryQuestionContext } from '@/lib/itinerary-chat-validation';

describe('itinerary question grounding', () => {
  it('rejects another visitor’s itinerary', () => {
    expect(() => ownedItinerary({ user_id: 'another-visitor' }, 'current-visitor')).toThrow();
    expect(ownedItinerary({ user_id: 'current-visitor' }, 'current-visitor').user_id).toBe('current-visitor');
  });
  it('carries the saved dates, budget and stops into the model context', () => {
    const context = itineraryQuestionContext({ preferences: { startDate: '2026-11-20', endDate: '2026-11-22', budget: 1500 }, plan: { days: [{ stops: [{ slug: 'lake-kivu' }] }] } });
    const saved = JSON.parse(context.slice(context.indexOf('Saved trip: ') + 12));
    expect(saved.preferences).toEqual({ startDate: '2026-11-20', endDate: '2026-11-22', budget: 1500 });
    expect(saved.plan.days[0].stops[0].slug).toBe('lake-kivu');
  });
});