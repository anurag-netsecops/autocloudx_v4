/**
 * Google Drive video links per lesson — server-only, sent to signed-in students.
 * Paste the Drive "Share" link for each video (set sharing to "Anyone with the link").
 * Keys: courseId -> lessonId -> Drive link.
 */
export const courseVideoLinks: Record<string, Record<string, string>> = {
  "python-netops-intro": {
    setup: "",
    "first-script": "",
  },
};
