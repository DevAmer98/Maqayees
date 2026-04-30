import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

function sanitizeIdentifier(value, fallbackPrefix = "shift") {
  const trimmed = (value || "").trim();
  const sanitized = trimmed.replace(/[^a-zA-Z0-9_-]/g, "_");
  if (sanitized) return sanitized;
  return `${fallbackPrefix}-${Date.now()}`;
}

function processUploadedFile({ upload, prefix }) {
  if (!upload || typeof upload.url !== "string") {
    throw new Error(`Uploaded file metadata is missing the "url" property for "${prefix}".`);
  }
  return {
    originalName: upload.originalName || prefix,
    remotePath: upload.url,
    pathname: upload.pathname || upload.url,
    location: upload.location || "stored",
    contentType: upload.contentType || null,
  };
}

function resolveUploads({ uploadsPayload }) {
  if (!uploadsPayload?.odometerPhoto) {
    throw new Error("An odometer photo upload is required.");
  }
  if (!Array.isArray(uploadsPayload.vehiclePhotos) || uploadsPayload.vehiclePhotos.length === 0) {
    throw new Error("At least one vehicle photo upload is required.");
  }

  return {
    odometerPhoto: processUploadedFile({ upload: uploadsPayload.odometerPhoto, prefix: "odometer" }),
    vehiclePhotos: uploadsPayload.vehiclePhotos.map((fileUpload, index) =>
      processUploadedFile({ upload: fileUpload, prefix: `vehicle-${index + 1}` })
    ),
  };
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

    if (eventTypeRaw === "start" && !payload.vehicleId) {
      return NextResponse.json({ success: false, error: "You are not assigned to a truck. Please contact your supervisor before starting a shift." }, { status: 400 });
    }

    if (!payload.uploads) {
      return NextResponse.json({ success: false, error: "Uploaded file metadata is required." }, { status: 400 });
    }

    const shiftId = sanitizeIdentifier(payload.shiftId || `shift-${Date.now()}`);
    const recordedAt = payload.recordedAt || new Date().toISOString();

    const uploads = resolveUploads({ uploadsPayload: payload.uploads });

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
  }
}
