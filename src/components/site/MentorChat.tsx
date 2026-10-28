import { Bot, Info, RotateCcw, Send, User } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { getMentorReply, mentorTopics } from "@/lib/mentor";

interface Msg { role: "user" | "assistant"; text: string }

/** Lightweight renderer for **bold**, `code` and ``` fenced blocks. */
function RichText({ text }: { text: string }) {
  const parts = text.split(/```(?:\w+)?\n?([\s\S]*?)```/g);
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <pre key={i} className="my-3 overflow-x-auto rounded-lg bg-ink p-3 font-mono text-xs leading-relaxed text-ink-foreground"><code>{part.trim()}</code></pre>
        ) : (
          <span key={i} className="whitespace-pre-wrap">
            {part.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((t, j) =>
              t.startsWith("**") ? <strong key={j}>{t.slice(2, -2)}</strong>
              : t.startsWith("`") ? <code key={j} className="rounded bg-muted px-1 py-0.5 font-mono text-[0.85em]">{t.slice(1, -1)}</code>
              : t,
            )}
          </span>
        ),
      )}
    </>
  );
}

export function MentorChat() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, thinking]);

  const ask = (q: string) => {
    const text = q.trim();
    if (!text || thinking) return;
    setMessages((m) => [...m, { role: "user", text }]);
    setInput("");
    setThinking(true);
    window.setTimeout(() => {
      setMessages((m) => [...m, { role: "assistant", text: getMentorReply(text).reply }]);
      setThinking(false);
    }, 650);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    ask(input);
  };

  return (
    <div className="overflow-hidden rounded-2xl border bg-card shadow-card">
      <div className="flex items-center justify-between border-b px-5 py-3">
        <div className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-accent text-ink"><Bot className="h-4 w-4" /></span>
          <div>
            <p className="text-sm font-semibold">ACX Network Mentor</p>
            <p className="font-mono text-[11px] text-muted-foreground">demo · curated responses</p>
          </div>
        </div>
        {messages.length > 0 && (
          <Button variant="ghost" size="sm" onClick={() => setMessages([])}><RotateCcw /> Reset</Button>
        )}
      </div>

      <div className="flex items-start gap-2 border-b bg-accent/60 px-5 py-2.5 text-xs text-accent-foreground">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <p>This demo runs in your browser with pre-written answers. No AI model is connected yet — live responses require an AI provider integration.</p>
      </div>

      <div className="h-[26rem] overflow-y-auto px-5 py-5" aria-live="polite" aria-label="Conversation">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <p className="font-display text-lg font-semibold">Ask about networking, automation or cloud.</p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">Start with a suggested prompt below, or type your own question.</p>
          </div>
        ) : (
          <ul className="space-y-5">
            {messages.map((m, i) => (
              <li key={i} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full ${m.role === "user" ? "bg-secondary" : "bg-ink text-cyan"}`}>
                  {m.role === "user" ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
                  <span className="sr-only">{m.role === "user" ? "You" : "Mentor"}</span>
                </span>
                <div className={`max-w-[85%] rounded-xl px-4 py-3 text-sm leading-relaxed ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                  <RichText text={m.text} />
                </div>
              </li>
            ))}
            {thinking && (
              <li className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-ink text-cyan"><Bot className="h-3.5 w-3.5" /></span>
                <span className="animate-pulse">Mentor is preparing an answer…</span>
              </li>
            )}
          </ul>
        )}
        <div ref={endRef} />
      </div>

      <div className="border-t px-5 py-4">
        <div className="mb-3 flex flex-wrap gap-2" role="group" aria-label="Suggested prompts">
          {mentorTopics.map((t) => (
            <button
              key={t.id}
              type="button"
              disabled={thinking}
              onClick={() => ask(t.prompt)}
              className="rounded-full border px-3 py-1.5 text-xs text-foreground/80 transition-colors hover:border-primary hover:text-primary disabled:opacity-50"
            >
              {t.label}
            </button>
          ))}
        </div>
        <form onSubmit={onSubmit} className="flex gap-2">
          <label htmlFor="mentor-input" className="sr-only">Your question</label>
          <input
            id="mentor-input"
            value={input}
            maxLength={500}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. Why is my OSPF neighbor stuck in EXSTART?"
            className="h-10 flex-1 rounded-lg border border-input bg-background px-3 text-sm focus-visible:ring-2 focus-visible:ring-ring"
          />
          <Button type="submit" disabled={!input.trim() || thinking} aria-label="Send question"><Send /></Button>
        </form>
      </div>
    </div>
  );
}
