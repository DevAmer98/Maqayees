import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const requests = await prisma.procurementRequest.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ success: true, requests });
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { title, description, quantity, unit, requestedBy, projectName, estimatedCost, notes, followUpDate } = body;

    if (!title?.trim()) {
      return NextResponse.json({ success: false, error: "Title is required." }, { status: 400 });
    }

    const record = await prisma.procurementRequest.create({
      data: {
        title: title.trim(),
        description: description || null,
        quantity: quantity ? parseFloat(quantity) : null,
        unit: unit || null,
        requestedBy: requestedBy || null,
        projectName: projectName || null,
        estimatedCost: estimatedCost ? parseFloat(estimatedCost) : null,
        notes: notes || null,
        followUpDate: followUpDate ? new Date(followUpDate) : null,
      },
    });

    return NextResponse.json({ success: true, record }, { status: 201 });
  } catch (error) {
    console.error("Procurement create failed:", error);
    return NextResponse.json({ success: false, error: "Failed to create procurement request." }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const body = await req.json();
    const { id, status, notes, followUpDate } = body;
    if (!id) return NextResponse.json({ success: false, error: "id is required." }, { status: 400 });

    const record = await prisma.procurementRequest.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(notes !== undefined && { notes }),
        ...(followUpDate !== undefined && { followUpDate: followUpDate ? new Date(followUpDate) : null }),
      },
    });

    return NextResponse.json({ success: true, record });
  } catch (error) {
    console.error("Procurement update failed:", error);
    return NextResponse.json({ success: false, error: "Failed to update request." }, { status: 500 });
  }
}
