import { describe, expect, it } from "vitest";
import { labSchema } from "@/lib/labs-schema";

const base = {
  id: "ospf-lab",
  title: "OSPF automation",
  category: "Automation",
  level: "Intermediate",
  objective: "Automate OSPF",
  skills: ["Python"],
  scenario: "Four routers",
  steps: ["Model devices", "Push config"],
  outcomes: ["Verify adjacencies"],
  snippet: "",
  note: "",
  topologyPath: null,
  published: false,
};

describe("labSchema", () => {
  it("accepts a valid lab", () => {
    expect(labSchema.parse(base).title).toBe("OSPF automation");
  });
  it("requires at least one step", () => {
    expect(labSchema.safeParse({ ...base, steps: [] }).success).toBe(false);
  });
  it("requires an objective", () => {
    expect(labSchema.safeParse({ ...base, objective: "" }).success).toBe(false);
  });
  it("rejects invalid id characters", () => {
    expect(labSchema.safeParse({ ...base, id: "OSPF Lab!" }).success).toBe(false);
  });
  it("allows a null topology image", () => {
    expect(labSchema.parse(base).topologyPath).toBeNull();
  });
});
