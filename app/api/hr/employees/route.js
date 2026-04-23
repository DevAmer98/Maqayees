import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const employees = await prisma.employee.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { attendances: true } } },
  });
  return NextResponse.json({ success: true, employees });
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, jobTitle, nationality, phone, iqama, projectName, supervisorId, startDate } = body;

    if (!name?.trim()) {
      return NextResponse.json({ success: false, error: "Employee name is required." }, { status: 400 });
    }

    const employee = await prisma.employee.create({
      data: {
        name: name.trim(),
        jobTitle: jobTitle || null,
        nationality: nationality || null,
        phone: phone || null,
        iqama: iqama || null,
        projectName: projectName || null,
        supervisorId: supervisorId || null,
        startDate: startDate ? new Date(startDate) : null,
      },
    });

    return NextResponse.json({ success: true, employee }, { status: 201 });
  } catch (error) {
    console.error("Failed to create employee:", error);
    return NextResponse.json({ success: false, error: "Failed to create employee." }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const body = await req.json();
    const { id, status } = body;
    if (!id) return NextResponse.json({ success: false, error: "id is required." }, { status: 400 });

    const employee = await prisma.employee.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ success: true, employee });
  } catch (error) {
    console.error("Failed to update employee:", error);
    return NextResponse.json({ success: false, error: "Failed to update employee." }, { status: 500 });
  }
}
