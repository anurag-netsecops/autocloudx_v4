CREATE TABLE public.labs (
  id text PRIMARY KEY,
  title text NOT NULL,
  category text NOT NULL,
  level text NOT NULL,
  objective text NOT NULL,
  skills jsonb NOT NULL DEFAULT '[]'::jsonb,
  scenario text NOT NULL DEFAULT '',
  steps jsonb NOT NULL DEFAULT '[]'::jsonb,
  outcomes jsonb NOT NULL DEFAULT '[]'::jsonb,
  snippet text NOT NULL DEFAULT '',
  note text,
  topology_path text,
  published boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.labs TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.labs TO authenticated;
GRANT ALL ON public.labs TO service_role;
ALTER TABLE public.labs ENABLE ROW LEVEL SECURITY;
CREATE POLICY public_read_published_labs ON public.labs FOR SELECT TO anon, authenticated USING (published OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY admins_write_labs ON public.labs FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY public_read_lab_images ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'lab-images');
CREATE POLICY admins_write_lab_images ON storage.objects FOR ALL TO authenticated USING (bucket_id = 'lab-images' AND public.has_role(auth.uid(), 'admin')) WITH CHECK (bucket_id = 'lab-images' AND public.has_role(auth.uid(), 'admin'));

INSERT INTO public.labs (id, title, category, level, objective, skills, scenario, steps, outcomes, snippet, note, published) VALUES
('ospf-netmiko', 'OSPF configuration automation with Python & Netmiko', 'Automation', 'Intermediate', 'Push a consistent OSPF configuration to multiple routers from a YAML inventory and verify adjacencies.', '["Python","Netmiko","Jinja2","OSPF"]', 'A lab of four IOS routers needs OSPF area 0 enabled with consistent router IDs and passive interfaces.', '["Model devices and interfaces in YAML","Render per-device config with Jinja2","Push via Netmiko with send_config_set","Verify with ''show ip ospf neighbor'' and parse output"]', '["Separate data from config templates","Handle SSH sessions and errors safely","Automate post-change verification"]', $$from netmiko import ConnectHandler

for dev in inventory["routers"]:
    cfg = template.render(**dev).splitlines()
    with ConnectHandler(**dev["conn"]) as conn:
        conn.send_config_set(cfg)
        print(conn.send_command("show ip ospf neighbor"))$$, NULL, true),
('paloalto-api', 'Palo Alto address-object automation via API', 'Security', 'Intermediate', 'Create and tag address objects from a CSV using the PAN-OS REST API pattern, with a dry-run mode.', '["REST APIs","Python Requests","NGFW objects"]', 'A security team receives a weekly list of new server IPs that must exist as tagged address objects.', '["Read and validate the CSV","Authenticate and build the API request","Check if objects exist before creating","Report created / skipped / failed"]', '["Understand API auth and object models","Write idempotent change scripts","Produce change reports for review"]', $$payload = {"entry": {"@name": name, "ip-netmask": ip, "tag": {"member": ["acx-auto"]}}}
r = session.post(f"{base}/Objects/Addresses", params={"name": name, "location": "vsys", "vsys": "vsys1"}, json=payload)
r.raise_for_status()$$, 'Guided example for a lab firewall. Not a live integration — adapt to your own environment and API version.', true),
('vpc-security', 'Cloud VPC security design', 'Cloud', 'Intermediate', 'Design a three-tier VPC with public, app and data subnets, least-privilege security groups and controlled egress.', '["CIDR planning","Security groups","NAT gateways","Route tables"]', 'A web application needs to move to the cloud with strict separation between internet-facing and data tiers.', '["Plan non-overlapping CIDRs for hybrid use","Lay out subnets across two zones","Define SG rules by tier reference","Document flows and review egress"]', '["Translate on-prem segmentation into cloud constructs","Explain SG vs NACL trade-offs","Produce a reviewable design document"]', $$web-sg : 443 from 0.0.0.0/0
app-sg : 8080 from web-sg
db-sg  : 5432 from app-sg
egress : app -> NAT GW -> internet (patching only)$$, NULL, true),
('backup-compliance', 'Configuration backup & compliance checks', 'Automation', 'Beginner', 'Back up running configs to Git daily and flag devices missing required baseline settings.', '["Python","Git","Regex","Scheduling"]', 'An operations team wants change history and a simple report of devices drifting from the baseline.', '["Collect running configs over SSH","Commit to a Git repo with timestamps","Check for required lines (NTP, logging, AAA)","Output a compliance summary"]', '["Use Git as a config history","Write simple, explainable compliance rules","Schedule and log automation jobs"]', $$REQUIRED = [r"^ntp server ", r"^logging host ", r"^aaa new-model"]
missing = [p for p in REQUIRED if not re.search(p, config, re.M)]
report[host] = "PASS" if not missing else f"FAIL: {missing}"$$, NULL, true),
('event-ticket', 'Event-to-ticket & self-healing workflow', 'AI', 'Advanced', 'Turn an interface-down event into an enriched ticket, and optionally run a guarded remediation with approval.', '["Webhooks","Python","ITSM APIs","Human-in-the-loop"]', 'Monitoring raises a link-down alert. The goal is a ticket with context, not a mystery alarm at 3 a.m.', '["Receive the event via webhook","Enrich with device facts and recent changes","Create a ticket with a summary","Offer a pre-approved remediation (e.g. bounce port) behind an approval step"]', '["Design event-driven automation","Add guardrails before automated changes","Use AI summaries as assistance, not authority"]', $$event = parse_alert(request.json)
facts = get_device_facts(event.host, event.interface)
ticket = itsm.create(summary=summarise(event, facts), severity=event.severity)
if policy.allows("bounce_port", event) and approved(ticket):
    remediate(event)$$, NULL, true),
('bgp-edge', 'Dual-homed BGP edge with policy validation', 'Networking', 'Advanced', 'Build a dual-ISP edge with preferred/backup paths and verify routing policy with automated checks.', '["BGP","Route-maps","Prefix-lists","Python parsing"]', 'An enterprise wants ISP-A preferred for outbound traffic and ISP-B as backup with clean failover.', '["Configure eBGP to two upstreams","Apply local-pref and AS-path prepending","Filter announced prefixes","Script a failover verification"]', '["Reason about BGP path selection","Apply safe inbound/outbound policy","Validate behaviour, not just config"]', $$route-map ISP-A-IN permit 10
 set local-preference 200
route-map ISP-B-OUT permit 10
 set as-path prepend 65010 65010$$, NULL, true);