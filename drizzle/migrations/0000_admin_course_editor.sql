CREATE TYPE public.app_role AS ENUM ('admin', 'user');
CREATE TABLE public.user_roles (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL, role public.app_role NOT NULL, UNIQUE(user_id, role));
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$ SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
CREATE POLICY read_own_roles ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE TABLE public.course_entries (id text PRIMARY KEY, draft jsonb NOT NULL DEFAULT '{}'::jsonb, updated_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT ON public.course_entries TO authenticated;
GRANT ALL ON public.course_entries TO service_role;
ALTER TABLE public.course_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY admins_read_drafts ON public.course_entries FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TABLE public.course_catalogue (id text PRIMARY KEY, title text NOT NULL, summary text NOT NULL, category text NOT NULL, level text NOT NULL, lessons jsonb NOT NULL DEFAULT '[]'::jsonb, published_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT ON public.course_catalogue TO anon, authenticated;
GRANT ALL ON public.course_catalogue TO service_role;
ALTER TABLE public.course_catalogue ENABLE ROW LEVEL SECURITY;
CREATE POLICY public_catalogue ON public.course_catalogue FOR SELECT TO anon, authenticated USING (true);
CREATE TABLE public.course_video_content (course_id text PRIMARY KEY REFERENCES public.course_catalogue(id) ON DELETE CASCADE, videos jsonb NOT NULL DEFAULT '{}'::jsonb);
GRANT SELECT ON public.course_video_content TO authenticated;
GRANT ALL ON public.course_video_content TO service_role;
ALTER TABLE public.course_video_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY students_read_videos ON public.course_video_content FOR SELECT TO authenticated USING (true);
CREATE FUNCTION public.publish_course_editor(_course jsonb, _publish boolean) RETURNS void LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $$
BEGIN
 INSERT INTO public.course_entries(id,draft,updated_at) VALUES(_course->>'id', _course, now()) ON CONFLICT(id) DO UPDATE SET draft=EXCLUDED.draft,updated_at=now();
 IF _publish THEN
 INSERT INTO public.course_catalogue(id,title,summary,category,level,lessons,published_at) VALUES(_course->>'id',_course->>'title',_course->>'summary',_course->>'category',_course->>'level', (SELECT jsonb_agg(jsonb_build_object('id',x->>'id','title',x->>'title','duration',x->>'duration') ORDER BY n) FROM jsonb_array_elements(_course->'lessons') WITH ORDINALITY AS t(x,n)),now()) ON CONFLICT(id) DO UPDATE SET title=EXCLUDED.title,summary=EXCLUDED.summary,category=EXCLUDED.category,level=EXCLUDED.level,lessons=EXCLUDED.lessons,published_at=now();
 INSERT INTO public.course_video_content(course_id,videos) VALUES(_course->>'id',(SELECT jsonb_object_agg(x->>'id',x->>'driveLink') FROM jsonb_array_elements(_course->'lessons') AS x)) ON CONFLICT(course_id) DO UPDATE SET videos=EXCLUDED.videos;
 END IF;
END $$;
REVOKE ALL ON FUNCTION public.publish_course_editor(jsonb,boolean) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.publish_course_editor(jsonb,boolean) TO service_role;