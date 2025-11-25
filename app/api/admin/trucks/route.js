import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  try {
    const vehicles = await prisma.vehicle.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        plateNumber: true,
        brand: true,
        model: true,
        color: true,
        year: true,
        status: true,
        projectName: true,
        driverName: true,
        equipmentType: true,
        photo: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        vehicles,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to load trucks:", error);
    return NextResponse.json({ success: false, error: "Unable to load trucks." }, { status: 500 });
  }
}
