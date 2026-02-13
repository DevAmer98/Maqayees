import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

function parsePlateFromVehicleLabel(label) {
  const value = String(label || "").trim();
  if (!value) return "";
  const parts = value.split("—").map((part) => part.trim()).filter(Boolean);
  return parts[1] || parts[0] || "";
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
      vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId }, select: { id: true } });
    }

    if (!vehicle && plateNumber) {
      vehicle = await prisma.vehicle.findFirst({
        where: {
          plateNumber: {
            equals: plateNumber,
            mode: "insensitive",
          },
        },
        select: { id: true },
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
