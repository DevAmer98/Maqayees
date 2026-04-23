import { NextResponse } from "next/server";
import path from "path";
import os from "os";
import { promises as fs } from "fs";
import { uploadToSynology, hasSynologyConfig as hasSynologyBase } from "@/lib/synology";
import prisma from "@/lib/prisma";

const hasSynologyConfig = () => hasSynologyBase(["SYNOLOGY_TRUCK_PATH"]);

const localUploadRoot = path.join(process.cwd(), "public", "uploads", "trucks");


async function saveFileToTemp(file, tempDir, prefix) {
  const buffer = Buffer.from(await file.arrayBuffer());
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const fileName = `${prefix}-${Date.now()}-${sanitizedName || "upload"}`;
  const tempPath = path.join(tempDir, fileName);
  await fs.writeFile(tempPath, buffer);
  return tempPath;
}

async function copyToLocalUploads(tempPath, relativePath) {
  const destination = path.join(localUploadRoot, relativePath);
  await fs.mkdir(path.dirname(destination), { recursive: true });
  await fs.copyFile(tempPath, destination);
  return `/uploads/trucks/${relativePath.replace(/\\/g, "/")}`;
}

export async function POST(req, { params }) {
  const { id } = params;

  if (!id) {
    return NextResponse.json({ success: false, error: "Vehicle id is required." }, { status: 400 });
  }

  const vehicle = await prisma.vehicle.findUnique({ where: { id } });
  if (!vehicle) {
    return NextResponse.json({ success: false, error: "Vehicle not found." }, { status: 404 });
  }

  const formData = await req.formData();
  const file = formData.get("photo");

  if (!(file instanceof File)) {
    return NextResponse.json({ success: false, error: "A valid photo file is required." }, { status: 400 });
  }

  const cleanupPaths = [];
  let tempDir;

  try {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "maq-truck-photo-"));
    const tempPath = await saveFileToTemp(file, tempDir, "vehiclePhoto");
    cleanupPaths.push(tempPath);

    const timestamp = Date.now();
    const plateSafe = (vehicle.plateNumber || "vehicle").replace(/[^a-zA-Z0-9_-]/g, "_");
    const baseSlug = `${plateSafe}_${timestamp}`;
    const fileExt = path.extname(file.name) || ".jpg";
    const fileName = `vehiclePhoto-${timestamp}${fileExt}`;
    const localRelativePath = `${baseSlug}/vehiclePhotos/${fileName}`;
    const rawDriverName = vehicle.driverName || "no-driver";
    const driverFolder = rawDriverName.trim().replace(/[^a-zA-Z0-9_-]/g, "_") || "no-driver";
    const synologyPathBase = process.env.SYNOLOGY_TRUCK_PATH ? `${process.env.SYNOLOGY_TRUCK_PATH.replace(/\/$/, "")}/${driverFolder}/trucks/${baseSlug}/vehiclePhotos` : null;
    const remotePathCandidate = hasSynologyConfig() ? `${synologyPathBase}/${fileName}` : null;

    let storedPath;

    if (remotePathCandidate) {
      try {
        storedPath = await uploadToSynology(tempPath, remotePathCandidate);
      } catch (error) {
        console.error("Synology upload failed for photo update, falling back to local storage:", error);
      }
    }

    if (!storedPath) {
      storedPath = await copyToLocalUploads(tempPath, localRelativePath);
    }

    const updatedVehicle = await prisma.vehicle.update({
      where: { id },
      data: { photo: storedPath },
    });

    return NextResponse.json(
      {
        success: true,
        vehicle: updatedVehicle,
        photo: storedPath,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to update vehicle photo:", error);
    return NextResponse.json({ success: false, error: "Unable to update vehicle photo." }, { status: 500 });
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
