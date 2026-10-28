import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight, Info } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PageHero } from "@/components/site/PageHero";
import { CtaBand } from "@/components/site/CtaBand";
import { LevelBadge } from "@/components/site/LevelBadge";
import { labs as staticLabs, type Lab } from "@/lib/content";
import { listPublicLabs } from "@/lib/labs.functions";
import type { PublicLab } from "@/lib/labs-schema";
import { pageHead } from "@/lib/site-config";

type DisplayLab = Lab & { topologyUrl?: string | null };

const labsQueryOptions = queryOptions({
  queryKey: ["public-labs"],
  queryFn: async (): Promise<DisplayLab[]> => {
    try {
      const { labs } = await listPublicLabs();
      return labs.map((l: PublicLab): DisplayLab => ({
        id: l.id, title: l.title, level: l.level, category: l.category,
        objective: l.objective, skills: l.skills, scenario: l.scenario,
        steps: l.steps, outcomes: l.outcomes, snippet: l.snippet,
        ...(l.note ? { note: l.note } : {}), topologyUrl: l.topologyUrl,
      }));
    } catch {
      return staticLabs;
    }
  },
  staleTime: 60_000,
});

export const Route = createFileRoute("/labs")({
  head: () =>
    pageHead({
      title: "Labs & Projects",
      description: "Hands-on ACX labs: OSPF automation with Netmiko, firewall object automation via API, VPC security design, config compliance and event-driven workflows.",
      path: "/labs",
    }),
  loader: ({ context }) => context.queryClient.ensureQueryData(labsQueryOptions),
  component: Labs,
});

function Labs() {
  const { data: labs } = useSuspenseQuery(labsQueryOptions);
  const [active, setActive] = useState<DisplayLab | null>(null);
  return (
    <>
      <PageHero eyebrow="Labs & projects" title="Practice on the problems you'll actually solve.">
        Guided projects built around realistic operations scenarios. Each includes an objective, the skills involved, steps and a verifiable outcome.
      </PageHero>
      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {labs.map((lab) => (
            <article key={lab.id} className="group flex flex-col rounded-2xl border bg-card p-6 shadow-card transition-all hover:-translate-y-1 hover:border-primary/40">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-muted-foreground">{lab.category}</span>
                <LevelBadge level={lab.level} />
              </div>
              <h2 className="mt-4 text-lg font-semibold leading-snug">{lab.title}</h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{lab.objective}</p>
              <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Skills">
                {lab.skills.map((s) => <li key={s} className="rounded bg-muted px-2 py-0.5 font-mono text-[11px]">{s}</li>)}
              </ul>
              <button
                type="button"
                onClick={() => setActive(lab)}
                className="mt-6 inline-flex items-center gap-1 self-start text-sm font-medium text-primary hover:underline"
              >
                View lab details<span className="sr-only">: {lab.title}</span> <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </article>
          ))}
        </div>
        {labs.length === 0 && <p className="py-12 text-center text-muted-foreground">No labs published yet — check back soon.</p>}
      </section>

      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          {active && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2"><LevelBadge level={active.level} /><span className="font-mono text-xs text-muted-foreground">{active.category}</span></div>
                <DialogTitle className="text-xl leading-snug">{active.title}</DialogTitle>
                <DialogDescription>{active.objective}</DialogDescription>
              </DialogHeader>
              {active.note && (
                <p className="flex gap-2 rounded-lg bg-accent/60 p-3 text-xs text-accent-foreground"><Info className="h-4 w-4 shrink-0" />{active.note}</p>
              )}
              {active.topologyUrl && (
                <figure>
                  <img src={active.topologyUrl} alt={`Network topology diagram for ${active.title}`} className="w-full rounded-lg border" />
                  <figcaption className="mt-1 text-xs text-muted-foreground">Lab topology</figcaption>
                </figure>
              )}
              <div className="space-y-5 text-sm">
                <div><h3 className="eyebrow mb-2 text-muted-foreground">Scenario</h3><p className="leading-relaxed">{active.scenario}</p></div>
                <div>
                  <h3 className="eyebrow mb-2 text-muted-foreground">Steps</h3>
                  <ol className="list-decimal space-y-1 pl-5">{active.steps.map((s) => <li key={s}>{s}</li>)}</ol>
                </div>
                {active.snippet && (
                  <div>
                    <h3 className="eyebrow mb-2 text-muted-foreground">Example</h3>
                    <pre className="surface-ink overflow-x-auto rounded-lg p-4 font-mono text-xs leading-relaxed"><code>{active.snippet}</code></pre>
                  </div>
                )}
                <div>
                  <h3 className="eyebrow mb-2 text-muted-foreground">Learning outcomes</h3>
                  <ul className="list-disc space-y-1 pl-5">{active.outcomes.map((o) => <li key={o}>{o}</li>)}</ul>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      <CtaBand title="Want a lab built around your environment?" body="Teams can request scenarios that match their platforms and workflows." />
    </>
  );
}
