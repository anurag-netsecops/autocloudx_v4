import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";
import { labSchema, type EditableLab, type PublicLab } from "./labs-schema";

type LabRow = Database["public"]["Tables"]["labs"]["Row"];

function rowToLab(row: LabRow): EditableLab {
  return labSchema.parse({
    id: row.id,
    title: row.title,
    category: row.category,
    level: row.level,
    objective: row.objective,
    skills: row.skills,
    scenario: row.scenario,
    steps: row.steps,
    outcomes: row.outcomes,
    snippet: row.snippet,
    note: row.note ?? "",
    topologyPath: row.topology_path,
    published: row.published,
  });
}

async function withTopologyUrls(labs: EditableLab[]): Promise<PublicLab[]> {
  const paths = labs.map((l) => l.topologyPath).filter((p): p is string => !!p);
  const urls = new Map<string, string>();
  if (paths.length > 0) {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin.storage.from("lab-images").createSignedUrls(paths, 3600);
    for (const item of data ?? []) {
      if (item.path && item.signedUrl) urls.set(item.path, item.signedUrl);
    }
  }
  return labs.map((lab) => ({ ...lab, topologyUrl: lab.topologyPath ? (urls.get(lab.topologyPath) ?? null) : null }));
}

type RoleClient = { rpc: (fn: "has_role", args: { _user_id: string; _role: "admin" }) => PromiseLike<{ data: boolean | null; error: unknown }> };

async function requireAdmin(supabase: RoleClient, userId: string) {
  const { data: allowed, error } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
  if (error || !allowed) throw new Error("Admin access required");
}

export const listPublicLabs = createServerFn({ method: "GET" }).handler(async () => {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  const supabasePublic = createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { persistSession: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
  const { data, error } = await supabasePublic.from("labs").select("*").eq("published", true).order("updated_at", { ascending: false });
  if (error) throw new Error("Could not load labs");
  return { labs: await withTopologyUrls((data ?? []).map(rowToLab)) };
});

export const getAdminLabs = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  await requireAdmin(context.supabase, context.userId);
  const { data, error } = await context.supabase.from("labs").select("*").order("updated_at", { ascending: false });
  if (error) throw new Error("Could not load labs");
  return { labs: await withTopologyUrls((data ?? []).map(rowToLab)) };
});

export const saveAdminLab = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => labSchema.parse(input))
  .handler(async ({ context, data }) => {
    await requireAdmin(context.supabase, context.userId);
    const { error } = await context.supabase.from("labs").upsert({
      id: data.id,
      title: data.title,
      category: data.category,
      level: data.level,
      objective: data.objective,
      skills: data.skills,
      scenario: data.scenario,
      steps: data.steps,
      outcomes: data.outcomes,
      snippet: data.snippet,
      note: data.note || null,
      topology_path: data.topologyPath,
      published: data.published,
      updated_at: new Date().toISOString(),
    });
    if (error) { console.error(error); throw new Error("Could not save lab"); }
    return { saved: true, message: data.published ? "Lab published" : "Draft saved" };
  });

export const deleteAdminLab = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().min(1).max(100) }).parse(input))
  .handler(async ({ context, data }) => {
    await requireAdmin(context.supabase, context.userId);
    const { error } = await context.supabase.from("labs").delete().eq("id", data.id);
    if (error) { console.error(error); throw new Error("Could not delete lab"); }
    return { deleted: true };
  });
