
CREATE TABLE IF NOT EXISTS public.prolific_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prolific_pid TEXT NOT NULL UNIQUE,
  study_id TEXT,
  session_id TEXT,
  user_id UUID,
  consented BOOLEAN,
  consent_at TIMESTAMPTZ,
  screening_q1 TEXT,
  screening_q2 TEXT,
  screening_passed BOOLEAN,
  screening_at TIMESTAMPTZ,
  survey_completed BOOLEAN NOT NULL DEFAULT false,
  survey_completed_at TIMESTAMPTZ,
  completion_code TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.prolific_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Linked user can view own prolific row"
  ON public.prolific_participants FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

DROP TRIGGER IF EXISTS trg_prolific_updated_at ON public.prolific_participants;
CREATE TRIGGER trg_prolific_updated_at
  BEFORE UPDATE ON public.prolific_participants
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Optional study_id/session_id on existing participants table for compatibility
ALTER TABLE public.participants
  ADD COLUMN IF NOT EXISTS study_id TEXT,
  ADD COLUMN IF NOT EXISTS session_id TEXT;
