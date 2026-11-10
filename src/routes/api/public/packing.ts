import { createFileRoute } from '@tanstack/react-router';
export const Route = createFileRoute('/api/public/packing')({ server: { handlers: {
  POST: async ({ request }) => {
    const key = process.env['LOVABLE_API_KEY'];
    const url = process.env['SUPABASE_URL'];
    const publishableKey = process.env['SUPABASE_PUBLISHABLE_KEY'];
    if (!key || !url || !publishableKey) return Response.json({ message: 'The packing guide is not configured.' }, { status: 503 });
    const { generatePacking } = await import('@/lib/packing.server');
    return generatePacking(request, { key, url, publishableKey });
  },
} } });