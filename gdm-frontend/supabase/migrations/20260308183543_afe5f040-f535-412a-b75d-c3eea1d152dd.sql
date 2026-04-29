
-- Storage bucket for meal photos
INSERT INTO storage.buckets (id, name, public) VALUES ('meal-photos', 'meal-photos', true);

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  name TEXT,
  age INTEGER,
  pregnancy_week INTEGER,
  pre_pregnancy_bmi NUMERIC,
  previous_gdm BOOLEAN DEFAULT false,
  family_diabetes_history BOOLEAN DEFAULT false,
  risk_level TEXT DEFAULT 'Low',
  cultural_preference TEXT,
  doctor_name TEXT,
  doctor_phone TEXT,
  doctor_clinic TEXT,
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Glucose logs
CREATE TABLE public.glucose_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  fasting_glucose NUMERIC,
  post_meal_glucose NUMERIC,
  weight NUMERIC,
  mood TEXT,
  notes TEXT,
  logged_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.glucose_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own glucose logs" ON public.glucose_logs FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Activity completions
CREATE TABLE public.activity_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  activity_id TEXT NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.activity_completions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own activities" ON public.activity_completions FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Meal analyses
CREATE TABLE public.meal_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  image_url TEXT NOT NULL,
  detected_foods JSONB DEFAULT '[]',
  balance_evaluation JSONB DEFAULT '{}',
  suggestions TEXT[] DEFAULT '{}',
  educational_snippet TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.meal_analyses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own meal analyses" ON public.meal_analyses FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Metabolic insights
CREATE TABLE public.metabolic_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  insight_type TEXT NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.metabolic_insights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own insights" ON public.metabolic_insights FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Storage policies for meal-photos
CREATE POLICY "Users can upload meal photos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'meal-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users can view own meal photos" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'meal-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Public can view meal photos" ON storage.objects FOR SELECT TO anon USING (bucket_id = 'meal-photos');

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id)
  VALUES (new.id);
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
