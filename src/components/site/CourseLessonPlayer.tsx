import type { ReactNode } from "react";
import { PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { drivePreviewUrl, type CourseLesson } from "@/lib/courses";

export function CourseLessonPlayer({ lessons, activeId, onSelect, fileId, loading, unavailable }: {
  lessons: CourseLesson[];
  activeId: string;
  onSelect: (id: string) => void;
  fileId: string | null;
  loading: boolean;
  unavailable: ReactNode;
}) {
  const active = lessons.find((lesson) => lesson.id === activeId);
  return <div className="grid min-w-0 gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
    <div className="min-w-0">
      <div className="aspect-video overflow-hidden rounded-lg border bg-muted">
        {loading ? <div role="status" className="flex h-full items-center justify-center p-5 text-center text-sm text-muted-foreground">Loading video…</div>
          : fileId ? <iframe key={`${activeId}-${fileId}`} src={drivePreviewUrl(fileId)} title={active?.title ?? "Lesson video"} className="h-full w-full" allow="autoplay; fullscreen" allowFullScreen />
          : <div role="status" className="flex h-full flex-col items-center justify-center gap-3 overflow-auto p-5 text-center text-sm text-muted-foreground">{unavailable}</div>}
      </div>
      <h2 className="mt-4 break-words text-lg font-semibold">{active?.title}</h2>
    </div>
    <aside className="min-w-0">
      <p className="eyebrow mb-3 text-primary">Lessons</p>
      {lessons.length === 0 ? <p className="text-sm text-muted-foreground">No lessons yet.</p> : <ol className="flex flex-col gap-2">
        {lessons.map((lesson, index) => <li key={lesson.id}>
          <Button variant="ghost" type="button" onClick={() => onSelect(lesson.id)} aria-current={lesson.id === activeId ? "step" : undefined}
            className={`flex h-auto w-full items-center gap-3 whitespace-normal rounded-lg border px-3 py-2.5 text-left text-sm transition-colors ${lesson.id === activeId ? "border-primary/50 bg-primary/5" : "hover:bg-muted"}`}>
            <PlayCircle className="h-4 w-4 shrink-0 text-primary" />
            <span className="min-w-0 flex-1 break-words">{index + 1}. {lesson.title || "Untitled lesson"}</span>
            {lesson.duration && <span className="shrink-0 font-mono text-xs text-muted-foreground">{lesson.duration}</span>}
          </Button>
        </li>)}
      </ol>}
    </aside>
  </div>;
}