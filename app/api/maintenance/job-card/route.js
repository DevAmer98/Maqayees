import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

function sanitizeSnapshot(snapshot) {
  if (!snapshot || typeof snapshot !== "object") return null;
  const info = snapshot.info && typeof snapshot.info === "object" ? snapshot.info : {};
  const repairs = Array.isArray(snapshot.repairs) ? snapshot.repairs : [];
  return { info, repairs };
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const requestId = (searchParams.get("requestId") || "").trim();

    if (!requestId) {
      return NextResponse.json({ success: false, error: "requestId is required." }, { status: 400 });
    }

    const record = await prisma.maintenanceJobCardSnapshot.findUnique({
      where: { requestId },
      select: {
        requestId: true,
        info: true,
        repairs: true,
        updatedAt: true,
      },
    });

    if (!record) {
      return NextResponse.json({ success: true, snapshot: null }, { status: 200 });
    }

    const snapshot = sanitizeSnapshot(record);
    return NextResponse.json(
      {
        success: true,
        snapshot: {
          requestId: record.requestId,
          info: snapshot.info,
          repairs: snapshot.repairs,
          updatedAt: record.updatedAt,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to load job card snapshot:", error);
    return NextResponse.json({ success: false, error: "Failed to load job card snapshot." }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const requestId = (body?.requestId || "").trim();

    if (!requestId) {
      return NextResponse.json({ success: false, error: "requestId is required." }, { status: 400 });
    }

    if (!body?.snapshot || typeof body.snapshot !== "object") {
      return NextResponse.json({ success: false, error: "snapshot object is required." }, { status: 400 });
    }

    const snapshot = sanitizeSnapshot(body.snapshot);

    const saved = await prisma.maintenanceJobCardSnapshot.upsert({
      where: { requestId },
      create: {
        requestId,
        info: snapshot.info,
        repairs: snapshot.repairs,
      },
      update: {
        info: snapshot.info,
        repairs: snapshot.repairs,
      },
      select: {
        requestId: true,
        info: true,
        repairs: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        snapshot: {
          requestId: saved.requestId,
          info: saved.info,
          repairs: saved.repairs,
          updatedAt: saved.updatedAt,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to save job card snapshot:", error);
    return NextResponse.json({ success: false, error: "Failed to save job card snapshot." }, { status: 500 });
  }
}
