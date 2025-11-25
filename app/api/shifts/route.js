import { NextResponse } from "next/server";
import path from "path";
import os from "os";
import { promises as fs } from "fs";
import { Client } from "basic-ftp";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

const requiredEnvKeys = ["SYNOLOGY_HOST", "SYNOLOGY_PORT", "SYNOLOGY_USER", "SYNOLOGY_PASSWORD", "SYNOLOGY_SHIFT_PATH"];
const hasSynologyConfig = () => requiredEnvKeys.every((key) => !!process.env[key]);

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

function sanitizeFileName(value, fallback = "upload") {
  if (!value) return fallback;
  const sanitized = value.replace(/[^a-zA-Z0-9._-]/g, "_");
  return sanitized || fallback;
}

async function downloadRemoteFile(url, tempDir, fileName) {
  if (!tempDir) throw new Error("tempDir is required to download remote files.");
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download uploaded file from ${url}`);
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  const tempPath = path.join(tempDir, fileName);
  await fs.writeFile(tempPath, buffer);
  return tempPath;
}

function sanitizeIdentifier(value, fallbackPrefix = "shift") {
  const trimmed = (value || "").trim();
  const sanitized = trimmed.replace(/[^a-zA-Z0-9_-]/g, "_");
  if (sanitized) return sanitized;
  return `${fallbackPrefix}-${Date.now()}`;
}

function ensureUploadPayload(upload) {
  if (!upload || typeof upload.url !== "string") {
    throw new Error("Uploaded file metadata is missing the \"url\" property.");
  }
}

async function processUploadedFile({ upload, prefix, synologyBase, tempDir, cleanupPaths }) {
  ensureUploadPayload(upload);
  const sanitizedOriginal = sanitizeFileName(upload.originalName || path.basename(upload.pathname || prefix));
  const ext = path.extname(upload.pathname || "") || path.extname(upload.originalName || "") || ".jpg";
  const remotePathCandidate = synologyBase ? `${synologyBase}/${prefix}${ext}` : null;

  let storedPath = upload.url;
  let location = "blob";

  if (remotePathCandidate && tempDir) {
    try {
      const tempFileName = `${prefix}-${Date.now()}${ext}`;
      const tempPath = await downloadRemoteFile(upload.url, tempDir, tempFileName);
      cleanupPaths.push(tempPath);
      storedPath = await uploadToSynology(tempPath, remotePathCandidate);
      location = "synology";
    } catch (error) {
      console.error("Synology upload failed, keeping blob URL:", error);
    }
  }

  return {
    originalName: sanitizedOriginal,
    remotePath: storedPath,
    blobPath: upload.pathname || null,
    blobUrl: upload.url,
    location,
    contentType: upload.contentType || null,
  };
}

async function resolveUploads({ uploadsPayload, synologyBase, tempDir, cleanupPaths }) {
  if (!uploadsPayload?.odometerPhoto) {
    throw new Error("An odometer photo upload is required.");
  }
  if (!Array.isArray(uploadsPayload.vehiclePhotos) || uploadsPayload.vehiclePhotos.length === 0) {
    throw new Error("At least one vehicle photo upload is required.");
  }

  const uploads = {
    odometerPhoto: await processUploadedFile({
      upload: uploadsPayload.odometerPhoto,
      prefix: "odometer",
      synologyBase,
      tempDir,
      cleanupPaths,
    }),
    vehiclePhotos: [],
  };

  for (let index = 0; index < uploadsPayload.vehiclePhotos.length; index += 1) {
    const fileUpload = uploadsPayload.vehiclePhotos[index];
    const prefix = `vehicle-${index + 1}`;
    const result = await processUploadedFile({
      upload: fileUpload,
      prefix,
      synologyBase,
      tempDir,
      cleanupPaths,
    });
    uploads.vehiclePhotos.push(result);
  }

  return uploads;
}

async function loadShiftRecord(shiftId) {
  const existing = await prisma.driverShift.findUnique({ where: { id: shiftId } });
  if (!existing?.record) {
    return null;
  }
  return JSON.parse(JSON.stringify(existing.record));
}

function toShiftMetadata(record) {
  const driverEmail = record.driver?.email ? record.driver.email.toLowerCase() : null;
  return {
    driverId: record.driver?.id || null,
    driverName: record.driver?.name || null,
    driverEmail,
    driverPhone: record.driver?.phone || null,
    vehicleId: record.vehicle?.id || null,
    vehiclePlate: record.vehicle?.plate || null,
    projectName: record.vehicle?.project || null,
    isClosed: Boolean(record.end),
  };
}

async function persistShiftRecord({ shiftId, eventType, payload, event }) {
  const now = new Date().toISOString();
  const existing = await loadShiftRecord(shiftId);

  const baseRecord = existing || {
    id: shiftId,
    createdAt: now,
    driver: {},
    vehicle: {},
  };

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

  const record = {
    ...baseRecord,
    driver: { ...baseRecord.driver, ...driverDetails },
    vehicle: { ...baseRecord.vehicle, ...vehicleDetails },
    updatedAt: now,
    [eventType]: event,
  };

  const metadata = toShiftMetadata(record);

  await prisma.driverShift.upsert({
    where: { id: shiftId },
    create: {
      id: shiftId,
      record,
      ...metadata,
    },
    update: {
      record,
      ...metadata,
    },
  });

  return record;
}

export async function POST(req) {
  const cleanupPaths = [];
  let tempDir;

  try {
    const payload = await req.json();

    const eventTypeRaw = (payload.eventType || "").toLowerCase();
    if (!["start", "end"].includes(eventTypeRaw)) {
      return NextResponse.json({ success: false, error: "eventType must be either \"start\" or \"end\"." }, { status: 400 });
    }

    const mileageValue = Number(payload.mileage);
    if (!Number.isFinite(mileageValue) || mileageValue < 0) {
      return NextResponse.json({ success: false, error: "Mileage must be a positive number." }, { status: 400 });
    }

    if (eventTypeRaw === "end" && !payload.shiftId) {
      return NextResponse.json({ success: false, error: "shiftId is required to close a shift." }, { status: 400 });
    }

    if (!payload.uploads) {
      return NextResponse.json({ success: false, error: "Uploaded file metadata is required." }, { status: 400 });
    }

    const shiftId = sanitizeIdentifier(payload.shiftId || `shift-${Date.now()}`);
    const recordedAt = payload.recordedAt || new Date().toISOString();
    const synologyBase = hasSynologyConfig()
      ? `${process.env.SYNOLOGY_SHIFT_PATH.replace(/\/$/, "")}/${shiftId}/${eventTypeRaw}`
      : null;

    if (synologyBase) {
      tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "maq-shift-"));
    }

    const uploads = await resolveUploads({
      uploadsPayload: payload.uploads,
      synologyBase,
      tempDir,
      cleanupPaths,
    });

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
