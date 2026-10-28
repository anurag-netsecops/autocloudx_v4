import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site/PageHero";
import { MentorChat } from "@/components/site/MentorChat";
import { pageHead } from "@/lib/site-config";

export const Route = createFileRoute("/ai-mentor")({
  head: () =>
    pageHead({
      title: "AI Network Mentor (Demo)",
      description: "Try the ACX AI Network Mentor demo: curated answers on OSPF, Python automation, cloud networking, firewall reviews and learning plans.",
      path: "/ai-mentor",
    }),
  component: AiMentor,
});

function AiMentor() {
  return (
    <>
      <PageHero eyebrow="AI Network Mentor · demo" title="Ask a networking question. Get a practical answer.">
        A preview of the ACX mentor experience. Answers here are curated by hand; a live AI model will be connected in a future release.
      </PageHero>
      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-16 lg:grid-cols-[1fr_20rem] lg:px-8">
        <MentorChat />
        <aside className="space-y-6 text-sm">
          <div className="rounded-xl border p-5">
            <h2 className="font-semibold">What it covers today</h2>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-muted-foreground">
              <li>OSPF troubleshooting</li>
              <li>90-day automation learning plan</li>
              <li>Python &amp; Netmiko starter scripts</li>
              <li>Cloud security groups vs NACLs</li>
              <li>Firewall rulebase reviews</li>
            </ul>
          </div>
          <div className="rounded-xl border p-5">
            <h2 className="font-semibold">Use AI responsibly</h2>
            <p className="mt-2 leading-relaxed text-muted-foreground">
              Treat any AI answer as a starting point. Verify in a lab, and never paste credentials, customer data or production configs into an AI tool.
            </p>
          </div>
        </aside>
      </section>
    </>
  );
}
