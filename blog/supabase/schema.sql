-- Enable UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'Viewer' CHECK (role IN ('Author', 'Viewer', 'Admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- POSTS TABLE
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  image_url TEXT,
  author_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- COMMENTS TABLE
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  comment_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Settings
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Post Policies
-- Anyone can read posts
CREATE POLICY "Anyone can read posts" ON public.posts FOR SELECT USING (true);
-- Authors and Admins can create posts (app logic needs to check role, or check role from users table here)
CREATE POLICY "Authors and Admins can insert posts" ON public.posts FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() AND (users.role = 'Author' OR users.role = 'Admin')
  )
);
-- Authors can edit their own posts, Admins can edit any post
CREATE POLICY "Authors and Admins can update posts" ON public.posts FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() AND (
      users.role = 'Admin' OR 
      (users.role = 'Author' AND posts.author_id = auth.uid())
    )
  )
);
-- Authors can delete their own posts, Admins can delete any post
CREATE POLICY "Authors and Admins can delete posts" ON public.posts FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() AND (
      users.role = 'Admin' OR 
      (users.role = 'Author' AND posts.author_id = auth.uid())
    )
  )
);

-- Comments Policies
-- Anyone can read comments
CREATE POLICY "Anyone can read comments" ON public.comments FOR SELECT USING (true);
-- Authenticated users (any role) can comment
CREATE POLICY "Authenticated users can create comments" ON public.comments FOR INSERT WITH CHECK (auth.uid() = user_id);
-- Admins can delete any comment, Users can delete their own comment
CREATE POLICY "Users can delete own comments, admins can delete any" ON public.comments FOR DELETE USING (
  auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'Admin'
  )
);

-- Users Policies
-- Users can read their own data, Admins can read all data
CREATE POLICY "Users can read all user data (needed for authors etc)" ON public.users FOR SELECT USING (true);

-- Trigger to create a public.user after auth.user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, name, email, role)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'full_name', 'User'), new.email, COALESCE(new.raw_user_meta_data->>'role', 'Viewer'));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
