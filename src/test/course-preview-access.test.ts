import { describe, expect, it, vi } from "vitest";

vi.mock("@tanstack/react-start", () => ({
  createServerFn: () => {
    const builder = {
      middleware: () => builder,
      inputValidator: () => builder,
      handler: (handler: unknown) => handler,
    };
    return builder;
  },
}));
vi.mock("@/integrations/supabase/auth-middleware", () => ({ requireSupabaseAuth: {} }));
vi.mock("@/lib/course-editor.server", () => ({ checkDriveVideo: vi.fn(async () => ({ valid: false, message: "Private" })) }));

import { previewAdminCourse } from "@/lib/course-editor.functions";

const draft = { id: "draft", title: "Unsaved draft", summary: "Preview", category: "Automation", level: "Beginner", lessons: [{ id: "second", title: "Second", driveLink: "" }, { id: "first", title: "First", driveLink: "" }] };
const invoke = previewAdminCourse as unknown as (input: { data: typeof draft; context: { userId: string; supabase: { rpc: ReturnType<typeof vi.fn> } } }) => Promise<{ checks: Record<string, unknown> }>;

describe("admin-only draft preview", () => {
  it("denies authenticated non-admins", async () => {
    const rpc = vi.fn().mockResolvedValue({ data: false, error: null });
    await expect(invoke({ data: draft, context: { userId: "student", supabase: { rpc } } })).rejects.toThrow("Admin access required");
  });
  it("denies access when the role check fails", async () => {
    const rpc = vi.fn().mockResolvedValue({ data: true, error: { message: "Unavailable" } });
    await expect(invoke({ data: draft, context: { userId: "admin", supabase: { rpc } } })).rejects.toThrow("Admin access required");
  });
  it("previews the submitted lesson order without saving or publishing", async () => {
    const rpc = vi.fn().mockResolvedValue({ data: true, error: null });
    const result = await invoke({ data: draft, context: { userId: "admin", supabase: { rpc } } });
    expect(Object.keys(result.checks)).toEqual(["second", "first"]);
    expect(rpc).toHaveBeenCalledExactlyOnceWith("has_role", { _user_id: "admin", _role: "admin" });
  });
});