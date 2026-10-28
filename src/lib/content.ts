export type Level = "Beginner" | "Intermediate" | "Advanced";
export type Category = "Networking" | "Automation" | "Security" | "Cloud" | "AI";

export interface LearningPath {
  id: string;
  title: string;
  category: Category;
  level: Level;
  summary: string;
  modules: string[];
  tools: string[];
  outcome: string;
}

export const learningPaths: LearningPath[] = [
  {
    id: "ccna",
    title: "Network Fundamentals & CCNA",
    category: "Networking",
    level: "Beginner",
    summary: "Build a solid mental model of how packets move — from the OSI model to switching, routing and IP services.",
    modules: ["OSI & TCP/IP models", "IPv4/IPv6 subnetting", "VLANs, trunking & STP", "Static routing & OSPF basics", "ACLs, NAT, DHCP, DNS"],
    tools: ["Cisco IOS", "Packet Tracer", "GNS3 / CML", "Wireshark"],
    outcome: "Configure and troubleshoot a small multi-VLAN, routed campus network with confidence.",
  },
  {
    id: "ccnp",
    title: "CCNP Enterprise & Routing",
    category: "Networking",
    level: "Intermediate",
    summary: "Go deeper on enterprise design: advanced OSPF, BGP, route redistribution, policy and resilient campus/WAN.",
    modules: ["Multi-area OSPF & tuning", "eBGP/iBGP, attributes & policy", "Redistribution & filtering", "First-hop redundancy", "SD-WAN concepts"],
    tools: ["Cisco IOS-XE", "CML / EVE-NG", "BGP looking glasses"],
    outcome: "Design and validate routing policy for a dual-homed enterprise edge.",
  },
  {
    id: "python",
    title: "Python for Network Engineers",
    category: "Automation",
    level: "Beginner",
    summary: "Practical Python aimed at network tasks: parsing output, working with files, templates and structured data.",
    modules: ["Python syntax for engineers", "Files, CSV, JSON & YAML", "Regex & TextFSM parsing", "Jinja2 config templates", "Virtual envs & packaging"],
    tools: ["Python 3", "VS Code", "TextFSM", "Jinja2"],
    outcome: "Turn repetitive CLI work into small, reliable scripts you can share with your team.",
  },
  {
    id: "automation",
    title: "Network Automation (Netmiko, APIs, Git)",
    category: "Automation",
    level: "Intermediate",
    summary: "Connect to real devices programmatically, use REST APIs and manage changes with version control.",
    modules: ["SSH automation with Netmiko", "REST, JSON & API auth", "NETCONF/RESTCONF intro", "Git workflows for configs", "Testing & dry-runs"],
    tools: ["Netmiko", "Requests", "Nornir", "Git"],
    outcome: "Run safe, reviewable, multi-device changes with pre- and post-checks.",
  },
  {
    id: "security",
    title: "Network Security (Palo Alto / FortiGate fundamentals)",
    category: "Security",
    level: "Intermediate",
    summary: "Next-generation firewall concepts: zones, policies, NAT, objects, VPNs and logging — vendor-neutral principles with platform examples.",
    modules: ["Zones & security policy", "Address/service objects", "NAT on NGFWs", "Site-to-site & remote VPN", "Logging & threat basics"],
    tools: ["PAN-OS concepts", "FortiOS concepts", "Syslog"],
    outcome: "Read, design and audit a firewall rulebase with least-privilege intent.",
  },
  {
    id: "cloud",
    title: "Cloud Networking (AWS / Azure / GCP concepts)",
    category: "Cloud",
    level: "Intermediate",
    summary: "Map what you know about networks onto cloud: VPCs/VNets, routing, security groups, hybrid connectivity.",
    modules: ["VPC/VNet design & CIDR planning", "Route tables & gateways", "Security groups vs NACLs", "VPN & dedicated interconnect", "Hub-and-spoke / transit"],
    tools: ["AWS VPC", "Azure VNet", "GCP VPC"],
    outcome: "Design a segmented multi-tier cloud network with hybrid connectivity.",
  },
  {
    id: "iac",
    title: "Infrastructure as Code (Ansible / Terraform)",
    category: "Automation",
    level: "Advanced",
    summary: "Declarative, repeatable infrastructure: playbooks for network devices and Terraform for cloud networking.",
    modules: ["Ansible inventories & playbooks", "Network modules & idempotency", "Terraform providers & state", "Modules & environments", "CI pipelines for infra"],
    tools: ["Ansible", "Terraform", "GitHub Actions"],
    outcome: "Provision and update network + cloud resources from a reviewed Git repo.",
  },
  {
    id: "ai-ops",
    title: "AI for Network Operations",
    category: "AI",
    level: "Advanced",
    summary: "Use AI responsibly in operations: log summarisation, assisted troubleshooting and guarded automation workflows.",
    modules: ["Where AI helps (and where it doesn't)", "Prompting for ops tasks", "Log & config summarisation", "Human-in-the-loop automation", "Guardrails & data privacy"],
    tools: ["Python", "LLM APIs", "Event pipelines"],
    outcome: "Prototype an AI-assisted triage flow with clear review steps before any change.",
  },
];

export interface Lab {
  id: string;
  title: string;
  level: Level;
  category: Category;
  objective: string;
  skills: string[];
  scenario: string;
  steps: string[];
  outcomes: string[];
  snippet: string;
  note?: string;
}

