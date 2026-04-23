import { NextResponse } from "next/server";
import path from "path";
import os from "os";
import { promises as fs } from "fs";
import prisma from "@/lib/prisma";
import { uploadToSynology, hasSynologyConfig } from "@/lib/synology";

export const runtime = "nodejs";

function sanitize(value, fallback = "unknown") {
  const s = (value || "").trim().replace(/[^a-zA-Z0-9_-]/g, "_");
  return s || fallback;
}

export async function POST(req) {
  const cleanupPaths = [];
  let tempDir;

  try {
    const formData = await req.formData();

    const driverId = formData.get("driverId");
    const vehicleId = formData.get("vehicleId") || null;
    const driverName = formData.get("driverName") || "unknown";
    const reading = parseFloat(formData.get("reading"));
    const notes = formData.get("notes") || null;
    const photo = formData.get("photo");

    if (!driverId) {
      return NextResponse.json({ success: false, error: "driverId is required." }, { status: 400 });
    }
    if (!Number.isFinite(reading) || reading < 0) {
      return NextResponse.json({ success: false, error: "Valid odometer reading is required." }, { status: 400 });
    }

    let photoUrl = null;

    if (photo instanceof File) {
      tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "maq-odo-"));
      const buffer = Buffer.from(await photo.arrayBuffer());
      const ext = path.extname(photo.name) || ".jpg";
      const tempPath = path.join(tempDir, `odometer${ext}`);
      await fs.writeFile(tempPath, buffer);
      cleanupPaths.push(tempPath);

      if (hasSynologyConfig()) {
        const dateStr = new Date().toISOString().slice(0, 10);
        const driverFolder = sanitize(driverName);
        const remotePath = `maqayees/${driverFolder}/odometer/${dateStr}/odometer${ext}`;
        try {
          photoUrl = await uploadToSynology(tempPath, remotePath);
        } catch {
          // continue without photo url
        }
      }
    }

    const log = await prisma.odometerLog.create({
      data: {
        driverId,
        vehicleId,
        reading,
        photoUrl,
        notes,
      },
    });

    return NextResponse.json({ success: true, log }, { status: 200 });
  } catch (error) {
    console.error("Odometer log failed:", error);
    return NextResponse.json({ success: false, error: "Failed to save odometer reading." }, { status: 500 });
  } finally {
    await Promise.all(cleanupPaths.map((p) => fs.unlink(p).catch(() => {})));
    if (tempDir) await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
  }
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const driverId = searchParams.get("driverId");
  if (!driverId) {
    return NextResponse.json({ success: false, error: "driverId is required." }, { status: 400 });
  }

  const logs = await prisma.odometerLog.findMany({
    where: { driverId },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return NextResponse.json({ success: true, logs });
}
