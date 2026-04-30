import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

function parsePlateFromVehicleLabel(label) {
  const value = String(label || "").trim();
  if (!value) return "";
  const parts = value.split("—").map((part) => part.trim()).filter(Boolean);
  return parts[1] || parts[0] || "";
}

function formatVehicleLabel(vehicle) {
  if (!vehicle) return "--";
  return `${vehicle.brand} ${vehicle.model} — ${vehicle.plateNumber}`;
}

function serializeMaintenanceRequest(request) {
  return {
    id: request.id,
    vehicleId: request.vehicleId,
    driverId: request.driverId || "",
    driver: request.driverName || request.vehicle?.driverName || "--",
    vehicle: formatVehicleLabel(request.vehicle),
    date: request.date.toISOString().slice(0, 10),
    mileage: String(request.mileage ?? ""),
    type: request.type,
    submittedAt: request.submittedAt,
    status: request.status,
    resolvedAt: request.resolvedAt || null,
    decisionNote: request.decisionNote || "",
    notes: request.notes || "",
    attachments: [],
  };
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = String(searchParams.get("status") || "pending").trim().toLowerCase();
    const allowedStatuses = new Set(["pending", "approved", "rejected", "all"]);

    if (!allowedStatuses.has(status)) {
      return NextResponse.json({ success: false, error: "Invalid request status." }, { status: 400 });
    }

    const requests = await prisma.maintenanceRequest.findMany({
      where: status === "all" ? undefined : { status },
      orderBy: { submittedAt: "desc" },
      include: {
        vehicle: {
          select: {
            id: true,
            plateNumber: true,
            brand: true,
            model: true,
            driverName: true,
          },
        },
      },
    });

    return NextResponse.json(
      { success: true, requests: requests.map(serializeMaintenanceRequest) },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to load maintenance requests:", error);
    return NextResponse.json({ success: false, error: "Failed to load maintenance requests." }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    const date = body?.date ? new Date(body.date) : null;
    const mileage = Number(body?.mileage);
    const type = String(body?.type || "").trim();

    if (!date || Number.isNaN(date.getTime())) {
      return NextResponse.json({ success: false, error: "Valid maintenance date is required." }, { status: 400 });
    }
    if (!Number.isFinite(mileage) || mileage < 0) {
      return NextResponse.json({ success: false, error: "Valid mileage is required." }, { status: 400 });
    }
    if (!type) {
      return NextResponse.json({ success: false, error: "Maintenance type is required." }, { status: 400 });
    }

    let vehicle = null;
    const vehicleId = String(body?.vehicleId || "").trim();
    const plateNumber = parsePlateFromVehicleLabel(body?.vehicleLabel);

    if (vehicleId) {
      vehicle = await prisma.vehicle.findUnique({
        where: { id: vehicleId },
        select: {
          id: true,
          plateNumber: true,
          brand: true,
          model: true,
          driverId: true,
          driverName: true,
        },
      });
    }

    if (!vehicle && plateNumber) {
      vehicle = await prisma.vehicle.findFirst({
        where: {
          plateNumber: {
            equals: plateNumber,
            mode: "insensitive",
          },
        },
        select: {
          id: true,
          plateNumber: true,
          brand: true,
          model: true,
          driverId: true,
          driverName: true,
        },
      });
    }

    if (!vehicle) {
      return NextResponse.json(
        { success: false, error: "No matching vehicle found for this maintenance record." },
        { status: 404 }
      );
    }

    const costNumber = body?.cost === "" || body?.cost == null ? null : Number(body.cost);
    const cost = Number.isFinite(costNumber) ? costNumber : null;

    const nextDueDate = body?.nextDueDate ? new Date(body.nextDueDate) : null;
    const nextDue = nextDueDate && !Number.isNaN(nextDueDate.getTime()) ? nextDueDate : null;
    const shouldCreateFinalRecord = Boolean(body?.workshop || body?.cost || body?.nextDueDate || body?.complete === true);

    if (!shouldCreateFinalRecord) {
      const createdRequest = await prisma.maintenanceRequest.create({
        data: {
          vehicleId: vehicle.id,
          driverId: vehicle.driverId || null,
          driverName: vehicle.driverName || null,
          type,
          date,
          mileage: Math.round(mileage),
          notes: body?.details || body?.notes ? String(body.details || body.notes) : null,
        },
        include: {
          vehicle: {
            select: {
              id: true,
              plateNumber: true,
              brand: true,
              model: true,
              driverName: true,
            },
          },
        },
      });

      return NextResponse.json(
        { success: true, request: serializeMaintenanceRequest(createdRequest) },
        { status: 201 }
      );
    }

    const created = await prisma.maintenance.create({
      data: {
        vehicleId: vehicle.id,
        type,
        date,
        mileage: Math.round(mileage),
        cost,
        workshop: body?.workshop ? String(body.workshop) : null,
        details: body?.details ? String(body.details) : null,
        nextDueDate: nextDue,
      },
    });

    return NextResponse.json({ success: true, maintenance: created }, { status: 200 });
  } catch (error) {
    console.error("Failed to create maintenance record:", error);
    return NextResponse.json({ success: false, error: "Failed to create maintenance record." }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json();
    const requestId = String(body?.requestId || "").trim();
    const status = String(body?.status || "").trim().toLowerCase();

    if (!requestId) {
      return NextResponse.json({ success: false, error: "Request id is required." }, { status: 400 });
    }
    if (!["approved", "rejected"].includes(status)) {
      return NextResponse.json({ success: false, error: "Valid status is required." }, { status: 400 });
    }

    const updated = await prisma.maintenanceRequest.update({
      where: { id: requestId },
      data: {
        status,
        decisionNote: body?.decisionNote ? String(body.decisionNote) : null,
        resolvedAt: new Date(),
      },
      include: {
        vehicle: {
          select: {
            id: true,
            plateNumber: true,
            brand: true,
            model: true,
            driverName: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, request: serializeMaintenanceRequest(updated) }, { status: 200 });
  } catch (error) {
    console.error("Failed to update maintenance request:", error);
    return NextResponse.json({ success: false, error: "Failed to update maintenance request." }, { status: 500 });
  }
}
