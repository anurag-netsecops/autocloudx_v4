import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { Plus, Save, Upload, ShieldCheck, Trash2, ImagePlus, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getAdminAccess } from "@/lib/course-editor.functions";
import { getAdminLabs, saveAdminLab, deleteAdminLab } from "@/lib/labs.functions";
import { labSchema, type EditableLab, type PublicLab } from "@/lib/labs-schema";
import { pageHead } from "@/lib/site-config";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/labs")({
  head: () => pageHead({ title: "Admin Lab Editor", description: "Create and edit AutoCloudX labs, steps and topology images.", path: "/admin/labs" }),
  component: AdminLabs,
});

function AdminLabs() {
  const accessFn = useServerFn(getAdminAccess);
  const { data, error, isPending } = useQuery({ queryKey: ["admin-access"], queryFn: () => accessFn() });
  if (isPending) return <p className="mx-auto max-w-7xl px-5 py-16">Checking admin access…</p>;
  if (error) return <p className="mx-auto max-w-7xl px-5 py-16 text-destructive">Could not check access. Please refresh.</p>;
  if (!data?.isAdmin) return <section className="mx-auto max-w-7xl px-5 py-16"><h1 className="text-3xl font-semibold">Admin access required</h1><p className="mt-3 text-muted-foreground">This account cannot edit labs.</p></section>;
  return <LabEditor />;
}

const starter = (): EditableLab => ({
  id: "", title: "", category: "Automation", level: "Beginner", objective: "",
  skills: [], scenario: "", steps: [], outcomes: [], snippet: "", note: "", topologyPath: null, published: false,
});

function slugify(title: string): string {
  return title.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 100);
}

