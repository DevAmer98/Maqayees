import { NextResponse } from "next/server";
import path from "path";
import { Client } from "basic-ftp";
import { Writable } from "stream";

export const runtime = "nodejs";

const requiredEnvKeys = ["SYNOLOGY_HOST", "SYNOLOGY_PORT", "SYNOLOGY_USER", "SYNOLOGY_PASSWORD"];

const normalizePrefix = (prefix) => {
  if (!prefix) return null;
  const trimmed = prefix.trim();
  if (!trimmed) return null;
  const withLeadingSlash = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return withLeadingSlash.replace(/\/$/, "");
};

const allowedPrefixes = [process.env.SYNOLOGY_TRUCK_PATH, process.env.SYNOLOGY_SHIFT_PATH]
  .map(normalizePrefix)
  .filter(Boolean);

const mimeTypes = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".bmp": "image/bmp",
};

class BufferWriter extends Writable {
  constructor() {
    super();
    this.chunks = [];
  }
  _write(chunk, encoding, callback) {
    this.chunks.push(chunk);
    callback();
  }
  getBuffer() {
    return Buffer.concat(this.chunks);
  }
}

function hasSynologyConfig() {
  return requiredEnvKeys.every((key) => !!process.env[key]);
}

function normalizeRemotePath(inputPath) {
  if (!inputPath) return null;
  const trimmed = inputPath.trim();
  if (!trimmed) return null;
  const normalized = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  if (!allowedPrefixes.length) return normalized;
  const isAllowed = allowedPrefixes.some((prefix) => normalized.startsWith(prefix));
  return isAllowed ? normalized : null;
}

function detectMimeType(remotePath) {
  const ext = path.extname(remotePath || "").toLowerCase();
  return mimeTypes[ext] || "application/octet-stream";
}

async function fetchFileFromSynology(remotePath) {
  const client = new Client();
  client.ftp.verbose = false;

  await client.access({
    host: process.env.SYNOLOGY_HOST,
    port: Number(process.env.SYNOLOGY_PORT),
    user: process.env.SYNOLOGY_USER,
    password: process.env.SYNOLOGY_PASSWORD,
    secure: false,
  });

  const writer = new BufferWriter();
  await client.downloadTo(writer, remotePath);
  await client.close();
  return writer.getBuffer();
}

export async function GET(req) {
  if (!hasSynologyConfig()) {
    return NextResponse.json({ success: false, error: "Synology connection is not configured." }, { status: 500 });
  }

  const { searchParams } = new URL(req.url);
  const remotePath = normalizeRemotePath(searchParams.get("path"));

  if (!remotePath) {
    return NextResponse.json({ success: false, error: "Invalid or disallowed path parameter." }, { status: 400 });
  }

  try {
    const buffer = await fetchFileFromSynology(remotePath);
    const mimeType = detectMimeType(remotePath);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": mimeType,
        "Cache-Control": "public, max-age=3600",
        "Content-Length": buffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Failed to proxy Synology file:", error);
    const status = error.code === 550 ? 404 : 500;
    return NextResponse.json(
      { success: false, error: status === 404 ? "File not found." : "Unable to fetch file." },
      { status }
    );
  }
}
