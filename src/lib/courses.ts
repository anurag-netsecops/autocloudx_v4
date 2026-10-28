import type { Category, Level } from "@/lib/content";

/**
 * Public course catalogue (titles and descriptions only — safe to show anyone).
 * The Google Drive video links live in `courses.server.ts` and are only sent
 * to signed-in students.
 *
 * To add a course: add an entry here, then add its lesson video links in
 * `courses.server.ts` using the same course id and lesson ids.
 */
export interface CourseLesson {
  id: string;
  title: string;
  duration?: string;
}

export interface Course {
  id: string;
  title: string;
  category: Category;
  level: Level;
  summary: string;
  lessons: CourseLesson[];
}

export const courses: Course[] = [
  {
    id: "python-netops-intro",
    title: "Python for Network Engineers — Getting Started",
    category: "Automation",
    level: "Beginner",
    summary: "Set up Python, write your first scripts and parse real show-command output.",
    lessons: [
      { id: "setup", title: "Setting up Python & VS Code" },
      { id: "first-script", title: "Your first network script" },
    ],
  },
];

/** Extracts the file ID from any common Google Drive share link (or returns a bare ID). */
export function driveFileId(link: string): string | null {
  const trimmed = link.trim();
  const byPath = trimmed.match(/\/file\/d\/([\w-]{10,})/);
  if (byPath?.[1]) return byPath[1];
  const byQuery = trimmed.match(/[?&]id=([\w-]{10,})/);
  if (byQuery?.[1]) return byQuery[1];
  if (/^[\w-]{10,}$/.test(trimmed)) return trimmed;
  return null;
}

export function drivePreviewUrl(fileId: string) {
  return `https://drive.google.com/file/d/${fileId}/preview`;
}
