import { z } from "zod";

const stringList = z.array(z.string().trim().min(1).max(500)).max(50);

export const labSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]{1,100}$/, "Use lowercase letters, numbers and hyphens"),
  title: z.string().trim().min(1).max(200),
  category: z.enum(["Networking", "Automation", "Security", "Cloud", "AI"]),
  level: z.enum(["Beginner", "Intermediate", "Advanced"]),
  objective: z.string().trim().min(1).max(1000),
  skills: stringList,
  scenario: z.string().trim().max(2000).default(""),
  steps: stringList.min(1, "Add at least one step"),
  outcomes: stringList,
  snippet: z.string().max(5000).default(""),
  note: z.string().trim().max(500).default(""),
  topologyPath: z.string().max(300).nullable().default(null),
  published: z.boolean().default(false),
});

export type EditableLab = z.infer<typeof labSchema>;

export type PublicLab = EditableLab & { topologyUrl: string | null };
