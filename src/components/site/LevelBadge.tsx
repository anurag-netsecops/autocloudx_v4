import type { Level } from "@/lib/content";

const styles: Record<Level, string> = {
  Beginner: "bg-success/10 text-success border-success/30",
  Intermediate: "bg-primary/10 text-primary border-primary/30",
  Advanced: "bg-violet/10 text-violet border-violet/30",
};

export function LevelBadge({ level }: { level: Level }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-[11px] font-medium ${styles[level]}`}>
      {level}
    </span>
  );
}
