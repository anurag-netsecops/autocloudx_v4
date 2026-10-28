import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Bot, Boxes, FlaskConical, Github, PlayCircle, Terminal, Workflow } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NetworkTopology } from "@/components/site/NetworkTopology";
import { SectionHeading } from "@/components/site/PageHero";
import { CtaBand } from "@/components/site/CtaBand";
import { LevelBadge } from "@/components/site/LevelBadge";
import { labs, learningPaths, topics } from "@/lib/content";
import { pageHead } from "@/lib/site-config";

export const Route = createFileRoute("/")({
  head: () =>
    pageHead({
      title: "Automate Networks, Build Cloud-Ready Skills",
      description:
        "AutoCloudX (ACX) teaches network automation, network security, cloud networking and Python for network engineers through practical, hands-on labs.",
      path: "/",
    }),
  component: Home,
});

const pillars = [
  { icon: BookOpen, title: "Learn", body: "Structured paths that start from fundamentals and explain the why behind every protocol and tool." },
  { icon: FlaskConical, title: "Build", body: "Lab-first exercises on realistic topologies — routers, firewalls and cloud networks you configure yourself." },
  { icon: Workflow, title: "Automate", body: "Turn manual tasks into reviewed, tested scripts and pipelines you can run safely in production." },
];

function Home() {
  const featured = learningPaths.filter((p) => ["python", "automation", "security", "cloud"].includes(p.id));
  return (
    <>
      {/* Hero */}
      <section className="surface-ink relative overflow-hidden">
        <div className="grid-lines pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-5 pb-20 pt-14 md:pt-20 lg:grid-cols-[1.05fr_1fr] lg:px-8">
          <div className="animate-fade-up">
            <p className="eyebrow mb-5 inline-flex items-center gap-2 rounded-full border border-ink-border px-3 py-1 text-cyan">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan" /> AutoCloudX · ACX
            </p>
            <h1 className="text-4xl font-semibold leading-[1.05] sm:text-5xl lg:text-6xl">
              Automate the network.
              <br />
              <span className="text-gradient">Build cloud-ready skills.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-muted">
              Practical training for network and security engineers moving into automation, cloud networking and
              AI-assisted operations — taught through labs that mirror real infrastructure work.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="hero" size="lg">
                <Link to="/learning-paths">Explore Learning Paths <ArrowRight /></Link>
              </Button>
              <Button asChild variant="heroOutline" size="lg">
                <Link to="/contact">Talk to AutoCloudX</Link>
              </Button>
            </div>
            <ul className="mt-10 flex flex-wrap gap-2" aria-label="Topics covered">
              {topics.map((t) => (
                <li key={t} className="rounded-full border border-ink-border bg-ink-foreground/5 px-3 py-1 font-mono text-xs text-ink-foreground/80">{t}</li>
              ))}
            </ul>
          </div>
          <div className="relative">
            <div className="aspect-[680/480] w-full rounded-2xl border border-ink-border bg-ink-2/40 p-2 backdrop-blur">
              <NetworkTopology />
            </div>
            <div className="absolute -bottom-6 left-4 right-4 rounded-xl border border-ink-border bg-ink/90 p-4 font-mono text-xs leading-relaxed shadow-glow sm:left-auto sm:w-80">
              <p className="text-ink-muted">$ python push_ospf.py --dry-run</p>
              <p className="text-cyan">✓ rendered 4 configs from inventory.yml</p>
              <p className="text-ink-foreground/80">→ diff: +router ospf 10 · +passive-interface default</p>
              <p className="text-ink-muted">awaiting approval…</p>
            </div>
          </div>
        </div>
      </section>

      {/* Learn Build Automate */}
      <section className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
        <SectionHeading eyebrow="The ACX approach" title="Learn it. Build it. Automate it." intro="Every topic moves through the same loop, so concepts become muscle memory and then become code." />
        <ol className="grid gap-px overflow-hidden rounded-2xl border bg-border md:grid-cols-3">
          {pillars.map((p, i) => (
            <li key={p.title} className="group bg-card p-8 transition-colors hover:bg-accent/40">
              <div className="flex items-center justify-between">
                <p.icon className="h-6 w-6 text-primary" aria-hidden="true" />
                <span className="font-mono text-xs text-muted-foreground">0{i + 1}</span>
              </div>
              <h3 className="mt-6 text-xl font-semibold">{p.title}</h3>
              <p className="mt-2 leading-relaxed text-muted-foreground">{p.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Featured tracks */}
      <section className="border-y bg-secondary/50">
        <div className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <SectionHeading eyebrow="Featured tracks" title="Where most engineers start" />
            <Link to="/learning-paths" className="mb-10 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
              View all eight learning paths <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((p) => (
              <Link key={p.id} to="/learning-paths" hash={p.id} className="group flex flex-col rounded-xl border bg-card p-6 shadow-card transition-all hover:-translate-y-1 hover:border-primary/40">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-muted-foreground">{p.category}</span>
                  <LevelBadge level={p.level} />
                </div>
                <h3 className="mt-5 text-lg font-semibold leading-snug">{p.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{p.summary}</p>
                <span className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-primary">See modules <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Labs showcase */}
      <section className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
        <SectionHeading eyebrow="Labs & projects" title="Real tasks, not toy examples" intro="Each lab starts from a scenario an operations team would recognise, then walks through design, code and verification." />
        <div className="grid gap-5 lg:grid-cols-3">
          {labs.slice(0, 3).map((lab) => (
            <article key={lab.id} className="flex flex-col overflow-hidden rounded-xl border bg-card shadow-card">
              <pre className="surface-ink overflow-hidden p-4 font-mono text-[11px] leading-relaxed text-ink-foreground/80" aria-hidden="true">{lab.snippet.split("\n").slice(0, 4).join("\n")}</pre>
              <div className="flex flex-1 flex-col p-6">
                <LevelBadge level={lab.level} />
                <h3 className="mt-3 font-semibold leading-snug">{lab.title}</h3>
                <p className="mt-2 flex-1 text-sm text-muted-foreground">{lab.objective}</p>
                <ul className="mt-4 flex flex-wrap gap-1.5">
                  {lab.skills.map((s) => <li key={s} className="rounded bg-muted px-2 py-0.5 font-mono text-[11px]">{s}</li>)}
                </ul>
              </div>
            </article>
          ))}
        </div>
        <div className="mt-8">
          <Button asChild variant="outline"><Link to="/labs">Browse all labs and projects <ArrowRight /></Link></Button>
        </div>
      </section>

      {/* AI preview */}
      <section className="surface-ink">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-24 lg:grid-cols-2 lg:px-8">
          <div>
            <p className="eyebrow mb-3 text-cyan">AI Network Mentor · preview</p>
            <h2 className="text-3xl font-semibold leading-tight md:text-4xl">A study partner that speaks network.</h2>
            <p className="mt-4 text-lg leading-relaxed text-ink-muted">
              Ask about protocol behaviour, get a learning plan, or see a starter automation script. The current demo
              uses curated answers so you can try the experience before live AI is connected.
            </p>
            <Button asChild variant="hero" size="lg" className="mt-8"><Link to="/ai-mentor">Try the mentor demo <Bot /></Link></Button>
          </div>
          <div className="rounded-2xl border border-ink-border bg-ink-2/60 p-5 font-sans text-sm">
            <div className="ml-auto w-fit max-w-[80%] rounded-xl bg-electric px-4 py-2.5 text-ink-foreground">Why is my OSPF neighbor stuck in EXSTART?</div>
            <div className="mt-4 max-w-[90%] rounded-xl bg-ink-foreground/5 px-4 py-3 leading-relaxed text-ink-foreground/90">
              Most often it's an <strong>MTU mismatch</strong>. Compare <code className="font-mono text-cyan">show ip ospf interface</code> on both sides, then check area, timers and authentication…
            </div>
            <p className="mt-4 font-mono text-[11px] text-ink-muted">demo · curated response</p>
          </div>
        </div>
      </section>

      {/* Community / content */}
      <section className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
        <SectionHeading eyebrow="Content & community" title="Learn in public with ACX" intro="AutoCloudX publishes technical walkthroughs, lab breakdowns and automation notes for the networking community." />
        <div className="grid gap-5 md:grid-cols-3">
          {[
            { icon: PlayCircle, t: "Video walkthroughs", d: "Step-by-step lab builds and protocol explanations you can follow along with." },
            { icon: Terminal, t: "Code & lab notes", d: "Readable scripts and topology files you can adapt to your own environment." },
            { icon: Boxes, t: "Career upskilling", d: "Guidance on moving from CLI-first operations into automation and cloud roles." },
          ].map((c) => (
            <div key={c.t} className="rounded-xl border p-6 transition-colors hover:border-primary/40">
              <c.icon className="h-5 w-5 text-primary" aria-hidden="true" />
              <h3 className="mt-4 font-semibold">{c.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{c.d}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 flex items-center gap-2 text-sm text-muted-foreground"><Github className="h-4 w-4" /> Official channel links will be listed here at launch.</p>
      </section>

      <CtaBand />
    </>
  );
}