export const labs: Lab[] = [
  {
    id: "ospf-netmiko",
    title: "OSPF configuration automation with Python & Netmiko",
    level: "Intermediate",
    category: "Automation",
    objective: "Push a consistent OSPF configuration to multiple routers from a YAML inventory and verify adjacencies.",
    skills: ["Python", "Netmiko", "Jinja2", "OSPF"],
    scenario: "A lab of four IOS routers needs OSPF area 0 enabled with consistent router IDs and passive interfaces.",
    steps: ["Model devices and interfaces in YAML", "Render per-device config with Jinja2", "Push via Netmiko with send_config_set", "Verify with 'show ip ospf neighbor' and parse output"],
    outcomes: ["Separate data from config templates", "Handle SSH sessions and errors safely", "Automate post-change verification"],
    snippet: `from netmiko import ConnectHandler

for dev in inventory["routers"]:
    cfg = template.render(**dev).splitlines()
    with ConnectHandler(**dev["conn"]) as conn:
        conn.send_config_set(cfg)
        print(conn.send_command("show ip ospf neighbor"))`,
  },
  {
    id: "paloalto-api",
    title: "Palo Alto address-object automation via API",
    level: "Intermediate",
    category: "Security",
    objective: "Create and tag address objects from a CSV using the PAN-OS REST API pattern, with a dry-run mode.",
    skills: ["REST APIs", "Python Requests", "NGFW objects"],
    scenario: "A security team receives a weekly list of new server IPs that must exist as tagged address objects.",
    steps: ["Read and validate the CSV", "Authenticate and build the API request", "Check if objects exist before creating", "Report created / skipped / failed"],
    outcomes: ["Understand API auth and object models", "Write idempotent change scripts", "Produce change reports for review"],
    snippet: `payload = {"entry": {"@name": name, "ip-netmask": ip, "tag": {"member": ["acx-auto"]}}}
r = session.post(f"{base}/Objects/Addresses", params={"name": name, "location": "vsys", "vsys": "vsys1"}, json=payload)
r.raise_for_status()`,
    note: "Guided example for a lab firewall. Not a live integration — adapt to your own environment and API version.",
  },
  {
    id: "vpc-security",
    title: "Cloud VPC security design",
    level: "Intermediate",
    category: "Cloud",
    objective: "Design a three-tier VPC with public, app and data subnets, least-privilege security groups and controlled egress.",
    skills: ["CIDR planning", "Security groups", "NAT gateways", "Route tables"],
    scenario: "A web application needs to move to the cloud with strict separation between internet-facing and data tiers.",
    steps: ["Plan non-overlapping CIDRs for hybrid use", "Lay out subnets across two zones", "Define SG rules by tier reference", "Document flows and review egress"],
    outcomes: ["Translate on-prem segmentation into cloud constructs", "Explain SG vs NACL trade-offs", "Produce a reviewable design document"],
    snippet: `web-sg : 443 from 0.0.0.0/0
app-sg : 8080 from web-sg
db-sg  : 5432 from app-sg
egress : app -> NAT GW -> internet (patching only)`,
  },
  {
    id: "backup-compliance",
    title: "Configuration backup & compliance checks",
    level: "Beginner",
    category: "Automation",
    objective: "Back up running configs to Git daily and flag devices missing required baseline settings.",
    skills: ["Python", "Git", "Regex", "Scheduling"],
    scenario: "An operations team wants change history and a simple report of devices drifting from the baseline.",
    steps: ["Collect running configs over SSH", "Commit to a Git repo with timestamps", "Check for required lines (NTP, logging, AAA)", "Output a compliance summary"],
    outcomes: ["Use Git as a config history", "Write simple, explainable compliance rules", "Schedule and log automation jobs"],
    snippet: `REQUIRED = [r"^ntp server ", r"^logging host ", r"^aaa new-model"]
missing = [p for p in REQUIRED if not re.search(p, config, re.M)]
report[host] = "PASS" if not missing else f"FAIL: {missing}"`,
  },
  {
    id: "event-ticket",
    title: "Event-to-ticket & self-healing workflow",
    level: "Advanced",
    category: "AI",
    objective: "Turn an interface-down event into an enriched ticket, and optionally run a guarded remediation with approval.",
    skills: ["Webhooks", "Python", "ITSM APIs", "Human-in-the-loop"],
    scenario: "Monitoring raises a link-down alert. The goal is a ticket with context, not a mystery alarm at 3 a.m.",
    steps: ["Receive the event via webhook", "Enrich with device facts and recent changes", "Create a ticket with a summary", "Offer a pre-approved remediation (e.g. bounce port) behind an approval step"],
    outcomes: ["Design event-driven automation", "Add guardrails before automated changes", "Use AI summaries as assistance, not authority"],
    snippet: `event = parse_alert(request.json)
facts = get_device_facts(event.host, event.interface)
ticket = itsm.create(summary=summarise(event, facts), severity=event.severity)
if policy.allows("bounce_port", event) and approved(ticket):
    remediate(event)`,
  },
  {
    id: "bgp-edge",
    title: "Dual-homed BGP edge with policy validation",
    level: "Advanced",
    category: "Networking",
    objective: "Build a dual-ISP edge with preferred/backup paths and verify routing policy with automated checks.",
    skills: ["BGP", "Route-maps", "Prefix-lists", "Python parsing"],
    scenario: "An enterprise wants ISP-A preferred for outbound traffic and ISP-B as backup with clean failover.",
    steps: ["Configure eBGP to two upstreams", "Apply local-pref and AS-path prepending", "Filter announced prefixes", "Script a failover verification"],
    outcomes: ["Reason about BGP path selection", "Apply safe inbound/outbound policy", "Validate behaviour, not just config"],
    snippet: `route-map ISP-A-IN permit 10
 set local-preference 200
route-map ISP-B-OUT permit 10
 set as-path prepend 65010 65010`,
  },
];

export const topics = ["Network Automation", "Network Security", "Cloud Networking", "Python", "DevOps", "AI for NetOps"];
