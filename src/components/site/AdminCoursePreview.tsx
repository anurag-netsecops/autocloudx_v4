import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CourseLessonPlayer } from "@/components/site/CourseLessonPlayer";
import { LevelBadge } from "@/components/site/LevelBadge";
import { previewAdminCourse } from "@/lib/course-editor.functions";
import { previewVideoId, type EditableCourse } from "@/lib/course-editor-schema";

export function AdminCoursePreview({ course, onClose }: { course: EditableCourse; onClose: () => void }) {
  const [activeId, setActiveId] = useState(course.lessons[0]?.id ?? "");
  const previewFn = useServerFn(previewAdminCourse);
  const { data, error, isFetching, refetch } = useQuery({
    queryKey: ["admin-course-preview", course],
    queryFn: () => previewFn({ data: course }),
    staleTime: 0,
    retry: false,
    gcTime: 0,
  });
  const active = course.lessons.find((lesson) => lesson.id === activeId);
  const check = data?.checks[activeId];
  const fileId = previewVideoId(active?.driveLink ?? "", check);
  return <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
    <DialogContent className="max-h-[90dvh] w-[calc(100%-2rem)] max-w-6xl overflow-y-auto p-5 sm:p-8">
      <DialogHeader className="pr-7 text-left">
        <p className="eyebrow mb-2 text-primary">Student preview · Unpublished draft</p>
        <DialogTitle className="break-words text-2xl tracking-normal">{course.title}</DialogTitle>
        <DialogDescription className="break-words">{course.summary}</DialogDescription>
      </DialogHeader>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <LevelBadge level={course.level} />
        <Button variant="outline" disabled={isFetching} onClick={() => void refetch()}><RefreshCw /> Recheck videos</Button>
      </div>
      <CourseLessonPlayer lessons={course.lessons} activeId={activeId} onSelect={setActiveId} fileId={fileId} loading={isFetching}
        unavailable={error ? <span className="text-destructive">Could not check videos. Please recheck.</span>
          : !active ? "No lessons yet."
          : <span>{check?.message ?? "Add a Google Drive video link to this lesson."}</span>} />
      <p className="text-sm text-muted-foreground">Preview only; changes are not saved or published. Private videos are blocked, even if your Google account can play them.</p>
    </DialogContent>
  </Dialog>;
}