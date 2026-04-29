
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS meal_preferences TEXT[] DEFAULT '{}';

CREATE TABLE public.forum_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id TEXT NOT NULL,
  parent_comment_id UUID REFERENCES public.forum_comments(id),
  user_id TEXT NOT NULL,
  author_name TEXT NOT NULL DEFAULT 'Anonymous',
  content TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.forum_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read comments" ON public.forum_comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert comments" ON public.forum_comments FOR INSERT TO authenticated WITH CHECK (true);
