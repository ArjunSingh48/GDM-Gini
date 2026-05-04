
-- Participants
CREATE TABLE public.participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pid TEXT NOT NULL UNIQUE,
  session_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  completion_code TEXT,
  auth_user_id UUID
);
CREATE INDEX idx_participants_pid ON public.participants(pid);
CREATE INDEX idx_participants_auth_user ON public.participants(auth_user_id);

-- Survey responses
CREATE TABLE public.survey_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pid TEXT NOT NULL REFERENCES public.participants(pid) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  question_text TEXT,
  answer JSONB NOT NULL,
  time_spent_ms INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_survey_responses_pid ON public.survey_responses(pid);

-- Chat logs
CREATE TABLE public.chat_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pid TEXT NOT NULL REFERENCES public.participants(pid) ON DELETE CASCADE,
  user_query TEXT NOT NULL,
  bot_response TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_chat_logs_pid ON public.chat_logs(pid);

-- Helper: get pid from current auth user (stored in raw_user_meta_data.pid)
CREATE OR REPLACE FUNCTION public.current_pid()
RETURNS TEXT
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT (raw_user_meta_data->>'pid')::text
  FROM auth.users
  WHERE id = auth.uid()
$$;

-- Enable RLS
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_logs ENABLE ROW LEVEL SECURITY;

-- participants policies
CREATE POLICY "Participants can view own row"
ON public.participants FOR SELECT
TO authenticated
USING (pid = public.current_pid());

CREATE POLICY "Participants can insert own row"
ON public.participants FOR INSERT
TO authenticated
WITH CHECK (pid = public.current_pid());

CREATE POLICY "Participants can update own row"
ON public.participants FOR UPDATE
TO authenticated
USING (pid = public.current_pid())
WITH CHECK (pid = public.current_pid());

-- survey_responses policies
CREATE POLICY "Participants can view own responses"
ON public.survey_responses FOR SELECT
TO authenticated
USING (pid = public.current_pid());

CREATE POLICY "Participants can insert own responses"
ON public.survey_responses FOR INSERT
TO authenticated
WITH CHECK (pid = public.current_pid());

-- chat_logs policies
CREATE POLICY "Participants can view own chat logs"
ON public.chat_logs FOR SELECT
TO authenticated
USING (pid = public.current_pid());

CREATE POLICY "Participants can insert own chat logs"
ON public.chat_logs FOR INSERT
TO authenticated
WITH CHECK (pid = public.current_pid());
