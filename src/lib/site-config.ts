/**
 * Central site configuration. Fill these in before public launch (see README).
 * Leave values as null to keep placeholder-safe UI (no invented contact details).
 */
export const siteConfig = {
  name: "AutoCloudX",
  short: "ACX",
  tagline: "Network automation, security & cloud skills — built hands-on.",
  /** Official production domain, e.g. "https://autocloudx.com". */
  url: null as string | null,
  contact: {
    /** Official business email, e.g. "hello@yourdomain.com". */
    email: null as string | null,
    /** Optional booking link (Calendly, Cal.com, etc.). */
    bookingUrl: null as string | null,
    /** Social / content channels. */
    channels: [] as { label: string; href: string }[],
  },
};

export const navLinks = [
  { to: "/learning-paths", label: "Learning Paths" },
  { to: "/labs", label: "Labs & Projects" },
  { to: "/courses", label: "Courses" },
  { to: "/ai-mentor", label: "AI Mentor" },
  { to: "/about", label: "About" },
] as const;

export function pageHead(opts: { title: string; description: string; path: string }) {
  const title = `${opts.title} | AutoCloudX (ACX)`;
  return {
    meta: [
      { title },
      { name: "description", content: opts.description },
      { property: "og:title", content: title },
      { property: "og:description", content: opts.description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: opts.path },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: opts.description },
    ],
    links: [{ rel: "canonical", href: opts.path }],
  };
}
