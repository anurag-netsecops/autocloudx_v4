import { Link } from "@tanstack/react-router";
import { navLinks, siteConfig } from "@/lib/site-config";
import { Logo } from "./Logo";

export function SiteFooter() {
  return (
    <footer className="surface-ink border-t border-ink-border">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 md:grid-cols-[1.4fr_1fr_1fr] lg:px-8">
        <div className="max-w-sm space-y-4">
          <Logo />
          <p className="text-sm leading-relaxed text-ink-muted">{siteConfig.tagline}</p>
          <p className="text-xs text-ink-muted/80">
            ACX learning paths are independent training. They are not official vendor certifications or exam
            preparation endorsed by Cisco, Palo Alto Networks, Fortinet, AWS, Microsoft or Google.
          </p>
        </div>
        <div>
          <h2 className="eyebrow mb-4 text-ink-muted">Explore</h2>
          <ul className="space-y-2 text-sm">
            {navLinks.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="text-ink-foreground/85 hover:text-cyan">{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="eyebrow mb-4 text-ink-muted">Connect</h2>
          <ul className="space-y-2 text-sm">
            <li><Link to="/contact" className="text-ink-foreground/85 hover:text-cyan">Contact AutoCloudX</Link></li>
            {siteConfig.contact.channels.map((c) => (
              <li key={c.href}><a href={c.href} className="text-ink-foreground/85 hover:text-cyan" rel="noopener noreferrer" target="_blank">{c.label}</a></li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-ink-border">
        <p className="mx-auto max-w-7xl px-5 py-5 text-xs text-ink-muted lg:px-8">
          © {new Date().getFullYear()} AutoCloudX (ACX). All rights reserved.
        </p>
      </div>
    </footer>
  );
}
