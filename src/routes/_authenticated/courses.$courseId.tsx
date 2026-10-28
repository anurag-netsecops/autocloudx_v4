import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { getCourseVideos, getPublishedCourses } from "@/lib/courses.functions";
import { CourseLessonPlayer } from "@/components/site/CourseLessonPlayer";
import { LevelBadge } from "@/components/site/LevelBadge";

export const Route = createFileRoute("/_authenticated/courses/$courseId")({
  loader: async ({ params }) => {
    const courses = await getPublishedCourses();
    const course = courses.find((c) => c.id === params.courseId);
    if (!course) throw notFound();
    return { course };
  },
  head: ({ loaderData }) => {
    const title = `${loaderData?.course.title ?? "Course"} | AutoCloudX (ACX)`;
    const description = loaderData?.course.summary ?? "AutoCloudX video course.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary" },
      ],
    };
  },
  component: CoursePlayer,
});

function CoursePlayer() {
  const { course } = Route.useLoaderData();
  const fetchVideos = useServerFn(getCourseVideos);
  const { data, isLoading, error } = useQuery({
    queryKey: ["course-videos", course.id],
    queryFn: () => fetchVideos({ data: { courseId: course.id } }),
  });
  const [activeId, setActiveId] = useState(course.lessons[0]?.id ?? "");
  const fileId = data?.videos[activeId] ?? null;

  return (
    <section className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
      <Link to="/courses" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> All courses
      </Link>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold md:text-3xl">{course.title}</h1>
        <LevelBadge level={course.level} />
      </div>
      <div className="mt-8">
        <CourseLessonPlayer lessons={course.lessons} activeId={activeId} onSelect={setActiveId} fileId={error ? null : fileId} loading={isLoading}
          unavailable={error ? <span className="text-destructive">Couldn't load this video. Please refresh.</span> : "This lesson's video is coming soon."} />
      </div>
    </section>
  );
}
