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
  const driverEmail = sessionEmail || queryEmail || "driver@maqayees.com";
  const driverId = sessionUserId || "drv-001";
  const driverName = sessionUserName || "Ahmed Driver";
  const customDriverId = `DRV-${driverId.replace(/[^a-zA-Z0-9]/g, "").slice(0, 8).toUpperCase()}`;

  const driver = {
    id: driverId,
    customId: customDriverId,
    name: driverName,
    email: driverEmail,
    phone: "0551234567",
    iqama: "2456789231",
    passport: "N9876543",
  };

  const vehicle = {
    id: "veh-1234",
    plateNumber: "ABC-1234",
    brand: "Toyota",
    model: "Hilux",
    year: 2022,
    color: "White",
    project: "Project A",
    status: "Active",
  };

  const maintenanceRecords = [
    {
      id: "mnt-001",
      date: "2025-10-10",
      typeKey: "oil_change",
      typeLabel: "Oil Change",
      mileage: "52,100 km",
      cost: "120",
      workshop: "Al Futtaim Service",
    },
    {
      id: "mnt-002",
      date: "2025-09-01",
      typeKey: "preventive_maintenance",
      typeLabel: "Preventive Maintenance",
      mileage: "51,250 km",
      cost: "350",
      workshop: "Toyota Service Center",
    },
  ];

  let activeShift = null;
  try {
    const shiftWhere = {
      isClosed: false,
      OR: [],
    };
    if (driverEmail) {
      shiftWhere.OR.push({ driverEmail });
    }
    if (queryEmail && queryEmail !== driverEmail) {
      shiftWhere.OR.push({ driverEmail: queryEmail });
    }
    if (sessionUserId) {
      shiftWhere.OR.push({ driverId: sessionUserId });
    }

    const shift = await prisma.driverShift.findFirst({
      where: shiftWhere,
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
