import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import path from "path";
import { promises as fs } from "fs";
import { randomUUID } from "crypto";

const allowedRoles = new Set(["admin", "manager", "project_manager", "supervisor", "driver", "maintenance"]);
const licenseUploadRoot = path.join(process.cwd(), "public", "uploads", "users", "licenses");
const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"]);
const MAX_LICENSE_BYTES = 5 * 1024 * 1024; // 5MB

const sanitize = (value) => {
  if (value === null || value === undefined) return null;
  const trimmed = String(value).trim();
  return trimmed.length ? trimmed : null;
};

const normalizePhone = (value) => {
  const cleaned = sanitize(value);
  if (!cleaned) return null;
  return cleaned.replace(/[()\s-]/g, "");
};

const isValidPhone = (value) => /^\+?[1-9]\d{7,14}$/.test(value);

const generateTempPassword = () => {
  const random = Math.random().toString(36).slice(-6);
  const timestamp = Date.now().toString(36).slice(-4);
  return `Maq@${random}${timestamp}`;
};

async function persistLicensePhoto(file) {
  if (!file || !(file instanceof File) || !file.size) return null;
  if (file.size > MAX_LICENSE_BYTES) {
    throw new Error("Driving license photo must be smaller than 5MB.");
  }
  if (!allowedMimeTypes.has(file.type)) {
    throw new Error("Driving license photo must be JPEG, PNG, or WEBP.");
  }
  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = path.extname(file.name || "") || ".jpg";
  const folder = randomUUID();
  const destinationDir = path.join(licenseUploadRoot, folder);
  await fs.mkdir(destinationDir, { recursive: true });
  const fileName = `license${ext}`;
  const destinationPath = path.join(destinationDir, fileName);
  await fs.writeFile(destinationPath, buffer);
  return `/uploads/users/licenses/${folder}/${fileName}`;
}

export async function POST(req) {
  const contentType = req.headers.get("content-type") || "";
  let payload = {};
  let licenseFile = null;

  try {
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          if (key === "drivingLicensePhoto") {
            licenseFile = value;
          }
        } else {
          payload[key] = value;
        }
      }
    } else {
      payload = await req.json();
    }
  } catch (error) {
    return NextResponse.json({ success: false, error: "Invalid request payload." }, { status: 400 });
  }

  const name = sanitize(payload?.name);
  const email = sanitize(payload?.email)?.toLowerCase();
  const role = sanitize(payload?.role);

  if (!name || !email || !role) {
    return NextResponse.json({ success: false, error: "name, email, and role are required." }, { status: 400 });
  }

  if (!allowedRoles.has(role)) {
    return NextResponse.json({ success: false, error: "Role is not recognized." }, { status: 400 });
  }

  const iqama = sanitize(payload?.iqama);
  const passport = sanitize(payload?.passport);
  const phone = normalizePhone(payload?.phone);
  let drivingLicensePhoto = sanitize(payload?.drivingLicensePhoto);

  if (phone && !isValidPhone(phone)) {
    return NextResponse.json(
      { success: false, error: "Phone number is invalid. Use an international format like +966512345678." },
      { status: 400 }
    );
  }

  if (licenseFile) {
    try {
      drivingLicensePhoto = await persistLicensePhoto(licenseFile);
    } catch (error) {
      return NextResponse.json({ success: false, error: error.message || "Failed to store driving license photo." }, { status: 400 });
    }
  }

  const temporaryPassword = generateTempPassword();
  const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

  try {
    if (iqama) {
      const existingIqamaUser = await prisma.user.findFirst({
        where: { iqama },
        select: { id: true },
      });

      if (existingIqamaUser) {
        return NextResponse.json(
          { success: false, error: "A user with this Iqama / ID already exists." },
          { status: 409 }
        );
      }
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        role,
        password: hashedPassword,
        phone,
        iqama,
        passport,
        drivingLicensePhoto,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        iqama: true,
        passport: true,
        drivingLicensePhoto: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        user,
        temporaryPassword,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      const target = Array.isArray(error.meta?.target) ? error.meta.target : [];
      if (target.includes("iqama")) {
        return NextResponse.json(
          { success: false, error: "A user with this Iqama / ID already exists." },
          { status: 409 }
        );
      }
      return NextResponse.json({ success: false, error: "A user with this email already exists." }, { status: 409 });
    }
    console.error("Failed to create user:", error);
    return NextResponse.json({ success: false, error: "Failed to create user." }, { status: 500 });
  }
}
