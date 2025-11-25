import { NextResponse } from "next/server";
import path from "path";
import os from "os";
import { promises as fs } from "fs";
import { Client } from "basic-ftp";

export const runtime = "nodejs";

const requiredEnvKeys = ["SYNOLOGY_HOST", "SYNOLOGY_PORT", "SYNOLOGY_USER", "SYNOLOGY_PASSWORD", "SYNOLOGY_SHIFT_PATH"];
const hasSynologyConfig = () => requiredEnvKeys.every((key) => !!process.env[key]);

const localUploadRoot = path.join(process.cwd(), "public", "uploads", "shifts");
const dataDir = path.join(process.cwd(), "data");
const dataFilePath = path.join(dataDir, "driver-shifts.json");

async function uploadToSynology(localFilePath, remoteFilePath) {
  const client = new Client();
  client.ftp.verbose = false;

  await client.access({
    host: process.env.SYNOLOGY_HOST,
    port: Number(process.env.SYNOLOGY_PORT),
    user: process.env.SYNOLOGY_USER,
    password: process.env.SYNOLOGY_PASSWORD,
    secure: false,
  });

  const normalizedPath = remoteFilePath.startsWith("/") ? remoteFilePath : `/${remoteFilePath}`;
  const remoteDir = path.posix.dirname(normalizedPath);
  await client.ensureDir(remoteDir);
  await client.uploadFrom(localFilePath, normalizedPath);
  await client.close();
  return normalizedPath;
}

async function saveFileToTemp(file, tempDir, prefix) {
  const buffer = Buffer.from(await file.arrayBuffer());
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const fileName = `${prefix}-${Date.now()}-${sanitizedName || "upload"}`;
  const tempPath = path.join(tempDir, fileName);
  await fs.writeFile(tempPath, buffer);
  return tempPath;
}

function normalizeFileKey(key) {
  if (!key) return key;
  if (key === "vehiclePhotos" || key.startsWith("vehiclePhotos")) return "vehiclePhotos";
  if (key === "odometerPhoto" || key.startsWith("odometerPhoto")) return "odometerPhoto";
  return key;
}

async function copyToLocalUploads(tempPath, relativePath) {
  const destination = path.join(localUploadRoot, relativePath);
  await fs.mkdir(path.dirname(destination), { recursive: true });
  await fs.copyFile(tempPath, destination);
  return `/uploads/shifts/${relativePath.replace(/\\/g, "/")}`;
}

async function readShiftRecords() {
  await fs.mkdir(dataDir, { recursive: true });
  try {
    const raw = await fs.readFile(dataFilePath, "utf-8");
    return JSON.parse(raw);
  } catch (error) {
    if (error.code === "ENOENT") {
      return [];
    }
    throw error;
  }
}

function sanitizeIdentifier(value, fallbackPrefix = "shift") {
  const trimmed = (value || "").trim();
  const sanitized = trimmed.replace(/[^a-zA-Z0-9_-]/g, "_");
  if (sanitized) return sanitized;
  return `${fallbackPrefix}-${Date.now()}`;
}

async function persistShiftRecord({ shiftId, eventType, payload, event }) {
  const records = await readShiftRecords();
  const now = new Date().toISOString();

  let record = records.find((item) => item.id === shiftId);
  if (!record) {
    record = {
      id: shiftId,
      createdAt: now,
      driver: {},
      vehicle: {},
    };
  }

  const driverDetails = {
    ...(payload.driverId ? { id: payload.driverId } : {}),
    ...(payload.driverName ? { name: payload.driverName } : {}),
    ...(payload.driverEmail ? { email: payload.driverEmail } : {}),
    ...(payload.driverPhone ? { phone: payload.driverPhone } : {}),
  };

  const vehicleDetails = {
    ...(payload.vehicleId ? { id: payload.vehicleId } : {}),
    ...(payload.vehiclePlate ? { plate: payload.vehiclePlate } : {}),
    ...(payload.projectName ? { project: payload.projectName } : {}),
  };

  record.driver = { ...record.driver, ...driverDetails };
  record.vehicle = { ...record.vehicle, ...vehicleDetails };
  record.updatedAt = now;
  record[eventType] = event;

  const filtered = records.filter((item) => item.id !== shiftId);
  const updated = [record, ...filtered];
  await fs.writeFile(dataFilePath, JSON.stringify(updated, null, 2), "utf-8");

  return record;
}

