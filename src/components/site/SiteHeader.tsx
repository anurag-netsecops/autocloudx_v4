import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getAdminAccess } from "@/lib/course-editor.functions";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { navLinks } from "@/lib/site-config";
import { Logo } from "./Logo";
import { supabase } from "@/integrations/supabase/client";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const accessFn = useServerFn(getAdminAccess);
  const { data: access } = useQuery({ queryKey: ["admin-access"], queryFn: () => accessFn(), enabled: signedIn });
  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    await navigate({ to: "/auth", search: { redirect: "/courses" }, replace: true });
  }

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => setSignedIn(!!data.session));
    const { data } = supabase.auth.onAuthStateChange((_e, session) => setSignedIn(!!session));
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-ink-border bg-ink/85 text-ink-foreground backdrop-blur-xl">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:rounded focus:bg-primary focus:px-3 focus:py-1 focus:text-primary-foreground">
        Skip to content
      </a>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-8">
        <Logo />
        <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="rounded-md px-3 py-2 text-sm text-ink-muted transition-colors hover:text-ink-foreground"
              activeProps={{ className: "!text-ink-foreground bg-ink-foreground/5" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          {signedIn && access?.isAdmin && <><Link to="/admin/courses" className="text-sm text-ink-muted hover:text-ink-foreground">Course editor</Link><Link to="/admin/labs" className="text-sm text-ink-muted hover:text-ink-foreground">Lab editor</Link></>}
          {signedIn ? (
            <Button variant="ghost" size="sm" onClick={() => void signOut()}>Sign out</Button>
          ) : (
            <Link to="/auth" search={{ redirect: "/courses" }} className="px-2 text-sm text-ink-muted hover:text-ink-foreground">Student sign in</Link>
          )}
          <Button asChild variant="hero" size="sm">
            <Link to="/contact">Talk to AutoCloudX</Link>
          </Button>
        </div>
        <Button variant="ghost" size="icon"
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-md hover:bg-ink-foreground/10 md:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>
      {open && (
        <nav id="mobile-nav" aria-label="Mobile" className="border-t border-ink-border px-5 pb-5 pt-2 md:hidden">
          <ul className="flex flex-col">
            {[{ to: "/", label: "Home" } as const, ...navLinks, { to: "/contact", label: "Contact" } as const].map((l) => (
              <li key={l.to}>
                <Link
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className="block rounded-md px-3 py-3 text-base text-ink-muted hover:bg-ink-foreground/5 hover:text-ink-foreground"
                  activeProps={{ className: "!text-ink-foreground" }}
                  activeOptions={{ exact: l.to === "/" }}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-ink-border pt-4">
            {signedIn && access?.isAdmin && <><Link to="/admin/courses" onClick={() => setOpen(false)}>Course editor</Link><Link to="/admin/labs" onClick={() => setOpen(false)}>Lab editor</Link></>}
            {signedIn ? <Button variant="ghost" onClick={() => { setOpen(false); void signOut(); }}>Sign out</Button> : <Link to="/auth" search={{ redirect: "/courses" }} onClick={() => setOpen(false)}>Student sign in</Link>}
          </div>
        </nav>
      )}
    </header>
  );
}
