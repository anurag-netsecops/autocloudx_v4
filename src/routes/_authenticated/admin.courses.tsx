import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { Plus, Save, Upload, ShieldCheck, Trash2, ArrowUp, ArrowDown, CheckCircle2, Eye, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AdminCoursePreview } from "@/components/site/AdminCoursePreview";
import { getAdminAccess, getAdminCourses, saveAdminCourse, validateCourseVideo } from "@/lib/course-editor.functions";
import { courseEditorSchema, type EditableCourse, type DriveCheck } from "@/lib/course-editor-schema";
import { courses } from "@/lib/courses";
import { pageHead } from "@/lib/site-config";

export const Route = createFileRoute("/_authenticated/admin/courses")({
  head: () => pageHead({ title: "Admin Course Editor", description: "Manage AutoCloudX courses, lessons and Google Drive videos.", path: "/admin/courses" }),
  component: AdminCourses,
});

function AdminCourses() {
  const accessFn = useServerFn(getAdminAccess);
  const { data, error, isPending } = useQuery({ queryKey: ["admin-access"], queryFn: () => accessFn() });
  if (isPending) return <p className="mx-auto max-w-7xl px-5 py-16">Checking admin access…</p>;
  if (error) return <p className="mx-auto max-w-7xl px-5 py-16 text-destructive">Could not check access. Please refresh.</p>;
  if (!data?.isAdmin) return <section className="mx-auto max-w-7xl px-5 py-16"><h1 className="text-3xl font-semibold">Admin access required</h1><p className="mt-3 text-muted-foreground">This account cannot edit courses.</p></section>;
  return <CourseEditor />;
}

