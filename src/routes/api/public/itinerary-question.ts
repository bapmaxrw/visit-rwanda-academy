import { createFileRoute } from '@tanstack/react-router';
export const Route = createFileRoute('/api/public/itinerary-question')({ server: { handlers: {
  POST: async ({ request }) => {
    const key = process.env['LOVABLE_API_KEY'];
    const url = process.env['SUPABASE_URL'];
    const publishableKey = process.env['SUPABASE_PUBLISHABLE_KEY'];
    if (!key || !url || !publishableKey) return Response.json({ message: 'The itinerary question service is not configured.' }, { status: 503 });
    const { answerItineraryQuestion } = await import('@/lib/itinerary-chat.server');
    return answerItineraryQuestion(request, { key, url, publishableKey });
  },
} } });