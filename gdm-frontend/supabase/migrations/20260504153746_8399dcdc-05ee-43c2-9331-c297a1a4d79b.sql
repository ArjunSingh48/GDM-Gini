
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS prolific_pid text;
CREATE INDEX IF NOT EXISTS idx_profiles_prolific_pid ON public.profiles(prolific_pid);

ALTER TABLE public.participants ADD COLUMN IF NOT EXISTS user_id uuid;
CREATE INDEX IF NOT EXISTS idx_participants_user_id ON public.participants(user_id);

ALTER TABLE public.chat_logs ADD COLUMN IF NOT EXISTS user_id uuid;
CREATE INDEX IF NOT EXISTS idx_chat_logs_user_id ON public.chat_logs(user_id);

CREATE TABLE IF NOT EXISTS public.study_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pid text NOT NULL,
  user_id uuid NOT NULL,
  consent_given boolean NOT NULL DEFAULT true,
  consent_at timestamptz DEFAULT now(),
  session_start timestamptz NOT NULL DEFAULT now(),
  session_end timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE (pid, user_id)
);
CREATE INDEX IF NOT EXISTS idx_study_sessions_pid ON public.study_sessions(pid);
CREATE INDEX IF NOT EXISTS idx_study_sessions_user_id ON public.study_sessions(user_id);

ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own study sessions" ON public.study_sessions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own study sessions" ON public.study_sessions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own study sessions" ON public.study_sessions
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.consent_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pid text,
  consent_given boolean NOT NULL,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_consent_events_pid ON public.consent_events(pid);

ALTER TABLE public.consent_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can log consent" ON public.consent_events
  FOR INSERT TO anon, authenticated WITH CHECK (true);
