import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { courseEditorSchema } from "./course-editor-schema";
import { courses, type Course } from "./courses";

export const getPublishedCourses = createServerFn({ method: "GET" }).handler(async (): Promise<Course[]> => {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  const url = process.env["SUPABASE_URL"];
  if (!key || !url) throw new Error("Course catalogue unavailable");
  const client = createClient<Database>(url, key, { auth: { persistSession: false, autoRefreshToken: false }, global: { fetch: (input, init) => {
    const headers = new Headers(init?.headers);
    if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) headers.delete("Authorization");
    headers.set("apikey", key);
    return fetch(input, { ...init, headers });
  } } });
  const { data, error } = await client.from("course_catalogue").select("id,title,summary,category,level,lessons").order("published_at", { ascending: false });
  if (error) throw new Error("Could not load course catalogue");
  const published = (data ?? []).map((row) => courseEditorSchema.parse(row));
  return [...published, ...courses.filter((c) => !published.some((p) => p.id === c.id))];
});

export const getCourseVideos = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { courseId: string }) => {
    if (typeof input?.courseId !== "string" || input.courseId.length > 100) throw new Error("Invalid course");
    return input;
  })
  .handler(async ({ data, context }) => {
    const { courseVideoLinks } = await import("./courses.server");
    const { driveFileId } = await import("./courses");
    const { data: stored, error } = await context.supabase.from("course_video_content").select("videos").eq("course_id", data.courseId).maybeSingle();
    if (error) throw new Error("Could not load videos");
    const links = stored?.videos && typeof stored.videos === "object" && !Array.isArray(stored.videos) ? stored.videos : courseVideoLinks[data.courseId] ?? {};
    const videos: Record<string, string | null> = {};
    for (const [lessonId, link] of Object.entries(links)) videos[lessonId] = typeof link === "string" && link ? driveFileId(link) : null;
    return { videos };
  });
