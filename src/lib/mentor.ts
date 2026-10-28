/**
 * Curated, local-only responses for the AI Network Mentor demo.
 * Replace `getMentorReply` with a server function calling an AI provider for live answers.
 */
export interface MentorTopic {
  id: string;
  label: string;
  prompt: string;
  keywords: string[];
  reply: string;
}

export const mentorTopics: MentorTopic[] = [
  {
    id: "ospf",
    label: "Explain OSPF neighbor states",
    prompt: "Why is my OSPF neighbor stuck in EXSTART?",
    keywords: ["ospf", "exstart", "neighbor", "adjacency", "exchange"],
    reply: `EXSTART/EXCHANGE stalls are most often an **MTU mismatch** between the two interfaces.

Check, in order:
1. \`show ip ospf interface <int>\` on both sides — compare MTU.
2. Matching area ID, hello/dead timers, authentication and subnet mask.
3. Network type (broadcast vs point-to-point) is consistent.

Fix the MTU properly; use \`ip ospf mtu-ignore\` only as a temporary workaround.`,
  },
  {
    id: "plan",
    label: "Build me a 90-day plan",
    prompt: "I'm CCNA level. Give me a 90-day plan to get into network automation.",
    keywords: ["plan", "roadmap", "90", "career", "start", "learn", "beginner", "ccna"],
    reply: `A practical 90-day plan from CCNA level:

**Days 1–30 · Python foundations**
Variables, loops, files, JSON/YAML. Parse \`show\` output with regex. One small script per week.

**Days 31–60 · Talk to devices**
Netmiko for SSH, Jinja2 templates, Git for every script. Build a config-backup tool.

**Days 61–90 · APIs & safe change**
REST basics, one vendor API in a lab, pre/post checks, dry-run mode. Finish with a portfolio project you can explain in an interview.

Aim for ~1 hour a day, lab-first.`,
  },
  {
    id: "netmiko",
    label: "Python: backup configs",
    prompt: "Show me a Python script to back up switch configs with Netmiko.",
    keywords: ["python", "netmiko", "script", "backup", "ssh", "automation", "code"],
    reply: `A minimal, safe starting point:

\`\`\`python
from datetime import date
from netmiko import ConnectHandler

devices = [{"device_type": "cisco_ios", "host": "10.0.0.11",
            "username": "lab", "password": "use-env-vars"}]

for d in devices:
    with ConnectHandler(**d) as conn:
        cfg = conn.send_command("show running-config")
    with open(f"{d['host']}_{date.today()}.cfg", "w") as f:
        f.write(cfg)
\`\`\`

Next steps: load credentials from environment variables, add try/except per device, and commit the output folder to Git.`,
  },
  {
    id: "cloud",
    label: "Security groups vs NACLs",
    prompt: "What's the difference between AWS security groups and NACLs?",
    keywords: ["aws", "cloud", "vpc", "security group", "nacl", "azure", "gcp", "subnet"],
    reply: `**Security groups** attach to instances/ENIs, are **stateful** (return traffic is allowed automatically) and support allow rules only.

**NACLs** attach to subnets, are **stateless** (you must allow return traffic, including ephemeral ports) and support allow + deny, evaluated by rule number.

Rule of thumb: design least-privilege with security groups referencing each other by tier; use NACLs as a coarse subnet guardrail, e.g. blocking a known-bad range.`,
  },
  {
    id: "firewall",
    label: "Firewall rule review",
    prompt: "How should I review a firewall rulebase for risky rules?",
    keywords: ["firewall", "palo", "fortigate", "rule", "policy", "security", "ngfw"],
    reply: `A quick, repeatable review:

1. **Any/any rules** — source, destination, or service set to any.
2. **Shadowed rules** — never hit because an earlier rule matches first.
3. **Zero-hit rules** over 90 days — candidates for removal (confirm with owners).
4. **Missing logging** on allow rules.
5. **Broad services** (e.g. all TCP) where an application/port would do.

Export the rulebase and script these checks so the review is consistent each quarter.`,
  },
];

const fallback = `Good question. In this demo the mentor only has curated answers for a few topics: OSPF troubleshooting, learning plans, Python/Netmiko automation, cloud networking and firewall reviews.

Try one of the suggested prompts — or rephrase using one of those topics. Live, open-ended answers need an AI provider connection, which isn't enabled yet.`;

export function getMentorReply(input: string): { reply: string; topicId: string | null } {
  const q = input.toLowerCase();
  let best: MentorTopic | null = null;
  let bestScore = 0;
  for (const t of mentorTopics) {
    const score = t.keywords.reduce((s, k) => (q.includes(k) ? s + 1 : s), 0);
    if (score > bestScore) {
      best = t;
      bestScore = score;
    }
  }
  return best ? { reply: best.reply, topicId: best.id } : { reply: fallback, topicId: null };
}
