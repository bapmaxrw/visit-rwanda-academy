CREATE TABLE public.itinerary_conversations (
 itinerary_id uuid PRIMARY KEY REFERENCES public.itineraries(id) ON DELETE CASCADE,
 user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
 messages jsonb NOT NULL DEFAULT '[]'::jsonb,
 revision integer NOT NULL DEFAULT 0,
 updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.itinerary_conversations TO authenticated;
GRANT ALL ON public.itinerary_conversations TO service_role;
ALTER TABLE public.itinerary_conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners read itinerary conversations" ON public.itinerary_conversations FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Owners create itinerary conversations" ON public.itinerary_conversations FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() AND EXISTS (SELECT 1 FROM public.itineraries i WHERE i.id = itinerary_id AND i.user_id = auth.uid()));
CREATE POLICY "Owners update itinerary conversations" ON public.itinerary_conversations FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid() AND EXISTS (SELECT 1 FROM public.itineraries i WHERE i.id = itinerary_id AND i.user_id = auth.uid()));