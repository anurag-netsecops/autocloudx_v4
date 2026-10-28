import { z } from "zod";

export const lessonSchema = z.object({
  id: z.string().min(1).max(100),
  title: z.string().trim().min(1).max(200),
  duration: z.string().max(30).default(""),
  driveLink: z.string().trim().max(1000).default(""),
});
export const courseEditorSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]{1,100}$/),
  title: z.string().trim().min(1).max(200),
  summary: z.string().trim().min(1).max(2000),
  category: z.enum(["Networking", "Automation", "Security", "Cloud", "AI"]),
  level: z.enum(["Beginner", "Intermediate", "Advanced"]),
  lessons: z.array(lessonSchema).max(100).refine((items) => new Set(items.map((l) => l.id)).size === items.length, "Lesson IDs must be unique"),
});
export type EditableCourse = z.infer<typeof courseEditorSchema>;
export type DriveCheck = { valid: boolean; message: string; name?: string; fileId?: string };

export function strictDriveId(link: string): string | null {
  try {
    const url = new URL(link);
    if (url.protocol !== "https:" || url.hostname !== "drive.google.com" || url.username || url.password) return null;
    const id = url.pathname.match(/^\/file\/d\/([\w-]+)(?:\/|$)/)?.[1] ?? (url.pathname === "/open" ? url.searchParams.get("id") : null);
    return id && /^[\w-]{10,}$/.test(id) ? id : null;
  } catch { return null; }
}

export function assessDriveFile(file: { mimeType?: string; trashed?: boolean; permissions?: { type?: string; role?: string }[] }): boolean {
  return !file.trashed && !!file.mimeType?.startsWith("video/") && !!file.permissions?.some((p) => p.type === "anyone" && ["reader", "writer"].includes(p.role ?? ""));
}

export function publicationReady(course: EditableCourse, checks: DriveCheck[]): boolean {
  return course.lessons.length > 0 && checks.length === course.lessons.length && checks.every((c) => c.valid);
}

export function previewVideoId(link: string, check: DriveCheck | undefined): string | null {
  const id = strictDriveId(link);
  return id && check?.valid && check.fileId === id ? id : null;
}