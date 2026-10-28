import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { courseEditorSchema, publicationReady } from "./course-editor-schema";

export const getAdminAccess = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { data, error } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
  if (error) throw new Error("Could not check admin access");
  return { isAdmin: data === true };
});

export const getAdminCourses = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { data: allowed, error: roleError } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
  if (roleError || !allowed) throw new Error("Admin access required");
  const { data, error } = await context.supabase.from("course_entries").select("draft,updated_at").order("updated_at", { ascending: false });
  if (error) throw new Error("Could not load courses");
  const { data: published, error: publishedError } = await context.supabase.from("course_catalogue").select("id");
  if (publishedError) throw new Error("Could not load published courses");
  return { courses: (data ?? []).map((r) => ({ course: courseEditorSchema.parse(r.draft), updatedAt: r.updated_at })), publishedIds: (published ?? []).map((r) => r.id) };
});

export const validateCourseVideo = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ link: z.string().max(1000) }).parse(input))
  .handler(async ({ context, data }) => {
    const { data: allowed, error } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (error || !allowed) throw new Error("Admin access required");
    const { checkDriveVideo } = await import("./course-editor.server");
    return checkDriveVideo(data.link);
  });

export const previewAdminCourse = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator((input) => courseEditorSchema.parse(input))
  .handler(async ({ context, data }) => {
    const { data: allowed, error } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (error || !allowed) throw new Error("Admin access required");
    const { checkDriveVideo } = await import("./course-editor.server");
    const checks = await Promise.all(data.lessons.map(async (lesson) => {
      try { return await checkDriveVideo(lesson.driveLink); }
      catch { return { valid: false, message: "Could not check video. Try again." }; }
    }));
    return { checks: Object.fromEntries(data.lessons.map((lesson, index) => [lesson.id, checks[index]])) };
  });

export const saveAdminCourse = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ course: courseEditorSchema, publish: z.boolean() }).parse(input))
  .handler(async ({ context, data }) => {
    const { data: allowed, error } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (error || !allowed) throw new Error("Admin access required");
    if (data.publish) {
      const { checkDriveVideo } = await import("./course-editor.server");
      const checks = await Promise.all(data.course.lessons.map((lesson) => checkDriveVideo(lesson.driveLink)));
      if (!publicationReady(data.course, checks)) return { saved: false, checks, message: "Publishing blocked: every lesson needs a verified, publicly shared video." };
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error: saveError } = await supabaseAdmin.rpc("publish_course_editor", { _course: data.course, _publish: data.publish });
    if (saveError) { console.error(saveError); throw new Error("Could not save course"); }
    return { saved: true, checks: [], message: data.publish ? "Course published" : "Draft saved" };
  });