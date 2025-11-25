import { NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";

const dataDir = path.join(process.cwd(), "data");
const shiftDataFile = path.join(dataDir, "driver-shifts.json");

async function readShiftRecords() {
  try {
    const raw = await fs.readFile(shiftDataFile, "utf-8");
    return JSON.parse(raw);
  } catch (error) {
    if (error.code === "ENOENT") {
      return [];
    }
    console.error("Failed to read shift records", error);
    return [];
  }
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const driverEmail = (searchParams.get("driverEmail") || "driver@maqayees.com").toLowerCase();

  const driver = {
    id: "drv-001",
    name: "Ahmed Driver",
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
    const shiftRecords = await readShiftRecords();
    const record = shiftRecords.find(
      (entry) =>
        entry.driver?.email?.toLowerCase() === driverEmail &&
        entry.start &&
        !entry.end
    );
    if (record) {
      activeShift = {
        id: record.id,
        startMileage:
          typeof record.start?.mileage === "number" ? record.start.mileage : null,
        startedAt: record.start?.recordedAt || record.createdAt,
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
