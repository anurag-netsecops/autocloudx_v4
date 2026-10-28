import { createFileRoute, Link } from "@tanstack/react-router";
import { Lock, PlayCircle } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { LevelBadge } from "@/components/site/LevelBadge";
import { Button } from "@/components/ui/button";
import { getPublishedCourses } from "@/lib/courses.functions";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { pageHead } from "@/lib/site-config";

export const catalogueOptions = queryOptions({ queryKey: ["published-courses"], queryFn: () => getPublishedCourses() });
export const Route = createFileRoute("/courses")({
  loader: ({ context }) => context.queryClient.ensureQueryData(catalogueOptions),
  head: () =>
    pageHead({
      title: "Video Courses",
      description: "AutoCloudX video courses on network automation, security and cloud networking — available to signed-in students.",
      path: "/courses",
    }),
  component: Courses,
});

function Courses() {
  const { data: courses } = useSuspenseQuery(catalogueOptions);
  return (
    <>
      <PageHero eyebrow="Video courses" title="Watch, then build it yourself.">
        Step-by-step video lessons that pair with our labs. Sign in with a free student account to watch.
      </PageHero>
      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        {courses.length === 0 ? (
          <p className="text-muted-foreground">New courses are coming soon.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((c) => (
              <article key={c.id} className="flex flex-col rounded-2xl border bg-card p-6 shadow-card">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-muted-foreground">{c.category}</span>
                  <LevelBadge level={c.level} />
                </div>
                <h2 className="mt-4 text-lg font-semibold leading-snug">{c.title}</h2>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{c.summary}</p>
                <p className="mt-4 flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
                  <PlayCircle className="h-3.5 w-3.5" /> {c.lessons.length} lessons
                  <Lock className="ml-2 h-3.5 w-3.5" /> Students only
                </p>
                <Button asChild className="mt-5">
                  <Link to="/courses/$courseId" params={{ courseId: c.id }}>Watch course</Link>
                </Button>
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
