import { Link } from "@tanstack/react-router";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`group inline-flex items-center gap-2.5 ${className}`} aria-label="AutoCloudX home">
      <svg viewBox="0 0 32 32" className="h-8 w-8" aria-hidden="true">
        <defs>
          <linearGradient id="acx-g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="var(--cyan)" />
            <stop offset="1" stopColor="var(--violet)" />
          </linearGradient>
        </defs>
        <rect x="1" y="1" width="30" height="30" rx="8" fill="var(--ink-2)" stroke="url(#acx-g)" strokeWidth="1.5" />
        <path d="M9 22 L16 9 L23 22 M12 18 H20" fill="none" stroke="url(#acx-g)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="16" cy="9" r="2" fill="var(--cyan)" />
      </svg>
      <span className="font-display text-lg font-semibold tracking-tight">
        AutoCloud<span className="text-gradient">X</span>
      </span>
    </Link>
  );
}