function LabEditor() {
  const queryClient = useQueryClient();
  const listFn = useServerFn(getAdminLabs);
  const saveFn = useServerFn(saveAdminLab);
  const deleteFn = useServerFn(deleteAdminLab);
  const { data, error, isPending } = useQuery({ queryKey: ["admin-labs"], queryFn: () => listFn() });
  const [lab, setLab] = useState<EditableLab | null>(null);
  const [topologyUrl, setTopologyUrl] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => { if (dirty) { event.preventDefault(); event.returnValue = ""; } };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  function select(next: EditableLab, url: string | null) {
    if (dirty && !window.confirm("Discard unsaved changes?")) return;
    setLab(next); setTopologyUrl(url); setDirty(false);
  }
  function edit(next: EditableLab) { setLab(next); setDirty(true); }
  const setList = (key: "skills" | "steps" | "outcomes") => (e: React.ChangeEvent<HTMLTextAreaElement>) =>
    lab && edit({ ...lab, [key]: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean) });

  async function save(publish: boolean) {
    if (!lab) return;
    const candidate = { ...lab, id: lab.id || slugify(lab.title), published: publish ? true : lab.published };
    const parsed = labSchema.safeParse(candidate);
    if (!parsed.success) { toast.error(parsed.error.issues[0]?.message ?? "Check lab details"); return; }
    setBusy(true);
    try {
      const result = await saveFn({ data: parsed.data });
      setLab(parsed.data); setDirty(false); toast.success(result.message);
      await queryClient.invalidateQueries({ queryKey: ["admin-labs"] });
      await queryClient.invalidateQueries({ queryKey: ["public-labs"] });
    } catch (e) { toast.error(e instanceof Error ? e.message : "Could not save lab"); }
    finally { setBusy(false); }
  }

  async function removeLab() {
    if (!lab?.id || !window.confirm("Delete this lab permanently?")) return;
    setBusy(true);
    try {
      await deleteFn({ data: { id: lab.id } });
      setLab(null); setTopologyUrl(null); setDirty(false); toast.success("Lab deleted");
      await queryClient.invalidateQueries({ queryKey: ["admin-labs"] });
      await queryClient.invalidateQueries({ queryKey: ["public-labs"] });
    } catch (e) { toast.error(e instanceof Error ? e.message : "Could not delete lab"); }
    finally { setBusy(false); }
  }

  async function uploadTopology(file: File) {
    if (!lab) return;
    if (!file.type.startsWith("image/")) { toast.error("Choose an image file"); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("Image must be under 5 MB"); return; }
    const id = lab.id || slugify(lab.title) || crypto.randomUUID();
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "png";
    const path = `labs/${id}/topology-${Date.now()}.${ext}`;
    setUploading(true);
    try {
      const { error: uploadError } = await supabase.storage.from("lab-images").upload(path, file, { upsert: true, contentType: file.type });
      if (uploadError) throw uploadError;
      edit({ ...lab, id, topologyPath: path });
      setTopologyUrl(URL.createObjectURL(file));
      toast.success("Topology image added — save the lab to keep it");
    } catch { toast.error("Could not upload image. Try again."); }
    finally { setUploading(false); }
  }

  if (isPending) return <p className="mx-auto max-w-7xl px-5 py-16">Loading labs…</p>;
  if (error) return <p className="mx-auto max-w-7xl px-5 py-16 text-destructive">Could not load labs. Please refresh.</p>;
  const labs = data?.labs ?? [];

  return <section className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
    <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-6">
      <div><p className="eyebrow flex items-center gap-2 text-primary"><ShieldCheck className="h-4 w-4" /> Administration</p><h1 className="mt-2 text-3xl font-semibold">Lab editor</h1></div>
      <Button onClick={() => select(starter(), null)}><Plus /> New lab</Button>
    </div>
    <div className="grid gap-8 pt-7 lg:grid-cols-[240px_1fr]">
      <aside className="space-y-2">
        <h2 className="mb-4 text-sm font-semibold">All labs</h2>
        {labs.map((l: PublicLab) => (
          <Button key={l.id} variant="ghost" onClick={() => select(l, l.topologyUrl)}
            className={`h-auto w-full flex-col items-start whitespace-normal border px-3 py-3 text-left ${lab?.id === l.id ? "border-primary bg-primary/5" : "border-border"}`}>
            <span>{l.title}</span>
            <span className="text-xs font-normal text-muted-foreground">{l.published ? "Published" : "Draft"} · {l.steps.length} steps</span>
          </Button>
        ))}
        {labs.length === 0 && <p className="text-sm text-muted-foreground">No labs yet. Create your first one.</p>}
      </aside>
      {!lab ? <div className="py-12"><h2 className="text-xl font-semibold">Select a lab or create a new one</h2></div> : (
        <div className="min-w-0 space-y-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-sm text-muted-foreground">{dirty ? "Unsaved changes" : lab.published ? "Published" : "Draft"}</span>
            <div className="flex flex-wrap gap-2">
              {lab.id && <Button variant="outline" disabled={busy} onClick={() => void removeLab()}><Trash2 /> Delete</Button>}
              <Button variant="outline" disabled={busy} onClick={() => void save(false)}><Save /> Save draft</Button>
              <Button disabled={busy} onClick={() => void save(true)}><Upload /> {busy ? "Please wait…" : "Publish lab"}</Button>
            </div>
          </div>
          <div className="space-y-4">
            <div className="grid gap-2"><Label htmlFor="lab-title">Lab title</Label><Input id="lab-title" value={lab.title} onChange={(e) => edit({ ...lab, title: e.target.value })} /></div>
            <div className="grid gap-2"><Label htmlFor="lab-objective">Objective</Label><Textarea id="lab-objective" value={lab.objective} onChange={(e) => edit({ ...lab, objective: e.target.value })} /></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2"><Label htmlFor="lab-category">Category</Label><select id="lab-category" className="h-9 rounded-md border bg-background px-3 text-sm" value={lab.category} onChange={(e) => edit({ ...lab, category: labSchema.shape.category.parse(e.target.value) })}>{["Networking", "Automation", "Security", "Cloud", "AI"].map((s) => <option key={s}>{s}</option>)}</select></div>
              <div className="grid gap-2"><Label htmlFor="lab-level">Level</Label><select id="lab-level" className="h-9 rounded-md border bg-background px-3 text-sm" value={lab.level} onChange={(e) => edit({ ...lab, level: labSchema.shape.level.parse(e.target.value) })}>{["Beginner", "Intermediate", "Advanced"].map((s) => <option key={s}>{s}</option>)}</select></div>
            </div>
            <div className="grid gap-2"><Label htmlFor="lab-scenario">Scenario</Label><Textarea id="lab-scenario" value={lab.scenario} onChange={(e) => edit({ ...lab, scenario: e.target.value })} /></div>
            <div className="grid gap-2"><Label htmlFor="lab-steps">Steps (one per line)</Label><Textarea id="lab-steps" rows={6} value={lab.steps.join("\n")} onChange={setList("steps")} placeholder={"Model devices in YAML\nRender config with Jinja2\nPush and verify"} /></div>
            <div className="grid gap-2"><Label htmlFor="lab-skills">Skills (one per line)</Label><Textarea id="lab-skills" rows={3} value={lab.skills.join("\n")} onChange={setList("skills")} /></div>
            <div className="grid gap-2"><Label htmlFor="lab-outcomes">Learning outcomes (one per line)</Label><Textarea id="lab-outcomes" rows={4} value={lab.outcomes.join("\n")} onChange={setList("outcomes")} /></div>
            <div className="grid gap-2"><Label htmlFor="lab-snippet">Example code / config snippet</Label><Textarea id="lab-snippet" rows={6} className="font-mono text-xs" value={lab.snippet} onChange={(e) => edit({ ...lab, snippet: e.target.value })} /></div>
            <div className="grid gap-2"><Label htmlFor="lab-note">Note (optional)</Label><Input id="lab-note" value={lab.note} onChange={(e) => edit({ ...lab, note: e.target.value })} placeholder="e.g. Guided example — adapt to your own environment" /></div>
          </div>
          <div className="space-y-3 border-t pt-6">
            <h2 className="text-xl font-semibold">Topology image</h2>
            {topologyUrl ? (
              <div className="relative w-fit">
                <img src={topologyUrl} alt={`Topology for ${lab.title || "lab"}`} className="max-h-64 rounded-lg border" />
                <Button size="icon" variant="ghost" aria-label="Remove topology image" title="Remove topology image" className="absolute right-2 top-2 bg-background/80" onClick={() => { edit({ ...lab, topologyPath: null }); setTopologyUrl(null); }}><X /></Button>
              </div>
            ) : <p className="text-sm text-muted-foreground">No topology image yet.</p>}
            <input ref={fileInput} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) void uploadTopology(f); e.target.value = ""; }} />
            <Button variant="outline" disabled={uploading} onClick={() => fileInput.current?.click()}><ImagePlus /> {uploading ? "Uploading…" : topologyUrl ? "Replace image" : "Add topology image"}</Button>
          </div>
        </div>
      )}
    </div>
  </section>;
}
