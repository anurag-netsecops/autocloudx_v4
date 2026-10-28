import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Info, Loader2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/site/PageHero";
import { contactSchema, type ContactInput } from "@/lib/contact-schema";
import { pageHead, siteConfig } from "@/lib/site-config";

export const Route = createFileRoute("/contact")({
  head: () =>
    pageHead({
      title: "Contact",
      description: "Talk to AutoCloudX about training, hands-on labs, team upskilling or practical network automation guidance.",
      path: "/contact",
    }),
  component: Contact,
});

type Errors = Partial<Record<keyof ContactInput, string>>;
const empty = { name: "", email: "", interest: "", message: "" };

const fieldCls = "w-full rounded-lg border border-input bg-card px-3 py-2.5 text-sm aria-[invalid=true]:border-destructive";

function Contact() {
  const [values, setValues] = useState(empty);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");

  const set = (k: keyof typeof empty) => (e: { target: { value: string } }) => {
    setValues((v) => ({ ...v, [k]: e.target.value }));
    if (errors[k as keyof Errors]) setErrors((er) => ({ ...er, [k]: undefined }));
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const parsed = contactSchema.safeParse(values);
    if (!parsed.success) {
      const errs: Errors = {};
      for (const issue of parsed.error.issues) errs[issue.path[0] as keyof Errors] ??= issue.message;
      setErrors(errs);
      document.getElementById(`f-${Object.keys(errs)[0]}`)?.focus();
      return;
    }
    setStatus("sending");
    // TODO(launch): send parsed.data to a server function / email provider.
    window.setTimeout(() => setStatus("sent"), 700);
  };

  return (
    <>
      <PageHero eyebrow="Contact" title="Talk to AutoCloudX.">
        Questions about learning paths, team training or a specific automation problem? Send a short note.
      </PageHero>
      <section className="mx-auto grid max-w-7xl gap-12 px-5 py-16 lg:grid-cols-[1.3fr_1fr] lg:px-8">
        <div className="rounded-2xl border bg-card p-6 shadow-card md:p-8">
          {status === "sent" ? (
            <div className="py-10 text-center" role="status">
              <CheckCircle2 className="mx-auto h-10 w-10 text-success" />
              <h2 className="mt-4 text-2xl font-semibold">Thanks, {values.name.split(" ")[0]}.</h2>
              <p className="mx-auto mt-2 max-w-sm text-muted-foreground">Your message passed validation. In this preview it isn't delivered anywhere yet — message delivery will be connected before launch.</p>
              <Button className="mt-6" variant="outline" onClick={() => { setValues(empty); setStatus("idle"); }}>Send another message</Button>
            </div>
          ) : (
            <form noValidate onSubmit={onSubmit} className="space-y-5">
              <Field id="name" label="Name" error={errors.name}>
                <input id="f-name" className={fieldCls} value={values.name} onChange={set("name")} autoComplete="name" maxLength={100} aria-invalid={!!errors.name} aria-describedby={errors.name ? "e-name" : undefined} />
              </Field>
              <Field id="email" label="Email" error={errors.email}>
                <input id="f-email" type="email" className={fieldCls} value={values.email} onChange={set("email")} autoComplete="email" maxLength={255} aria-invalid={!!errors.email} aria-describedby={errors.email ? "e-email" : undefined} />
              </Field>
              <Field id="interest" label="I'm interested in" error={errors.interest}>
                <select id="f-interest" className={fieldCls} value={values.interest} onChange={set("interest")} aria-invalid={!!errors.interest} aria-describedby={errors.interest ? "e-interest" : undefined}>
                  <option value="">Select a topic…</option>
                  <option value="training">Individual training / learning paths</option>
                  <option value="labs">Hands-on labs & projects</option>
                  <option value="team">Team upskilling</option>
                  <option value="content">Content & collaboration</option>
                  <option value="other">Something else</option>
                </select>
              </Field>
              <Field id="message" label="Message" error={errors.message} hint={`${values.message.length}/1000`}>
                <textarea id="f-message" rows={5} className={fieldCls} value={values.message} onChange={set("message")} maxLength={1000} aria-invalid={!!errors.message} aria-describedby={errors.message ? "e-message" : undefined} />
              </Field>
              <Button type="submit" size="lg" disabled={status === "sending"} className="w-full sm:w-auto">
                {status === "sending" ? <><Loader2 className="animate-spin" /> Sending…</> : "Send message"}
              </Button>
            </form>
          )}
        </div>
        <aside className="space-y-5 text-sm">
          <div className="rounded-xl border p-5">
            <h2 className="font-semibold">Other ways to reach ACX</h2>
            {siteConfig.contact.email ? (
              <p className="mt-2"><a className="text-primary hover:underline" href={`mailto:${siteConfig.contact.email}`}>{siteConfig.contact.email}</a></p>
            ) : (
              <p className="mt-2 text-muted-foreground">Official email and booking links will be published here at launch. For now, please use the form.</p>
            )}
            {siteConfig.contact.bookingUrl && (
              <a className="mt-2 inline-block text-primary hover:underline" href={siteConfig.contact.bookingUrl} target="_blank" rel="noopener noreferrer">Book a call</a>
            )}
          </div>
          <div className="flex gap-2 rounded-xl border border-dashed p-5 text-muted-foreground">
            <Info className="h-4 w-4 shrink-0" />
            <p>Site owner: set the official contact details in the site configuration and connect form delivery before launch — see the launch checklist in the README.</p>
          </div>
          <p className="text-muted-foreground">Looking for something to start with right now? <Link to="/labs" className="text-primary hover:underline">Browse the labs</Link>.</p>
        </aside>
      </section>
    </>
  );
}

function Field({ id, label, error, hint, children }: { id: string; label: string; error?: string | undefined; hint?: string | undefined; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1.5 flex justify-between">
        <label htmlFor={`f-${id}`} className="text-sm font-medium">{label}</label>
        {hint && <span className="font-mono text-xs text-muted-foreground">{hint}</span>}
      </div>
      {children}
      {error && <p id={`e-${id}`} className="mt-1.5 text-xs text-destructive">{error}</p>}
    </div>
  );
}
