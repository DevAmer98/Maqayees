import { NextResponse } from "next/server";
import path from "path";
import os from "os";
import { promises as fs } from "fs";
import { uploadToSynology, hasSynologyConfig as hasSynologyBase } from "@/lib/synology";

export const runtime = "nodejs";

const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024;
const ALLOWED_MIME_PREFIXES = ["image/"];

const hasSynologyConfig = () => hasSynologyBase(["SYNOLOGY_SHIFT_PATH"]);

function sanitizeIdentifier(value, fallback = "unknown") {
  const sanitized = (value || "").trim().replace(/[^a-zA-Z0-9_-]/g, "_");
  return sanitized || fallback;
}

export async function POST(request) {
  let tempDir;

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const shiftId = sanitizeIdentifier(formData.get("shiftId"), `shift-${Date.now()}`);
    const eventType = (formData.get("eventType") || "").toLowerCase();
    const label = sanitizeIdentifier(formData.get("label"), "file");
    const driverName = sanitizeIdentifier(formData.get("driverName"), "unknown-driver");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "A valid file is required." }, { status: 400 });
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json({ error: "File exceeds 50 MB limit." }, { status: 400 });
    }
    if (!ALLOWED_MIME_PREFIXES.some((prefix) => file.type.startsWith(prefix))) {
      return NextResponse.json({ error: "Only image files are allowed." }, { status: 400 });
    }

    const ext = path.extname(file.name) || ".jpg";
    const fileName = `${label}-${Date.now()}${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "maq-shift-"));
    const tempPath = path.join(tempDir, fileName);
    await fs.writeFile(tempPath, buffer);

    let remotePath = null;
    let location = "local";

    if (hasSynologyConfig()) {
      const synologyBase = `${process.env.SYNOLOGY_SHIFT_PATH.replace(/\/$/, "")}/${driverName}/shifts/${shiftId}/${eventType}`;
      try {
        remotePath = await uploadToSynology(tempPath, `${synologyBase}/${fileName}`);
        location = "synology";
      } catch (err) {
        console.error("Synology upload failed, falling back to local storage:", err);
      }
    }

    if (!remotePath) {
      const relativePath = `shifts/${driverName}/${shiftId}/${eventType}/${fileName}`;
      const publicDest = path.join(process.cwd(), "public", "uploads", relativePath);
      await fs.mkdir(path.dirname(publicDest), { recursive: true });
      await fs.copyFile(tempPath, publicDest);
      remotePath = `/uploads/${relativePath}`;
    }

    return NextResponse.json({
      originalName: file.name,
      url: remotePath,
      pathname: remotePath,
      contentType: file.type,
      location,
    });
  } catch (error) {
    console.error("Shift asset upload failed:", error);
    return NextResponse.json({ error: "Upload failed." }, { status: 500 });
  } finally {
    if (tempDir) {
      await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
    }
  }
}
