import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Search, ShieldAlert } from "lucide-react";
import { useMemo, useState } from "react";
import { PageHero } from "@/components/site/PageHero";
import { CtaBand } from "@/components/site/CtaBand";
import { LevelBadge } from "@/components/site/LevelBadge";
import { learningPaths, type Category, type Level } from "@/lib/content";
import { pageHead } from "@/lib/site-config";

export const Route = createFileRoute("/learning-paths")({
  head: () =>
    pageHead({
      title: "Learning Paths",
      description: "Eight ACX learning paths: CCNA & CCNP routing, Python, network automation, firewalls, cloud networking, Ansible/Terraform and AI for NetOps.",
      path: "/learning-paths",
    }),
  component: LearningPaths,
});

const categories: ("All" | Category)[] = ["All", "Networking", "Automation", "Security", "Cloud", "AI"];
const levels: ("All" | Level)[] = ["All", "Beginner", "Intermediate", "Advanced"];

export function filterPaths(q: string, cat: string, lvl: string) {
  const s = q.trim().toLowerCase();
  return learningPaths.filter(
    (p) =>
      (cat === "All" || p.category === cat) &&
      (lvl === "All" || p.level === lvl) &&
      (!s || [p.title, p.summary, ...p.modules, ...p.tools].join(" ").toLowerCase().includes(s)),
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: string }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${active ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:border-primary/50"}`}
    >
      {children}
    </button>
  );
}

function LearningPaths() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("All");
  const [lvl, setLvl] = useState<string>("All");
  const results = useMemo(() => filterPaths(q, cat, lvl), [q, cat, lvl]);

  return (
    <>
      <PageHero eyebrow="Learning paths" title="Structured paths from fundamentals to automation.">
        Choose a path based on where you are today. Each one combines concept lessons, guided labs and a capstone you can show.
      </PageHero>

      <section className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
        <div role="note" className="mb-10 flex gap-3 rounded-xl border border-primary/25 bg-accent/50 p-4 text-sm text-accent-foreground">
          <ShieldAlert className="h-5 w-5 shrink-0" aria-hidden="true" />
          <p>
            These are <strong>AutoCloudX learning pathways</strong>, not official vendor certifications. Paths referencing CCNA, CCNP, Palo Alto,
            FortiGate, AWS, Azure or GCP cover related concepts; exams and credentials are issued only by the respective vendors.
          </p>
        </div>

        <div className="space-y-4">
          <div className="relative max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <label htmlFor="path-search" className="sr-only">Search learning paths</label>
            <input
              id="path-search"
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search topics or tools, e.g. BGP, Terraform"
              className="h-11 w-full rounded-lg border border-input bg-card pl-9 pr-3 text-sm"
            />
          </div>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
            {categories.map((c) => <Chip key={c} active={cat === c} onClick={() => setCat(c)}>{c}</Chip>)}
          </div>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by level">
            {levels.map((l) => <Chip key={l} active={lvl === l} onClick={() => setLvl(l)}>{l === "All" ? "All levels" : l}</Chip>)}
          </div>
          <p className="text-sm text-muted-foreground" aria-live="polite">{results.length} of {learningPaths.length} paths</p>
        </div>

        {results.length === 0 ? (
          <div className="mt-10 rounded-xl border border-dashed p-12 text-center">
            <p className="font-semibold">No paths match those filters.</p>
            <button className="mt-3 text-sm text-primary hover:underline" onClick={() => { setQ(""); setCat("All"); setLvl("All"); }}>Clear all filters</button>
          </div>
        ) : (
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            {results.map((p) => (
              <article id={p.id} key={p.id} className="scroll-mt-24 rounded-2xl border bg-card p-7 shadow-card">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs text-muted-foreground">{p.category}</span>
                  <LevelBadge level={p.level} />
                </div>
                <h2 className="mt-4 text-xl font-semibold">{p.title}</h2>
                <p className="mt-2 leading-relaxed text-muted-foreground">{p.summary}</p>
                <div className="mt-6 grid gap-6 sm:grid-cols-[1.3fr_1fr]">
                  <div>
                    <h3 className="eyebrow mb-3 text-muted-foreground">Modules</h3>
                    <ul className="space-y-2 text-sm">
                      {p.modules.map((m) => (
                        <li key={m} className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />{m}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="eyebrow mb-3 text-muted-foreground">Tools</h3>
                    <ul className="flex flex-wrap gap-1.5">
                      {p.tools.map((t) => <li key={t} className="rounded bg-muted px-2 py-0.5 font-mono text-[11px]">{t}</li>)}
                    </ul>
                  </div>
                </div>
                <p className="mt-6 border-t pt-4 text-sm"><span className="font-semibold">Outcome: </span><span className="text-muted-foreground">{p.outcome}</span></p>
              </article>
            ))}
          </div>
        )}
      </section>
      <CtaBand title="Not sure which path fits?" body="Tell us your current role and goals, and we'll suggest a starting point." />
    </>
  );
}
