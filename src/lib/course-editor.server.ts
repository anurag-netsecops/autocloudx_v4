import { assessDriveFile, strictDriveId, type DriveCheck } from "./course-editor-schema";

export async function checkDriveVideo(link: string): Promise<DriveCheck> {
  const fileId = strictDriveId(link);
  if (!fileId) return { valid: false, message: "Enter a full Google Drive file sharing link." };
  const key = process.env["GOOGLE_DRIVE_API_KEY"];
  const gatewayKey = process.env["LOVABLE_API_KEY"];
  if (!key || !gatewayKey) return { valid: false, message: "Google Drive is not connected." };
  const url = new URL(`https://connector-gateway.lovable.dev/google_drive/drive/v3/files/${fileId}`);
  url.searchParams.set("fields", "id,name,mimeType,trashed,permissions(type,role)");
  try {
    const response = await fetch(url, { headers: { Authorization: `Bearer ${gatewayKey}`, "X-Connection-Api-Key": key }, signal: AbortSignal.timeout(15000) });
    if (!response.ok) {
      const body = await response.text();
      console.error(`Drive validation failed [${response.status}]: ${body}`);
      return { valid: false, message: `Google Drive check failed (${response.status}). Confirm the connected account can access this file.` };
    }
    const file = await response.json() as { name?: string; mimeType?: string; trashed?: boolean; permissions?: { type?: string; role?: string }[] };
    if (file.trashed) return { valid: false, message: "This file is in the trash." };
    if (!file.mimeType?.startsWith("video/")) return { valid: false, message: "This file is not a video." };
    if (!assessDriveFile(file)) return { valid: false, message: "Private video: set General access to Anyone with the link (Viewer)." };
    return { valid: true, message: "Video verified · Anyone with the link", fileId, name: file.name ?? "Video" };
  } catch (error) {
    console.error("Drive validation unavailable", error);
    return { valid: false, message: "Google Drive could not be reached. Try again." };
  }
}