const starter = (): EditableCourse => ({ id: crypto.randomUUID(), title: "", summary: "", category: "Automation", level: "Beginner", lessons: [] });
function CourseEditor() {
  const queryClient = useQueryClient();
  const listFn = useServerFn(getAdminCourses);
  const saveFn = useServerFn(saveAdminCourse);
  const checkFn = useServerFn(validateCourseVideo);
  const { data, error, isPending } = useQuery({ queryKey: ["admin-courses"], queryFn: () => listFn() });
  const [course, setCourse] = useState<EditableCourse | null>(null);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [checking, setChecking] = useState<string | null>(null);
  const [checks, setChecks] = useState<Record<string, DriveCheck>>({});
  const [preview, setPreview] = useState<EditableCourse | null>(null);
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => { if (dirty) { event.preventDefault(); event.returnValue = ""; } };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  function select(next: EditableCourse) {
    if (dirty && !window.confirm("Discard unsaved changes?")) return;
    setCourse(next); setDirty(false); setChecks({});
  }
  function edit(next: EditableCourse) { setCourse(next); setDirty(true); }
  async function save(publish: boolean) {
    if (!course) return;
    const parsed = courseEditorSchema.safeParse(course);
    if (!parsed.success) { toast.error(parsed.error.issues[0]?.message ?? "Check course details"); return; }
    setBusy(true);
    try {
      const result = await saveFn({ data: { course: parsed.data, publish } });
      if (!result.saved) {
        setChecks(Object.fromEntries(course.lessons.map((l, i) => [l.id, result.checks[i] ?? { valid: false, message: "Add a video link" }])));
        toast.error(result.message); return;
      }
      setDirty(false); toast.success(result.message);
      await Promise.all([queryClient.invalidateQueries({ queryKey: ["admin-courses"] }), queryClient.invalidateQueries({ queryKey: ["published-courses"] }), queryClient.invalidateQueries({ queryKey: ["course-videos"] })]);
    } catch (e) { toast.error(e instanceof Error ? e.message : "Could not save course"); }
    finally { setBusy(false); }
  }
  async function validate(id: string, link: string) {
    setChecking(id);
    try { setChecks((prev) => ({ ...prev, [id]: { valid: false, message: "Checking…" } })); const result = await checkFn({ data: { link } }); setChecks((prev) => ({ ...prev, [id]: result })); }
    catch { setChecks((prev) => ({ ...prev, [id]: { valid: false, message: "Could not check video. Try again." } })); }
    finally { setChecking(null); }
  }
  if (isPending) return <p className="mx-auto max-w-7xl px-5 py-16">Loading courses…</p>;
  if (error) return <p className="mx-auto max-w-7xl px-5 py-16 text-destructive">Could not load courses. Please refresh.</p>;
  const savedCourses = data?.courses.map((r) => r.course) ?? [];
  const legacy = courses.filter((c) => !savedCourses.some((s) => s.id === c.id)).map((c) => courseEditorSchema.parse({ ...c, lessons: c.lessons.map((l) => ({ ...l, driveLink: "" })) }));
  return <section className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
    <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-6"><div><p className="eyebrow flex items-center gap-2 text-primary"><ShieldCheck className="h-4 w-4" /> Administration</p><h1 className="mt-2 text-3xl font-semibold">Course editor</h1></div><Button onClick={() => select(starter())}><Plus /> New course</Button></div>
    <div className="grid gap-8 pt-7 lg:grid-cols-[240px_1fr]">
      <aside className="space-y-2"><h2 className="mb-4 text-sm font-semibold">All courses</h2>{[...savedCourses, ...legacy].map((c) => <Button key={c.id} variant="ghost" onClick={() => select(c)} className={`h-auto w-full flex-col items-start whitespace-normal border px-3 py-3 text-left ${course?.id === c.id ? "border-primary bg-primary/5" : "border-border"}`}><span>{c.title}</span><span className="text-xs font-normal text-muted-foreground">{data?.publishedIds.includes(c.id) ? "Published · editable draft" : "Draft"} · {c.lessons.length} lessons</span></Button>)}</aside>
      {!course ? <div className="py-12"><h2 className="text-xl font-semibold">Select a course</h2></div> : <div className="min-w-0 space-y-7">
        <div className="flex flex-wrap items-center justify-between gap-3"><span className="text-sm text-muted-foreground">{dirty ? "Unsaved changes" : "Draft"}</span><div className="flex flex-wrap gap-2"><Button variant="outline" disabled={busy} onClick={() => { const parsed = courseEditorSchema.safeParse(course); if (!parsed.success) { toast.error(parsed.error.issues[0]?.message ?? "Check course details"); return; } setPreview(parsed.data); }}><Eye /> Student preview</Button><Button variant="outline" disabled={busy} onClick={() => void save(false)}><Save /> Save draft</Button><Button disabled={busy} onClick={() => void save(true)}><Upload /> {busy ? "Please wait…" : "Publish course"}</Button></div></div>
        <div className="space-y-4"><div className="grid gap-2"><Label htmlFor="course-title">Course title</Label><Input id="course-title" value={course.title} onChange={(e) => edit({ ...course, title: e.target.value })} /></div><div className="grid gap-2"><Label htmlFor="course-summary">Summary</Label><Textarea id="course-summary" value={course.summary} onChange={(e) => edit({ ...course, summary: e.target.value })} /></div><div className="grid gap-4 sm:grid-cols-2"><div className="grid gap-2"><Label htmlFor="course-category">Category</Label><select id="course-category" className="h-9 rounded-md border bg-background px-3 text-sm" value={course.category} onChange={(e) => edit({ ...course, category: courseEditorSchema.shape.category.parse(e.target.value) })}>{["Networking", "Automation", "Security", "Cloud", "AI"].map((s) => <option key={s}>{s}</option>)}</select></div><div className="grid gap-2"><Label htmlFor="course-level">Level</Label><select id="course-level" className="h-9 rounded-md border bg-background px-3 text-sm" value={course.level} onChange={(e) => edit({ ...course, level: courseEditorSchema.shape.level.parse(e.target.value) })}>{["Beginner", "Intermediate", "Advanced"].map((s) => <option key={s}>{s}</option>)}</select></div></div></div>
        <div className="flex items-center justify-between border-t pt-6"><h2 className="text-xl font-semibold">Lessons</h2><Button variant="outline" onClick={() => edit({ ...course, lessons: [...course.lessons, { id: crypto.randomUUID(), title: "", duration: "", driveLink: "" }] })}><Plus /> Add lesson</Button></div>
        <ol className="space-y-4">{course.lessons.map((lesson, index) => <li key={lesson.id} className="rounded-lg border p-4"><div className="mb-4 flex items-center justify-between"><span className="font-mono text-xs text-muted-foreground">LESSON {index + 1}</span><div className="flex gap-1">{[-1, 1].map((direction) => <Button key={direction} size="icon" variant="ghost" title={direction < 0 ? "Move lesson up" : "Move lesson down"} aria-label={direction < 0 ? "Move lesson up" : "Move lesson down"} disabled={index + direction < 0 || index + direction >= course.lessons.length} onClick={() => { const reordered = [...course.lessons]; const other = reordered[index + direction]; if (!other) return; reordered[index] = other; reordered[index + direction] = lesson; edit({ ...course, lessons: reordered }); }}>{direction < 0 ? <ArrowUp /> : <ArrowDown />}</Button>)}<Button size="icon" variant="ghost" aria-label="Remove lesson" title="Remove lesson" onClick={() => { if (window.confirm("Remove this lesson?")) edit({ ...course, lessons: course.lessons.filter((l) => l.id !== lesson.id) }); }}><Trash2 /></Button></div></div>
          <div className="grid gap-4 sm:grid-cols-[1fr_120px]"><div className="grid gap-2"><Label htmlFor={`title-${lesson.id}`}>Lesson title</Label><Input id={`title-${lesson.id}`} value={lesson.title} onChange={(e) => edit({ ...course, lessons: course.lessons.map((l) => l.id === lesson.id ? { ...l, title: e.target.value } : l) })} /></div><div className="grid gap-2"><Label htmlFor={`duration-${lesson.id}`}>Duration</Label><Input id={`duration-${lesson.id}`} placeholder="12:30" value={lesson.duration} onChange={(e) => edit({ ...course, lessons: course.lessons.map((l) => l.id === lesson.id ? { ...l, duration: e.target.value } : l) })} /></div></div>
          <div className="mt-4 grid gap-2"><Label htmlFor={`link-${lesson.id}`}>Google Drive video link</Label><div className="flex flex-wrap gap-2"><Input className="min-w-0 flex-1 basis-48" id={`link-${lesson.id}`} type="url" value={lesson.driveLink} onChange={(e) => { edit({ ...course, lessons: course.lessons.map((l) => l.id === lesson.id ? { ...l, driveLink: e.target.value } : l) }); setChecks((prev) => { const next = { ...prev }; delete next[lesson.id]; return next; }); }} /><Button variant="outline" disabled={checking !== null || !lesson.driveLink} onClick={() => void validate(lesson.id, lesson.driveLink)}><LinkIcon /> {checking === lesson.id ? "Checking…" : "Validate link"}</Button></div>{checks[lesson.id] && <p role="status" className={`flex items-start gap-2 text-sm ${checks[lesson.id]?.valid ? "text-primary" : "text-destructive"}`}>{checks[lesson.id]?.valid && <CheckCircle2 className="h-4 w-4 shrink-0" />}{checks[lesson.id]?.name && `${checks[lesson.id]?.name} · `}{checks[lesson.id]?.message}</p>}</div>
        </li>)}</ol>
      </div>}
    </div>
    {preview && <AdminCoursePreview course={preview} onClose={() => setPreview(null)} />}
  </section>;
}