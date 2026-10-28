import { describe, expect, it } from "vitest";
import { contactSchema } from "@/lib/contact-schema";
import { getMentorReply } from "@/lib/mentor";
import { learningPaths } from "@/lib/content";

describe("contact form", () => {
  it("rejects an invalid email", () => {
    expect(contactSchema.safeParse({ name: "Ana", email: "nope", interest: "labs", message: "Hello there team" }).success).toBe(false);
  });
  it("accepts a valid message", () => {
    expect(contactSchema.safeParse({ name: "Ana", email: "a@b.co", interest: "labs", message: "Hello there team" }).success).toBe(true);
  });
});

describe("mentor demo", () => {
  it("routes OSPF questions to the OSPF answer", () => {
    expect(getMentorReply("my ospf neighbor is stuck").topicId).toBe("ospf");
  });
  it("falls back for unknown topics", () => {
    expect(getMentorReply("best pizza in town").topicId).toBeNull();
  });
});

it("offers eight learning paths", () => {
  expect(learningPaths).toHaveLength(8);
});
