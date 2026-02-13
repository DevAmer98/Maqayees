import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const runtime = "nodejs";

function buildChecklistId(driverId, shiftId, vehiclePlate) {
  const shiftKey = (shiftId || "").trim();
  const plateKey = (vehiclePlate || "").trim().toLowerCase();
  const scopedKey = shiftKey || (plateKey ? `plate:${plateKey}` : "default");
  return `chk:${driverId}:${scopedKey}`;
}

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    const driverId = session?.user?.id ? String(session.user.id) : "";
    if (!driverId) {
      return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const shiftId = (searchParams.get("shiftId") || "").trim();
    const vehiclePlate = (searchParams.get("vehiclePlate") || "").trim();

    let checklist = null;

    if (shiftId) {
      checklist = await prisma.driverChecklist.findFirst({
        where: { driverId, shiftId },
        orderBy: { updatedAt: "desc" },
      });
    }

    if (!checklist && vehiclePlate) {
      checklist = await prisma.driverChecklist.findFirst({
        where: {
          driverId,
          vehiclePlate: {
            equals: vehiclePlate,
            mode: "insensitive",
          },
        },
        orderBy: { updatedAt: "desc" },
      });
    }

    if (!checklist) {
      checklist = await prisma.driverChecklist.findFirst({
        where: { driverId },
        orderBy: { updatedAt: "desc" },
      });
    }

    return NextResponse.json({
      success: true,
      checklist: checklist
        ? {
            id: checklist.id,
            driverId: checklist.driverId,
            vehiclePlate: checklist.vehiclePlate,
            shiftId: checklist.shiftId,
            record: checklist.record,
            updatedAt: checklist.updatedAt,
          }
        : null,
    });
  } catch (error) {
    console.error("Failed to load driver checklist:", error);
    return NextResponse.json({ success: false, error: "Failed to load checklist." }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    const driverId = session?.user?.id ? String(session.user.id) : "";
    if (!driverId) {
      return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 401 });
    }

    const body = await request.json();
    const shiftId = String(body?.shiftId || "").trim();
    const vehiclePlate = String(body?.vehiclePlate || "").trim();
    const checklistInfo = body?.checklistInfo && typeof body.checklistInfo === "object" ? body.checklistInfo : null;
    const walkaroundChecks = body?.walkaroundChecks && typeof body.walkaroundChecks === "object" ? body.walkaroundChecks : null;

    if (!checklistInfo || !walkaroundChecks) {
      return NextResponse.json({ success: false, error: "checklistInfo and walkaroundChecks are required." }, { status: 400 });
    }

    const id = buildChecklistId(driverId, shiftId, vehiclePlate || checklistInfo.plateNo);

    const saved = await prisma.driverChecklist.upsert({
      where: { id },
      create: {
        id,
        driverId,
        vehiclePlate: vehiclePlate || checklistInfo.plateNo || null,
        shiftId: shiftId || null,
        record: {
          checklistInfo,
          walkaroundChecks,
          updatedAt: new Date().toISOString(),
        },
      },
      update: {
        vehiclePlate: vehiclePlate || checklistInfo.plateNo || null,
        shiftId: shiftId || null,
        record: {
          checklistInfo,
          walkaroundChecks,
          updatedAt: new Date().toISOString(),
        },
      },
      select: {
        id: true,
        driverId: true,
        vehiclePlate: true,
        shiftId: true,
        record: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ success: true, checklist: saved }, { status: 200 });
  } catch (error) {
    console.error("Failed to save driver checklist:", error);
    return NextResponse.json({ success: false, error: "Failed to save checklist." }, { status: 500 });
  }
}
