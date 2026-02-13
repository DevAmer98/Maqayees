import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

function normalizeType(value) {
  const normalized = String(value || "").trim().toLowerCase().replace(/\s+/g, "_");
  if (normalized === "ppm" || normalized === "preventive") return "preventive_maintenance";
  if (normalized === "oil" || normalized === "oilchange") return "oil_change";
  if (normalized === "inspection" || normalized === "general_inspection") return "inspection";
  if (normalized === "repair") return "repair";
  return normalized || "inspection";
}

export async function GET() {
  try {
    const [records, snapshots] = await Promise.all([
      prisma.maintenance.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          vehicle: {
            select: {
              plateNumber: true,
              brand: true,
              model: true,
              driverName: true,
            },
          },
        },
      }),
      prisma.maintenanceJobCardSnapshot.findMany({
        orderBy: { updatedAt: "desc" },
        select: {
          requestId: true,
          info: true,
          updatedAt: true,
        },
      }),
    ]);

    const maintenanceHistory = records.map((record) => ({
      id: record.id,
      driver: record.vehicle?.driverName || "--",
      vehicle: record.vehicle
        ? `${record.vehicle.brand} ${record.vehicle.model} — ${record.vehicle.plateNumber}`
        : "--",
      date: record.date,
      mileage: String(record.mileage ?? ""),
      type: normalizeType(record.type),
      workshop: record.workshop || "",
      cost: record.cost != null ? String(record.cost) : "",
      nextDueDate: record.nextDueDate || "",
      status: "approved",
      resolvedAt: record.createdAt,
      notes: record.details || "",
    }));

    const snapshotHistory = snapshots.map((snapshot) => {
      const info = snapshot.info && typeof snapshot.info === "object" ? snapshot.info : {};
      const vehicleType = String(info.vehicleType || info.model || "").trim();
      const plateNo = String(info.plateNo || "").trim();
      const vehicle = [vehicleType, plateNo].filter(Boolean).join(" — ") || "--";
      return {
        id: `job-${snapshot.requestId}`,
        driver: String(info.driverName || "--"),
        vehicle,
        date: info.workshopDate || info.dateIn || snapshot.updatedAt,
        mileage: String(info.workshopMileage || info.kms || ""),
        type: normalizeType(info.workshopType || info.repairType || ""),
        workshop: String(info.workshopName || ""),
        cost: String(info.workshopCost || ""),
        nextDueDate: info.workshopNextDueDate || "",
        status: "approved",
        resolvedAt: snapshot.updatedAt,
        notes: String(info.workshopDetails || info.complaint || ""),
      };
    });

    const history = [...maintenanceHistory, ...snapshotHistory].sort(
      (a, b) => new Date(b.resolvedAt).getTime() - new Date(a.resolvedAt).getTime()
    );

    return NextResponse.json({ success: true, history }, { status: 200 });
  } catch (error) {
    console.error("Failed to load maintenance history:", error);
    return NextResponse.json({ success: false, error: "Failed to load maintenance history." }, { status: 500 });
  }
}