export async function POST(req) {
  const cleanupPaths = [];
  let tempDir;

  try {
    const formData = await req.formData();
    const payload = {};
    const fileBuckets = {
      odometerPhoto: [],
      vehiclePhotos: [],
    };

    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        const normalized = normalizeFileKey(key);
        if (fileBuckets[normalized]) {
          fileBuckets[normalized].push(value);
        }
      } else {
        payload[key] = value;
      }
    }

    const eventTypeRaw = (payload.eventType || "").toLowerCase();
    if (!["start", "end"].includes(eventTypeRaw)) {
      return NextResponse.json({ success: false, error: "eventType must be either \"start\" or \"end\"." }, { status: 400 });
    }

    const mileageValue = Number(payload.mileage);
    if (!Number.isFinite(mileageValue) || mileageValue < 0) {
      return NextResponse.json({ success: false, error: "Mileage must be a positive number." }, { status: 400 });
    }

    if (!fileBuckets.odometerPhoto.length) {
      return NextResponse.json({ success: false, error: "An odometer photo is required." }, { status: 400 });
    }

    if (!fileBuckets.vehiclePhotos.length) {
      return NextResponse.json({ success: false, error: "At least one vehicle photo is required." }, { status: 400 });
    }

    if (eventTypeRaw === "end" && !payload.shiftId) {
      return NextResponse.json({ success: false, error: "shiftId is required to close a shift." }, { status: 400 });
    }

    const shiftId = sanitizeIdentifier(payload.shiftId || `shift-${Date.now()}`);
    const recordedAt = payload.recordedAt || new Date().toISOString();
    const synologyBase = hasSynologyConfig()
      ? `${process.env.SYNOLOGY_SHIFT_PATH.replace(/\/$/, "")}/${shiftId}/${eventTypeRaw}`
      : null;

    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "maq-shift-"));
    const uploads = {
      odometerPhoto: null,
      vehiclePhotos: [],
    };

    for (const category of Object.keys(fileBuckets)) {
      const files = fileBuckets[category];
      for (let index = 0; index < files.length; index += 1) {
        const file = files[index];
        const tempPath = await saveFileToTemp(file, tempDir, `${category}-${eventTypeRaw}`);
        cleanupPaths.push(tempPath);
        const ext = path.extname(file.name) || ".jpg";
        const prefix = category === "odometerPhoto" ? "odometer" : `vehicle-${index + 1}`;
        const fileName = `${prefix}${ext}`;
        const localRelativePath = `${shiftId}/${eventTypeRaw}/${fileName}`;
        const remotePathCandidate = synologyBase ? `${synologyBase}/${fileName}` : null;

        let storedPath;
        let location = "local";

        if (remotePathCandidate) {
          try {
            storedPath = await uploadToSynology(tempPath, remotePathCandidate);
            location = "synology";
          } catch (error) {
            console.error("Synology upload failed, falling back to local storage:", error);
          }
        }

        if (!storedPath) {
          storedPath = await copyToLocalUploads(tempPath, localRelativePath);
          location = location === "synology" ? "synology-fallback" : "local";
        }

        const fileInfo = {
          originalName: file.name,
          remotePath: storedPath,
          localPath: !remotePathCandidate || location !== "synology" ? storedPath : null,
          location,
        };

        if (category === "odometerPhoto") {
          uploads.odometerPhoto = fileInfo;
        } else {
          uploads.vehiclePhotos.push(fileInfo);
        }
      }
    }

    const record = await persistShiftRecord({
      shiftId,
      eventType: eventTypeRaw,
      payload: {
        driverId: payload.driverId,
        driverName: payload.driverName,
        driverEmail: payload.driverEmail,
        driverPhone: payload.driverPhone,
        vehicleId: payload.vehicleId,
        vehiclePlate: payload.vehiclePlate,
        projectName: payload.projectName,
      },
      event: {
        mileage: mileageValue,
        recordedAt,
        notes: payload.notes || null,
        startMileage: payload.startMileage && Number.isFinite(Number(payload.startMileage)) ? Number(payload.startMileage) : null,
        uploads,
      },
    });

    return NextResponse.json({ success: true, shift: record }, { status: 200 });
  } catch (error) {
    console.error("Shift submission failed:", error);
    return NextResponse.json({ success: false, error: "Failed to save driver shift." }, { status: 500 });
  } finally {
    await Promise.all(
      cleanupPaths.map((filePath) =>
        fs
          .unlink(filePath)
          .catch(() => {})
      )
    );
    if (tempDir) {
      await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
    }
  }
}
