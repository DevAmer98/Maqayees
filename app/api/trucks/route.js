import { NextResponse } from "next/server";
import path from "path";
import os from "os";
import { promises as fs } from "fs";
import { Client } from "basic-ftp";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

const requiredEnvKeys = ["SYNOLOGY_HOST", "SYNOLOGY_PORT", "SYNOLOGY_USER", "SYNOLOGY_PASSWORD", "SYNOLOGY_TRUCK_PATH"];
const hasSynologyConfig = () => requiredEnvKeys.every((key) => !!process.env[key]);

const localUploadRoot = path.join(process.cwd(), "public", "uploads", "trucks");
const dataDir = path.join(process.cwd(), "data");
const dataFilePath = path.join(dataDir, "trucks.json");

const requiredVehicleFields = ["plateNumber", "brand", "model", "year", "color"];

const parseDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const parseIntOrNull = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
};

const parseFloatOrNull = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const parsed = parseFloat(value);
  return Number.isNaN(parsed) ? null : parsed;
};

async function uploadToSynology(localFilePath, remoteFilePath) {
  const client = new Client();
  client.ftp.verbose = false;

  await client.access({
    host: process.env.SYNOLOGY_HOST,
    port: Number(process.env.SYNOLOGY_PORT),
    user: process.env.SYNOLOGY_USER,
    password: process.env.SYNOLOGY_PASSWORD,
    secure: false,
  });

  const normalizedPath = remoteFilePath.startsWith("/") ? remoteFilePath : `/${remoteFilePath}`;
  const remoteDir = path.posix.dirname(normalizedPath);
  await client.ensureDir(remoteDir);
  await client.uploadFrom(localFilePath, normalizedPath);
  await client.close();
  return normalizedPath;
}

async function saveFileToTemp(file, tempDir, prefix) {
  const buffer = Buffer.from(await file.arrayBuffer());
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const fileName = `${prefix}-${Date.now()}-${sanitizedName || "upload"}`;
  const tempPath = path.join(tempDir, fileName);
  await fs.writeFile(tempPath, buffer);
  return tempPath;
}

function normalizeKey(key) {
  if (!key) return key;
  if (key.startsWith("vehiclePhotos")) return "vehiclePhotos";
  if (key.startsWith("registrationImages")) return "registrationImages";
  return key;
}

async function copyToLocalUploads(tempPath, relativePath) {
  const destination = path.join(localUploadRoot, relativePath);
  await fs.mkdir(path.dirname(destination), { recursive: true });
  await fs.copyFile(tempPath, destination);
  return `/uploads/trucks/${relativePath.replace(/\\/g, "/")}`;
}

async function persistTruckBackup(record) {
  await fs.mkdir(dataDir, { recursive: true });
  let existing = [];
  try {
    const raw = await fs.readFile(dataFilePath, "utf-8");
    existing = JSON.parse(raw);
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }
  existing.unshift(record);
  await fs.writeFile(dataFilePath, JSON.stringify(existing, null, 2), "utf-8");
}

async function persistVehicleToDatabase(vehicleData, uploads) {
  const plateNumber = (vehicleData.plateNumber || "").trim();
  const brand = (vehicleData.brand || "").trim();
  const model = (vehicleData.model || "").trim();
  const color = (vehicleData.color || "").trim();

  if (!plateNumber || !brand || !model || !color) {
    throw new Error("Missing required vehicle fields.");
  }

  const yearValue = parseIntOrNull(vehicleData.year);
  if (!yearValue) {
    throw new Error("Year must be a valid number.");
  }

  const payload = {
    plateNumber,
    brand,
    model,
    year: yearValue,
    color,
    registrationExpiry: parseDate(vehicleData.registrationExpiry),
    insuranceExpiry: parseDate(vehicleData.insuranceExpiry),
    equipmentType: vehicleData.equipmentType || null,
    tankCapacityLiters: parseFloatOrNull(vehicleData.tankCapacityLiters),
    purchaseDate: parseDate(vehicleData.purchaseDate),
    initialOdometerKm: parseFloatOrNull(vehicleData.initialOdometerKm),
    fuelType: vehicleData.fuelType || null,
    serialNumber: vehicleData.serialNumber || null,
    chassisNumber: vehicleData.chassisNumber || null,
    projectName: vehicleData.project || vehicleData.projectName || null,
    driverName: vehicleData.driver || vehicleData.driverName || null,
    photo: null,
  };

  const primaryPhoto = uploads.vehiclePhotos[0];
  if (primaryPhoto) {
    payload.photo = primaryPhoto.remotePath || primaryPhoto.localPath;
  }

  return prisma.vehicle.create({
    data: payload,
  });
}

