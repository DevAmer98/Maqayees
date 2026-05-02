import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const STRATEGY = { DAILY: "daily", WEEKLY: "weekly", MONTHLY: "monthly" };

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function formatDayKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function startOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1)); // align to Monday
  return startOfDay(d);
}

function getStrategy(totalDays) {
  if (totalDays <= 14) return STRATEGY.DAILY;
  if (totalDays <= 90) return STRATEGY.WEEKLY;
  return STRATEGY.MONTHLY;
}

function getLogBucketKey(date, strategy) {
  const d = new Date(date);
  if (strategy === STRATEGY.DAILY) return formatDayKey(d);
  if (strategy === STRATEGY.WEEKLY) return formatDayKey(startOfWeek(d));
  // monthly
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function buildBuckets(from, to, strategy, useWeekdayLabels = false) {
  const start = startOfDay(from);
  const end = startOfDay(to);
  const buckets = [];

  if (strategy === STRATEGY.DAILY) {
    const cursor = new Date(start);
    while (cursor <= end) {
      const label = useWeekdayLabels
        ? WEEKDAY_LABELS[cursor.getDay()]
        : cursor.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      buckets.push({ key: formatDayKey(cursor), label, mileage: 0, fuel: 0 });
      cursor.setDate(cursor.getDate() + 1);
    }
  } else if (strategy === STRATEGY.WEEKLY) {
    const cursor = startOfWeek(start);
    while (cursor <= end) {
      buckets.push({
        key: formatDayKey(cursor),
        label: cursor.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        mileage: 0,
        fuel: 0,
      });
      cursor.setDate(cursor.getDate() + 7);
    }
  } else {
    // monthly
    const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
    while (cursor <= end) {
      const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}`;
      buckets.push({
        key,
        label: cursor.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
        mileage: 0,
        fuel: 0,
      });
      cursor.setMonth(cursor.getMonth() + 1);
    }
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
    const fromParam = searchParams.get("from");
    const toParam = searchParams.get("to");

    let rangeStart, rangeEnd, buckets, strategy;

    if (fromParam && toParam) {
      const parsedFrom = new Date(fromParam);
      const parsedTo = new Date(toParam);
      if (Number.isNaN(parsedFrom.getTime()) || Number.isNaN(parsedTo.getTime())) {
        return NextResponse.json({ success: false, error: "Invalid date range." }, { status: 400 });
      }
      rangeStart = startOfDay(parsedFrom);
      rangeEnd = startOfDay(parsedTo);
      rangeEnd.setHours(23, 59, 59, 999);

      const dayMs = 24 * 60 * 60 * 1000;
      const totalDays = Math.round((rangeEnd - rangeStart) / dayMs) + 1;
      strategy = getStrategy(totalDays);
      buckets = buildBuckets(parsedFrom, parsedTo, strategy, false);
    } else {
      // Default: last 7 days with weekday labels
      const today = startOfDay(new Date());
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(today.getDate() - 6);
      rangeStart = sevenDaysAgo;
      rangeEnd = new Date(today);
      rangeEnd.setHours(23, 59, 59, 999);
      strategy = STRATEGY.DAILY;
      buckets = buildBuckets(sevenDaysAgo, today, strategy, true);
    }

    const vehicleFilter = selectedTruckId ? { vehicleId: selectedTruckId } : {};

    const [drivers, vehicles, activeShifts, fuelLogs, priorLogs, checklists] = await Promise.all([
      prisma.user.findMany({
        where: { role: "driver" },
        orderBy: { name: "asc" },
        select: { id: true, name: true },
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
      // All fuel logs within the range, ordered for distance chain
      prisma.fuelLog.findMany({
        where: {
          ...vehicleFilter,
          date: { gte: rangeStart, lte: rangeEnd },
        },
        orderBy: [{ vehicleId: "asc" }, { date: "asc" }],
        select: {
          vehicleId: true,
          date: true,
          distanceCoveredKm: true,
          endKmHr: true,
          fuelRefilledLiters: true,
        },
      }),
      // Last fuel log per vehicle before the range (mileage baseline)
      prisma.fuelLog.findMany({
        where: {
          ...vehicleFilter,
          date: { lt: rangeStart },
        },
        orderBy: [{ vehicleId: "asc" }, { date: "desc" }],
        distinct: ["vehicleId"],
        select: { vehicleId: true, endKmHr: true },
      }),
      prisma.driverChecklist.findMany({
        orderBy: { updatedAt: "desc" },
        select: {
          driverId: true,
          record: true,
          updatedAt: true,
        },
      }),
    ]);

    // --- Driver & checklist maps ---
    const checklistByDriverId = new Map();
    checklists.forEach((c) => {
      if (!checklistByDriverId.has(c.driverId)) checklistByDriverId.set(c.driverId, c);
    });

    const vehicleByDriverId = new Map();
    const vehicleByDriverName = new Map();
    vehicles.forEach((v) => {
      if (v.driverId && !vehicleByDriverId.has(v.driverId)) vehicleByDriverId.set(v.driverId, v);
      const n = (v.driverName || "").trim().toLowerCase();
      if (n && !vehicleByDriverName.has(n)) vehicleByDriverName.set(n, v);
    });

    const activeShiftByDriverId = new Map();
    const activeShiftByDriverName = new Map();
    activeShifts.forEach((s) => {
      if (s.driverId && !activeShiftByDriverId.has(s.driverId)) activeShiftByDriverId.set(s.driverId, s);
      const n = (s.driverName || "").trim().toLowerCase();
      if (n && !activeShiftByDriverName.has(n)) activeShiftByDriverName.set(n, s);
    });

    let activeDrivers = drivers.map((driver) => {
      const n = (driver.name || "").trim().toLowerCase();
      const shift = activeShiftByDriverId.get(driver.id) || activeShiftByDriverName.get(n) || null;
      const vehicle = vehicleByDriverId.get(driver.id) || vehicleByDriverName.get(n) || null;
      const truckLabel =
        shift?.vehiclePlate ||
        (vehicle ? `${vehicle.model} - ${vehicle.plateNumber}` : "Unassigned");
      const latestChecklist = checklistByDriverId.get(driver.id) || null;
      return {
        id: driver.id,
        name: driver.name,
        truck: truckLabel,
        status: shift ? "On Duty" : "Off Duty",
        lastUpdate: formatLastUpdate(shift?.updatedAt),
        checklist: latestChecklist
          ? { updatedAt: latestChecklist.updatedAt.toISOString(), record: latestChecklist.record }
          : null,
      };
    });

    const knownDriverIds = new Set(activeDrivers.map((d) => d.id));
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
      const sel = vehicles.find((v) => v.id === selectedTruckId);
      const plateLower = (sel?.plateNumber || "").toLowerCase();
      activeDrivers = activeDrivers.filter((d) =>
        plateLower ? String(d.truck || "").toLowerCase().includes(plateLower) : false
      );
    }

    // --- Chart data: mileage + fuel aggregation ---
    const lastKmByVehicle = new Map(
      priorLogs.filter((l) => l.endKmHr !== null).map((l) => [l.vehicleId, Number(l.endKmHr)])
    );

    const bucketMap = new Map(buckets.map((b) => [b.key, b]));

    fuelLogs.forEach((log) => {
      const key = getLogBucketKey(log.date, strategy);
      const bucket = bucketMap.get(key);
      if (!bucket) return;

      let distance = 0;
      if (log.distanceCoveredKm !== null && log.distanceCoveredKm !== undefined) {
        distance = Number(log.distanceCoveredKm);
      } else {
        const prevKm = lastKmByVehicle.get(log.vehicleId);
        if (prevKm !== undefined && log.endKmHr !== null && log.endKmHr !== undefined) {
          distance = Math.max(0, Number(log.endKmHr) - prevKm);
        }
      }

      if (log.endKmHr !== null && log.endKmHr !== undefined) {
        lastKmByVehicle.set(log.vehicleId, Number(log.endKmHr));
      }

      const fuel = Number(log.fuelRefilledLiters || 0);
      bucket.mileage += Number.isFinite(distance) ? distance : 0;
      bucket.fuel += Number.isFinite(fuel) ? fuel : 0;
    });

    const weeklyMileage = buckets.map((b) => ({ day: b.label, mileage: Number(b.mileage.toFixed(1)) }));
    const weeklyFuel = buckets.map((b) => ({ day: b.label, fuel: Number(b.fuel.toFixed(1)) }));

    const onDutyCount = activeDrivers.filter((d) => d.status === "On Duty").length;
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
          strategy,
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
