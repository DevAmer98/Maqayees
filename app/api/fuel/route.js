import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

function toNumberOrNull(value) {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function POST(request) {
  try {
    const body = await request.json();

    const vehicleId = String(body?.vehicleId || "").trim();
    const currentOdometer = toNumberOrNull(body?.currentOdometer);
    const litersFilled = toNumberOrNull(body?.litersFilled);
    const fuelCost = toNumberOrNull(body?.fuelCost);
    const notes = body?.notes ? String(body.notes).trim() : null;
    const date = body?.date ? new Date(body.date) : new Date();

    if (!vehicleId) {
      return NextResponse.json({ success: false, error: "vehicleId is required." }, { status: 400 });
    }
    if (!currentOdometer || currentOdometer < 0) {
      return NextResponse.json({ success: false, error: "currentOdometer must be a valid positive number." }, { status: 400 });
    }
    if (!litersFilled || litersFilled <= 0) {
      return NextResponse.json({ success: false, error: "litersFilled must be a valid positive number." }, { status: 400 });
    }
    if (Number.isNaN(date.getTime())) {
      return NextResponse.json({ success: false, error: "date is invalid." }, { status: 400 });
    }

    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
      select: { id: true, projectId: true, plateNumber: true, model: true },
    });

    if (!vehicle) {
      return NextResponse.json({ success: false, error: "Vehicle not found." }, { status: 404 });
    }

    const previousLog = await prisma.fuelLog.findFirst({
      where: { vehicleId },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      select: {
        startKmHr: true,
        endKmHr: true,
      },
    });

    const startKmHr = previousLog?.endKmHr ?? previousLog?.startKmHr ?? null;
    const endKmHr = currentOdometer;

    if (startKmHr !== null && endKmHr < startKmHr) {
      return NextResponse.json(
        { success: false, error: "Current odometer cannot be less than previous reading." },
        { status: 400 }
      );
    }

    const distanceCoveredKm = startKmHr !== null ? endKmHr - startKmHr : null;
    const efficiencyLtrPerKm =
      distanceCoveredKm !== null && litersFilled > 0 ? distanceCoveredKm / litersFilled : null;

    const fuelLog = await prisma.fuelLog.create({
      data: {
        vehicleId: vehicle.id,
        projectId: vehicle.projectId || null,
        date,
        startKmHr,
        endKmHr,
        fuelRefilledLiters: litersFilled,
        fuelCost,
        distanceCoveredKm,
        efficiencyLtrPerKm,
        notes,
      },
    });

    return NextResponse.json(
      {
        success: true,
        fuelLog,
        summary: {
          truckLabel: `${vehicle.model} — ${vehicle.plateNumber}`,
          startKmHr,
          endKmHr,
          distanceCoveredKm,
          efficiencyLtrPerKm,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create fuel report:", error);
    return NextResponse.json({ success: false, error: "Failed to create fuel report." }, { status: 500 });
  }
}