export async function POST(req) {
  const cleanupPaths = [];
  let tempDir;

  try {
    const formData = await req.formData();
    const vehicleData = {};
    const fileBuckets = {
      vehiclePhotos: [],
      registrationImages: [],
    };

    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        const normalized = normalizeKey(key);
        if (fileBuckets[normalized]) {
          fileBuckets[normalized].push(value);
        }
      } else {
        vehicleData[key] = value;
      }
    }

    for (const field of requiredVehicleFields) {
      if (!vehicleData[field]) {
        return NextResponse.json({ success: false, error: `${field} is required.` }, { status: 400 });
      }
    }

    const parsedYear = parseIntOrNull(vehicleData.year);
    if (!parsedYear) {
      return NextResponse.json({ success: false, error: "Year must be a valid number." }, { status: 400 });
    }

    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "maq-truck-"));
    const plateSafe = (vehicleData.plateNumber || "vehicle").replace(/[^a-zA-Z0-9_-]/g, "_");
    const timestamp = Date.now();
    const baseSlug = `${plateSafe}_${timestamp}`;
    const synologyBase = hasSynologyConfig()
      ? `${process.env.SYNOLOGY_TRUCK_PATH.replace(/\/$/, "")}/${baseSlug}`
      : null;

    const uploadResults = { vehiclePhotos: [], registrationImages: [] };

    for (const category of Object.keys(fileBuckets)) {
      const files = fileBuckets[category];
      for (let index = 0; index < files.length; index += 1) {
        const file = files[index];
        const tempPath = await saveFileToTemp(file, tempDir, category);
        cleanupPaths.push(tempPath);
        const ext = path.extname(file.name) || ".jpg";
        const fileName = `${category}-${index + 1}${ext}`;
        const localRelativePath = `${baseSlug}/${category}/${fileName}`;
        const remotePathCandidate = synologyBase ? `${synologyBase}/${category}/${fileName}` : null;

        let storedPath;
        let location = "local";

        if (remotePathCandidate) {
          try {
            storedPath = await uploadToSynology(tempPath, remotePathCandidate);
            location = "synology";
          } catch (error) {
            console.error("Synology upload failed, falling back to local storage:", error);
          }
        }

        if (!storedPath) {
          storedPath = await copyToLocalUploads(tempPath, localRelativePath);
          location = location === "synology" ? "synology-fallback" : "local";
        }

        uploadResults[category].push({
          originalName: file.name,
          remotePath: storedPath,
          localPath: !remotePathCandidate || location !== "synology" ? storedPath : null,
          location,
        });
      }
    }

    const record = {
      id: `truck-${timestamp}`,
      createdAt: new Date().toISOString(),
      ...vehicleData,
      uploads: uploadResults,
    };

    const dbVehicle = await persistVehicleToDatabase(vehicleData, uploadResults);
    await persistTruckBackup({ ...record, databaseId: dbVehicle.id });

    return NextResponse.json({ success: true, vehicle: dbVehicle, uploads: uploadResults }, { status: 200 });
  } catch (error) {
    console.error("Truck upload failed:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  } finally {
    await Promise.all(
      cleanupPaths.map((filePath) =>
        fs
          .unlink(filePath)
          .catch(() => {})
      )
    );
    if (tempDir) {
      await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
    }
  }
}
