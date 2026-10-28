import type { ReactNode } from "react";

export function PageHero({ eyebrow, title, children }: { eyebrow: string; title: ReactNode; children?: ReactNode }) {
  return (
    <section className="surface-ink relative overflow-hidden">
      <div className="grid-lines pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="relative mx-auto max-w-7xl px-5 py-16 md:py-24 lg:px-8">
        <p className="eyebrow mb-4 text-cyan">{eyebrow}</p>
        <h1 className="max-w-3xl text-4xl font-semibold leading-[1.08] md:text-5xl">{title}</h1>
        {children && <div className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-muted">{children}</div>}
      </div>
    </section>
  );
}

export function SectionHeading({ eyebrow, title, intro }: { eyebrow: string; title: string; intro?: string }) {
  return (
    <div className="mb-10 max-w-2xl">
      <p className="eyebrow mb-3 text-primary">{eyebrow}</p>
      <h2 className="text-3xl font-semibold leading-tight md:text-4xl">{title}</h2>
      {intro && <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{intro}</p>}
    </div>
  );
}
