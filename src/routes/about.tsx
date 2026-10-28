import { createFileRoute } from "@tanstack/react-router";
import { PageHero, SectionHeading } from "@/components/site/PageHero";
import { CtaBand } from "@/components/site/CtaBand";
import { pageHead } from "@/lib/site-config";

export const Route = createFileRoute("/about")({
  head: () =>
    pageHead({
      title: "About",
      description: "AutoCloudX (ACX) helps network professionals build practical automation, security and cloud skills through lab-first teaching.",
      path: "/about",
    }),
  component: About,
});

const principles = [
  { t: "Fundamentals before frameworks", d: "Automation amplifies understanding. We make sure you know what the protocol is doing before you script it." },
  { t: "Lab-first, always", d: "Every concept is paired with something you configure, break and fix yourself." },
  { t: "Safe change over clever code", d: "Dry-runs, diffs, pre/post checks and version control are part of every automation lesson." },
  { t: "Vendor-aware, vendor-neutral", d: "We use real platforms as examples while teaching principles that transfer across them." },
  { t: "Honest about AI", d: "AI is a useful assistant for operations — with human review, guardrails and attention to data privacy." },
];

const audiences = [
  "CCNA and CCNP learners",
  "Engineering students entering networking",
  "Network and security engineers",
  "Cloud engineers working with hybrid networks",
  "Teams automating real infrastructure",
];

function About() {
  return (
    <>
      <PageHero eyebrow="About AutoCloudX" title="Practical skills for the engineers who keep networks running.">
        AutoCloudX (ACX) is a technology learning and solutions brand focused on network automation, security, cloud networking and DevOps practices for infrastructure teams.
      </PageHero>
      <section className="mx-auto grid max-w-7xl gap-12 px-5 py-20 lg:grid-cols-2 lg:px-8">
        <div>
          <SectionHeading eyebrow="Mission" title="Close the gap between the CLI and the pipeline." />
          <p className="leading-relaxed text-muted-foreground">
            Many skilled network engineers know their infrastructure deeply but haven't had a clear, practical route into automation and cloud.
            ACX exists to provide that route — with content, labs and guidance grounded in how real networks are built and operated.
          </p>
        </div>
        <div>
          <SectionHeading eyebrow="Who it's for" title="Built for working engineers and learners." />
          <ul className="space-y-3">
            {audiences.map((a) => (
              <li key={a} className="flex items-center gap-3 rounded-lg border bg-card px-4 py-3 text-sm"><span className="h-1.5 w-1.5 rounded-full bg-primary" />{a}</li>
            ))}
          </ul>
        </div>
      </section>
      <section className="border-y bg-secondary/50">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
          <SectionHeading eyebrow="Teaching principles" title="How we teach" />
          <ol className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {principles.map((p, i) => (
              <li key={p.t} className="rounded-xl border bg-card p-6">
                <span className="font-mono text-xs text-primary">0{i + 1}</span>
                <h3 className="mt-3 font-semibold">{p.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
      <CtaBand />
    </>
  );
}
