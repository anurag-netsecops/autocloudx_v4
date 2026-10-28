import { describe, expect, it } from "vitest";
import { driveFileId } from "@/lib/courses";
import { strictDriveId, assessDriveFile, publicationReady, courseEditorSchema, previewVideoId } from "@/lib/course-editor-schema";

describe("Google Drive links", () => {
  it("reads the file id from a share link", () => {
    expect(driveFileId("https://drive.google.com/file/d/1AbCdEfGhIjKlMnOp/view?usp=sharing")).toBe("1AbCdEfGhIjKlMnOp");
  });
  it("reads the file id from an open?id= link", () => {
    expect(driveFileId("https://drive.google.com/open?id=1AbCdEfGhIjKlMnOp")).toBe("1AbCdEfGhIjKlMnOp");
  });
  it("rejects non-Drive text", () => {
    expect(driveFileId("not a link")).toBeNull();
  });
});

describe("admin publishing rules", () => {
  it("accepts the supplied Google Drive sharing link", () => {
    expect(strictDriveId("https://drive.google.com/file/d/1OMxa0AOf5vhQv-NorXled4mqSkl2q_7k/view?usp=drive_link")).toBe("1OMxa0AOf5vhQv-NorXled4mqSkl2q_7k");
  });
  it("rejects links on other hosts even if they look like Drive", () => {
    expect(strictDriveId("https://evil.example/file/d/1OMxa0AOf5vhQv-NorXled4mqSkl2q_7k/view")).toBeNull();
  });
  it("blocks private videos before publishing", () => {
    expect(assessDriveFile({ mimeType: "video/mp4", permissions: [{ type: "user", role: "owner" }] })).toBe(false);
  });
  it("accepts publicly shared videos", () => {
    expect(assessDriveFile({ mimeType: "video/mp4", permissions: [{ type: "anyone", role: "reader" }] })).toBe(true);
  });
  it("rejects publicly shared non-video files", () => {
    expect(assessDriveFile({ mimeType: "application/pdf", permissions: [{ type: "anyone", role: "reader" }] })).toBe(false);
  });
  it("requires every lesson to pass validation", () => {
    const course = courseEditorSchema.parse({ id: "test", title: "Test", summary: "Test", category: "Automation", level: "Beginner", lessons: [{ id: "one", title: "One" }, { id: "two", title: "Two" }] });
    expect(publicationReady(course, [{ valid: true, message: "OK" }, { valid: false, message: "Private" }])).toBe(false);
    expect(publicationReady(course, [{ valid: true, message: "OK" }, { valid: true, message: "OK" }])).toBe(true);
  });
  it("rejects courses without lessons", () => {
    const course = courseEditorSchema.parse({ id: "test", title: "Test", summary: "Test", category: "Automation", level: "Beginner", lessons: [] });
    expect(publicationReady(course, [])).toBe(false);
  });
});

describe("student draft preview", () => {
  const link = "https://drive.google.com/file/d/1OMxa0AOf5vhQv-NorXled4mqSkl2q_7k/view?usp=drive_link";
  it("blocks private or unchecked video playback", () => {
    expect(previewVideoId(link, { valid: false, message: "Private", fileId: "1OMxa0AOf5vhQv-NorXled4mqSkl2q_7k" })).toBeNull();
    expect(previewVideoId(link, undefined)).toBeNull();
  });
  it("plays only the exact validated Drive video", () => {
    expect(previewVideoId(link, { valid: true, message: "OK", fileId: "1OMxa0AOf5vhQv-NorXled4mqSkl2q_7k" })).toBe("1OMxa0AOf5vhQv-NorXled4mqSkl2q_7k");
    expect(previewVideoId(link, { valid: true, message: "OK", fileId: "different-file-id" })).toBeNull();
  });
  it("retains draft lesson order including unsaved reordering", () => {
    const course = courseEditorSchema.parse({ id: "preview", title: "Preview", summary: "Preview", category: "Automation", level: "Beginner", lessons: [{ id: "second", title: "Second" }, { id: "first", title: "First" }] });
    expect(course.lessons.map((lesson) => lesson.id)).toEqual(["second", "first"]);
  });
});
