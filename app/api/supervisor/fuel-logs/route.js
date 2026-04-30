import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const vehicleId = searchParams.get("vehicleId") || null;
    const from = searchParams.get("from") || null;
    const to = searchParams.get("to") || null;

    const where = {};
    if (vehicleId) where.vehicleId = vehicleId;
    if (from || to) {
      where.date = {};
      if (from) where.date.gte = new Date(from);
      if (to) {
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);
        where.date.lte = toDate;
      }
    }

    const logs = await prisma.fuelLog.findMany({
      where,
      orderBy: { date: "desc" },
      take: 200,
      select: {
        id: true,
        date: true,
        operatorName: true,
        submittedBy: true,
        startKmHr: true,
        endKmHr: true,
        fuelRefilledLiters: true,
        fuelCost: true,
        distanceCoveredKm: true,
        efficiencyLtrPerKm: true,
        notes: true,
        odometerPhotoUrl: true,
        fuelPumpPhotoUrl: true,
        vehicle: {
          select: {
            plateNumber: true,
            model: true,
            brand: true,
          },
        },
      },
    });

    const formatted = logs.map((log) => ({
      id: log.id,
      date: log.date.toISOString(),
      driverName: log.operatorName || "—",
      submittedBy: log.submittedBy || "supervisor",
      truck: log.vehicle
        ? `${log.vehicle.brand || ""} ${log.vehicle.model || ""} — ${log.vehicle.plateNumber}`.trim()
        : "—",
      plateNumber: log.vehicle?.plateNumber || "—",
      startKm: log.startKmHr ?? null,
      endKm: log.endKmHr ?? null,
      distanceKm: log.distanceCoveredKm ?? null,
      liters: log.fuelRefilledLiters,
      cost: log.fuelCost ?? null,
      efficiency: log.efficiencyLtrPerKm ?? null,
      notes: log.notes || null,
      odometerPhotoUrl: log.odometerPhotoUrl || null,
      fuelPumpPhotoUrl: log.fuelPumpPhotoUrl || null,
    }));

    return NextResponse.json({ success: true, logs: formatted }, { status: 200 });
  } catch (error) {
    console.error("Failed to load fuel logs:", error);
    return NextResponse.json({ success: false, error: "Failed to load fuel logs." }, { status: 500 });
  }
}
