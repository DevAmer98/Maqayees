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

async function saveTemp(file, tempDir, name) {
  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = path.extname(file.name) || ".jpg";
  const filePath = path.join(tempDir, `${name}${ext}`);
  await fs.writeFile(filePath, buffer);
  return { filePath, ext };
}

async function uploadPhoto(filePath, ext, remotePath) {
  if (!hasSynologyConfig()) return null;
  try {
    return await uploadToSynology(filePath, remotePath);
  } catch {
    return null;
  }
}

export async function POST(req) {
  const cleanupPaths = [];
  let tempDir;

  try {
    const formData = await req.formData();

    const driverId = formData.get("driverId");
    const vehicleId = formData.get("vehicleId");
    const driverName = formData.get("driverName") || "unknown";
    const currentOdometer = parseFloat(formData.get("currentOdometer"));
    const litersFilled = parseFloat(formData.get("litersFilled"));
    const fuelCost = formData.get("fuelCost") ? parseFloat(formData.get("fuelCost")) : null;
    const notes = formData.get("notes") || null;
    const odometerPhoto = formData.get("odometerPhoto");
    const pumpPhoto = formData.get("pumpPhoto");

    if (!driverId || !vehicleId) {
      return NextResponse.json({ success: false, error: "driverId and vehicleId are required." }, { status: 400 });
    }
    if (!Number.isFinite(currentOdometer) || currentOdometer < 0) {
      return NextResponse.json({ success: false, error: "Valid current odometer reading is required." }, { status: 400 });
    }
    if (!Number.isFinite(litersFilled) || litersFilled <= 0) {
      return NextResponse.json({ success: false, error: "Liters filled must be a positive number." }, { status: 400 });
    }
    if (!(odometerPhoto instanceof File)) {
      return NextResponse.json({ success: false, error: "Odometer photo is required." }, { status: 400 });
    }
    if (!(pumpPhoto instanceof File)) {
      return NextResponse.json({ success: false, error: "Fuel pump photo is required." }, { status: 400 });
    }

    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "maq-fuel-"));
    const dateStr = new Date().toISOString().slice(0, 10);
    const driverFolder = sanitize(driverName);
    const baseRemote = `maqayees/${driverFolder}/fuel/${dateStr}`;

    const { filePath: odomPath, ext: odomExt } = await saveTemp(odometerPhoto, tempDir, "odometer");
    const { filePath: pumpPath, ext: pumpExt } = await saveTemp(pumpPhoto, tempDir, "pump");
    cleanupPaths.push(odomPath, pumpPath);

    const [odomUrl, pumpUrl] = await Promise.all([
      uploadPhoto(odomPath, odomExt, `${baseRemote}/odometer${odomExt}`),
      uploadPhoto(pumpPath, pumpExt, `${baseRemote}/pump${pumpExt}`),
    ]);

    const prev = await prisma.fuelLog.findFirst({
      where: { vehicleId },
      orderBy: { createdAt: "desc" },
      select: { endKmHr: true },
    });

    const startKmHr = prev?.endKmHr ?? null;
    const distanceCoveredKm = startKmHr != null ? Math.max(0, currentOdometer - startKmHr) : null;
    const efficiencyLtrPerKm =
      distanceCoveredKm && distanceCoveredKm > 0 ? litersFilled / distanceCoveredKm : null;

    const log = await prisma.fuelLog.create({
      data: {
        vehicleId,
        date: new Date(),
        startKmHr,
        endKmHr: currentOdometer,
        fuelRefilledLiters: litersFilled,
        fuelCost,
        distanceCoveredKm,
        efficiencyLtrPerKm,
        operatorName: driverName,
        notes,
        submittedBy: "driver",
        odometerPhotoUrl: odomUrl,
        fuelPumpPhotoUrl: pumpUrl,
      },
    });

    return NextResponse.json({ success: true, log }, { status: 200 });
  } catch (error) {
    console.error("Driver fuel submission failed:", error);
    return NextResponse.json({ success: false, error: "Failed to save fuel entry." }, { status: 500 });
  } finally {
    await Promise.all(cleanupPaths.map((p) => fs.unlink(p).catch(() => {})));
    if (tempDir) await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
  }
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const vehicleId = searchParams.get("vehicleId");
  if (!vehicleId) {
    return NextResponse.json({ success: false, error: "vehicleId is required." }, { status: 400 });
  }

  const logs = await prisma.fuelLog.findMany({
    where: { vehicleId, submittedBy: "driver" },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return NextResponse.json({ success: true, logs });
}
