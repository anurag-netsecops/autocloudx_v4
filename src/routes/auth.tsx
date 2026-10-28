import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function safePath(p: unknown) {
  return typeof p === "string" && p.startsWith("/") && !p.startsWith("//") ? p : "/courses";
}

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>) => ({ redirect: safePath(s["redirect"]) }),
  head: () => ({
    meta: [
      { title: "Student sign in | AutoCloudX (ACX)" },
      { name: "description", content: "Sign in or create a free AutoCloudX student account to watch video courses." },
      { property: "og:title", content: "Student sign in | AutoCloudX (ACX)" },
      { property: "og:description", content: "Sign in to watch AutoCloudX video courses." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { redirect } = Route.useSearch();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin + redirect },
        });
        if (error) throw error;
        setSent(true);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: redirect, replace: true });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  async function onGoogle() {
    sessionStorage.setItem("acx-after-login", redirect);
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/auth" });
    if (result.error) {
      toast.error("Google sign-in failed");
      return;
    }
    if (result.redirected) return;
    navigate({ to: redirect, replace: true });
  }

  // Returning from Google: session is set, continue to the saved page.
  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      const after = sessionStorage.getItem("acx-after-login");
      if (data.session && after) {
        sessionStorage.removeItem("acx-after-login");
        navigate({ to: safePath(after), replace: true });
      }
    });
  }, [navigate]);

  return (
    <section className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-5 py-16">
      <p className="eyebrow mb-3 text-primary">Student access</p>
      <h1 className="text-3xl font-semibold">{mode === "signin" ? "Sign in to watch courses" : "Create your student account"}</h1>
      {sent ? (
        <p className="mt-6 rounded-lg border bg-card p-4 text-sm">Check your email to confirm your account, then sign in.</p>
      ) : (
        <>
          <Button type="button" variant="outline" className="mt-8 w-full" onClick={onGoogle}>
            Continue with Google
          </Button>
          <div className="my-6 text-center font-mono text-xs text-muted-foreground">or with email</div>
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required minLength={6} autoComplete={mode === "signin" ? "current-password" : "new-password"} value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button type="submit" disabled={busy}>{busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}</Button>
          </form>
          <button type="button" className="mt-4 text-sm text-primary hover:underline" onClick={() => setMode(mode === "signin" ? "signup" : "signin")}>
            {mode === "signin" ? "New here? Create an account" : "Already have an account? Sign in"}
          </button>
        </>
      )}
    </section>
  );
}
