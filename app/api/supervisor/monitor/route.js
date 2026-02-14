import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function formatDayKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function buildWeekBuckets() {
  const today = startOfDay(new Date());
  const buckets = [];
  for (let offset = 6; offset >= 0; offset -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - offset);
    buckets.push({
      dayKey: formatDayKey(date),
      label: WEEKDAY_LABELS[date.getDay()],
      mileage: 0,
      fuel: 0,
    });
  }
  return buckets;
}

function formatLastUpdate(dateValue) {
  if (!dateValue) return "—";
  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) return "—";
  return parsed.toISOString();
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const selectedTruckId = String(searchParams.get("truckId") || "").trim();
    const weekBuckets = buildWeekBuckets();
    const weekStart = new Date(weekBuckets[0].dayKey);
    const weekEnd = new Date(weekBuckets[weekBuckets.length - 1].dayKey);
    weekEnd.setHours(23, 59, 59, 999);

    const [drivers, vehicles, activeShifts, fuelLogs] = await Promise.all([
      prisma.user.findMany({
        where: { role: "driver" },
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
        },
      }),
      prisma.vehicle.findMany({
        select: {
          id: true,
          plateNumber: true,
          model: true,
          driverId: true,
          driverName: true,
        },
      }),
      prisma.driverShift.findMany({
        where: { isClosed: false },
        orderBy: { updatedAt: "desc" },
        select: {
          driverId: true,
          driverName: true,
          vehicleId: true,
          vehiclePlate: true,
          updatedAt: true,
        },
      }),
      prisma.fuelLog.findMany({
        where: {
          ...(selectedTruckId ? { vehicleId: selectedTruckId } : {}),
          date: {
            gte: weekStart,
            lte: weekEnd,
          },
        },
        select: {
          date: true,
          distanceCoveredKm: true,
          fuelRefilledLiters: true,
        },
      }),
    ]);

    const vehicleByDriverId = new Map();
    const vehicleByDriverName = new Map();
    vehicles.forEach((vehicle) => {
      if (vehicle.driverId && !vehicleByDriverId.has(vehicle.driverId)) {
        vehicleByDriverId.set(vehicle.driverId, vehicle);
      }
      const normalizedName = (vehicle.driverName || "").trim().toLowerCase();
      if (normalizedName && !vehicleByDriverName.has(normalizedName)) {
        vehicleByDriverName.set(normalizedName, vehicle);
      }
    });

    const activeShiftByDriverId = new Map();
    const activeShiftByDriverName = new Map();
    activeShifts.forEach((shift) => {
      if (shift.driverId && !activeShiftByDriverId.has(shift.driverId)) {
        activeShiftByDriverId.set(shift.driverId, shift);
      }
      const normalizedName = (shift.driverName || "").trim().toLowerCase();
      if (normalizedName && !activeShiftByDriverName.has(normalizedName)) {
        activeShiftByDriverName.set(normalizedName, shift);
      }
    });

    let activeDrivers = drivers.map((driver) => {
      const normalizedDriverName = (driver.name || "").trim().toLowerCase();
      const shift =
        activeShiftByDriverId.get(driver.id) ||
        activeShiftByDriverName.get(normalizedDriverName) ||
        null;
      const assignedVehicle =
        vehicleByDriverId.get(driver.id) ||
        vehicleByDriverName.get(normalizedDriverName) ||
        null;

      const truckLabel =
        shift?.vehiclePlate ||
        (assignedVehicle ? `${assignedVehicle.model} - ${assignedVehicle.plateNumber}` : "Unassigned");

      return {
        id: driver.id,
        name: driver.name,
        truck: truckLabel,
        status: shift ? "On Duty" : "Off Duty",
        lastUpdate: formatLastUpdate(shift?.updatedAt),
      };
    });

    const knownDriverIds = new Set(activeDrivers.map((driver) => driver.id));
    activeShifts.forEach((shift) => {
      if (shift.driverId && knownDriverIds.has(shift.driverId)) return;
      if (!shift.driverName) return;
      activeDrivers.push({
        id: shift.driverId || `shift-${shift.driverName.toLowerCase().replace(/\s+/g, "-")}`,
        name: shift.driverName,
        truck: shift.vehiclePlate || "Unassigned",
        status: "On Duty",
        lastUpdate: formatLastUpdate(shift.updatedAt),
      });
    });

    activeDrivers.sort((a, b) => {
      if (a.status !== b.status) return a.status === "On Duty" ? -1 : 1;
      return a.name.localeCompare(b.name);
    });

    if (selectedTruckId) {
      const selectedTruck = vehicles.find((vehicle) => vehicle.id === selectedTruckId);
      const selectedPlate = selectedTruck?.plateNumber || "";
      const selectedPlateLower = selectedPlate.toLowerCase();

      activeDrivers = activeDrivers.filter((driver) => {
        const truckLabel = String(driver.truck || "").toLowerCase();
        return selectedPlateLower ? truckLabel.includes(selectedPlateLower) : false;
      });
    }

    const weeklyByDay = new Map(weekBuckets.map((bucket) => [bucket.dayKey, bucket]));
    fuelLogs.forEach((log) => {
      const key = formatDayKey(new Date(log.date));
      const bucket = weeklyByDay.get(key);
      if (!bucket) return;

      const distance = Number(log.distanceCoveredKm || 0);
      const fuel = Number(log.fuelRefilledLiters || 0);
      bucket.mileage += Number.isFinite(distance) ? distance : 0;
      bucket.fuel += Number.isFinite(fuel) ? fuel : 0;
    });

    const weeklyMileage = weekBuckets.map((bucket) => ({
      day: bucket.label,
      mileage: Number(bucket.mileage.toFixed(1)),
    }));
    const weeklyFuel = weekBuckets.map((bucket) => ({
      day: bucket.label,
      fuel: Number(bucket.fuel.toFixed(1)),
    }));

    const onDutyCount = activeDrivers.filter((driver) => driver.status === "On Duty").length;
    const offDutyCount = Math.max(activeDrivers.length - onDutyCount, 0);

    return NextResponse.json(
      {
        success: true,
        data: {
          driverStatus: [
            { name: "On Duty", value: onDutyCount },
            { name: "Off Duty", value: offDutyCount },
          ],
          weeklyMileage,
          weeklyFuel,
          activeDrivers,
          refreshedAt: new Date().toISOString(),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to load supervisor monitor data:", error);
    return NextResponse.json({ success: false, error: "Unable to load monitor data." }, { status: 500 });
  }
}
