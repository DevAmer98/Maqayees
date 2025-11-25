import { NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";
import prisma from "@/lib/prisma";

const dataDir = path.join(process.cwd(), "data");
const dataFilePath = path.join(dataDir, "trucks.json");

const allowedUpdateFields = [
  "plateNumber",
  "brand",
  "model",
  "year",
  "color",
  "equipmentType",
  "fuelType",
  "tankCapacityLiters",
  "purchaseDate",
  "initialOdometerKm",
  "registrationExpiry",
  "insuranceExpiry",
  "serialNumber",
  "chassisNumber",
  "projectName",
  "driverName",
  "status",
];

const parseDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const parseFloatOrNull = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const parsed = parseFloat(value);
  return Number.isNaN(parsed) ? null : parsed;
};

async function readTruckUploads(vehicleId) {
  try {
    const raw = await fs.readFile(dataFilePath, "utf-8");
    const records = JSON.parse(raw);
    const match = records.find((record) => record.databaseId === vehicleId);
    return match?.uploads || null;
  } catch (error) {
    if (error.code === "ENOENT") return null;
    console.error("Failed to read truck uploads:", error);
    return null;
  }
}

export async function GET(_req, { params }) {
  const { id } = params;
  if (!id) {
    return NextResponse.json({ success: false, error: "Vehicle id is required." }, { status: 400 });
  }

  try {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
    });

    if (!vehicle) {
      return NextResponse.json({ success: false, error: "Vehicle not found." }, { status: 404 });
    }
    const uploads = (await readTruckUploads(id)) || { vehiclePhotos: [], registrationImages: [] };
    return NextResponse.json({ success: true, vehicle, uploads }, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch vehicle:", error);
    return NextResponse.json({ success: false, error: "Unable to fetch vehicle." }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  const { id } = params;
  if (!id) {
    return NextResponse.json({ success: false, error: "Vehicle id is required." }, { status: 400 });
  }

  let payload;
  try {
    payload = await req.json();
  } catch (error) {
    return NextResponse.json({ success: false, error: "Invalid JSON payload." }, { status: 400 });
  }

  const updates = {};

  for (const field of allowedUpdateFields) {
    if (Object.prototype.hasOwnProperty.call(payload, field)) {
      updates[field] = payload[field];
    }
  }

  if (updates.year !== undefined) {
    const parsedYear = parseInt(updates.year, 10);
    if (!Number.isFinite(parsedYear)) {
      return NextResponse.json({ success: false, error: "Year must be a valid number." }, { status: 400 });
    }
    updates.year = parsedYear;
  }

  if (updates.tankCapacityLiters !== undefined) {
    updates.tankCapacityLiters = parseFloatOrNull(updates.tankCapacityLiters);
  }

  if (updates.initialOdometerKm !== undefined) {
    updates.initialOdometerKm = parseFloatOrNull(updates.initialOdometerKm);
  }

  if (updates.purchaseDate !== undefined) {
    updates.purchaseDate = parseDate(updates.purchaseDate);
  }

  if (updates.registrationExpiry !== undefined) {
    updates.registrationExpiry = parseDate(updates.registrationExpiry);
  }

  if (updates.insuranceExpiry !== undefined) {
    updates.insuranceExpiry = parseDate(updates.insuranceExpiry);
  }

  if (!Object.keys(updates).length) {
    return NextResponse.json({ success: false, error: "No valid fields provided for update." }, { status: 400 });
  }

  try {
    const updatedVehicle = await prisma.vehicle.update({
      where: { id },
      data: updates,
    });
    const uploads = (await readTruckUploads(id)) || { vehiclePhotos: [], registrationImages: [] };
    return NextResponse.json({ success: true, vehicle: updatedVehicle, uploads }, { status: 200 });
  } catch (error) {
    console.error("Failed to update vehicle:", error);
    return NextResponse.json({ success: false, error: "Unable to update vehicle." }, { status: 500 });
  }
}
