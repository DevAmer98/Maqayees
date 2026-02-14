import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const session = await getServerSession(authOptions);
  const sessionUserId = session?.user?.id ? String(session.user.id) : "";
  const sessionUserName = session?.user?.name ? String(session.user.name) : "";
  const sessionEmail = session?.user?.email ? String(session.user.email).toLowerCase() : "";
  const queryEmail = (searchParams.get("driverEmail") || "").toLowerCase();
  const lookupEmail = sessionEmail || queryEmail;
  if (!sessionUserId && !lookupEmail) {
    return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 401 });
  }

  let dbDriver = null;
  try {
    const userWhere = sessionUserId
      ? { id: sessionUserId }
      : { email: lookupEmail };

    dbDriver = await prisma.user.findFirst({
      where: {
        ...userWhere,
        role: "driver",
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        iqama: true,
        passport: true,
      },
    });
  } catch (error) {
    console.error("Failed to resolve driver profile", error);
  }

  const effectiveDriverId = dbDriver?.id || sessionUserId;
  const effectiveDriverName = dbDriver?.name || sessionUserName;
  const effectiveDriverEmail = dbDriver?.email || lookupEmail || "";
  const customDriverId = effectiveDriverId
    ? `DRV-${effectiveDriverId.replace(/[^a-zA-Z0-9]/g, "").slice(0, 8).toUpperCase()}`
    : "";

  const driver = {
    id: effectiveDriverId || "",
    customId: customDriverId || null,
    name: effectiveDriverName || "",
    email: effectiveDriverEmail || "",
    phone: dbDriver?.phone || null,
    iqama: dbDriver?.iqama || null,
    passport: dbDriver?.passport || null,
  };

  let assignedVehicle = null;
  try {
    if (effectiveDriverId) {
      assignedVehicle = await prisma.vehicle.findFirst({
        where: { driverId: effectiveDriverId },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          plateNumber: true,
          brand: true,
          model: true,
          year: true,
          color: true,
          projectName: true,
          status: true,
        },
      });
    }

    if (!assignedVehicle && effectiveDriverName) {
      assignedVehicle = await prisma.vehicle.findFirst({
        where: {
          driverName: {
            equals: effectiveDriverName,
            mode: "insensitive",
          },
        },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          plateNumber: true,
          brand: true,
          model: true,
          year: true,
          color: true,
          projectName: true,
          status: true,
        },
      });
    }
  } catch (error) {
    console.error("Failed to resolve assigned vehicle", error);
  }

  const vehicle = assignedVehicle
    ? {
        id: assignedVehicle.id,
        plateNumber: assignedVehicle.plateNumber,
        brand: assignedVehicle.brand,
        model: assignedVehicle.model,
        year: assignedVehicle.year,
        color: assignedVehicle.color,
        project: assignedVehicle.projectName || null,
        status: assignedVehicle.status || "Active",
      }
    : null;

  let maintenanceRecords = [];
  try {
    if (assignedVehicle?.id) {
      const records = await prisma.maintenance.findMany({
        where: { vehicleId: assignedVehicle.id },
        orderBy: { date: "desc" },
        take: 20,
        select: {
          id: true,
          date: true,
          type: true,
          mileage: true,
          cost: true,
          workshop: true,
        },
      });

      maintenanceRecords = records.map((record) => ({
        id: record.id,
        date: record.date.toISOString().slice(0, 10),
        typeKey: record.type || "",
        typeLabel: record.type
          ? record.type
              .split("_")
              .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
              .join(" ")
          : "",
        mileage: `${new Intl.NumberFormat("en-US").format(record.mileage)} km`,
        cost: record.cost === null || record.cost === undefined ? "N/A" : String(record.cost),
        workshop: record.workshop || "N/A",
      }));
    }
  } catch (error) {
    console.error("Failed to resolve maintenance records", error);
  }

  let activeShift = null;
  try {
    const shiftOr = [];
    if (effectiveDriverEmail) {
      shiftOr.push({ driverEmail: effectiveDriverEmail });
    }
    if (queryEmail && queryEmail !== effectiveDriverEmail) {
      shiftOr.push({ driverEmail: queryEmail });
    }
    if (effectiveDriverId) {
      shiftOr.push({ driverId: effectiveDriverId });
    }

    const shift = await prisma.driverShift.findFirst({
      where: shiftOr.length
        ? {
            isClosed: false,
            OR: shiftOr,
          }
        : {
            id: "__no_shift__",
          },
      orderBy: {
        updatedAt: "desc",
      },
    });

    const record = shift?.record ? JSON.parse(JSON.stringify(shift.record)) : null;
    if (shift && !shift.isClosed && record?.start) {
      activeShift = {
        id: shift.id,
        startMileage: typeof record.start.mileage === "number" ? record.start.mileage : null,
        startedAt: record.start.recordedAt || record.createdAt,
      };
    }
  } catch (error) {
    console.error("Failed to resolve active shift", error);
  }

  return NextResponse.json(
    {
      success: true,
      driver,
      vehicle,
      maintenanceRecords,
      activeShift,
    },
    { status: 200 }
  );
}
