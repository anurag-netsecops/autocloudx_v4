import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CtaBand({
  title = "Start with one lab. Automate one real task.",
  body = "Pick a learning path that matches where you are today, or tell us what your team needs to automate.",
}: { title?: string; body?: string }) {
  return (
    <section className="px-5 py-20 lg:px-8">
      <div className="surface-ink relative mx-auto max-w-7xl overflow-hidden rounded-2xl px-6 py-14 md:px-14">
        <div className="grid-lines pointer-events-none absolute inset-0 opacity-70" aria-hidden="true" />
        <div className="relative flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl">
            <h2 className="text-3xl font-semibold leading-tight md:text-4xl">{title}</h2>
            <p className="mt-3 text-ink-muted">{body}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="hero" size="lg">
              <Link to="/learning-paths">Explore Learning Paths <ArrowRight /></Link>
            </Button>
            <Button asChild variant="heroOutline" size="lg">
              <Link to="/contact">Talk to AutoCloudX</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
