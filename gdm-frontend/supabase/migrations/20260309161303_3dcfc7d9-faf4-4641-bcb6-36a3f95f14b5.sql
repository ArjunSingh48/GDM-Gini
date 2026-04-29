
-- Recommendation history table for smart daily focus
CREATE TABLE public.recommendation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  recommendation TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  status TEXT NOT NULL DEFAULT 'pending',
  shown_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.recommendation_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own recommendations" ON public.recommendation_history FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Medical reports table
CREATE TABLE public.medical_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL DEFAULT 'pdf',
  uploaded_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.medical_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own reports" ON public.medical_reports FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
