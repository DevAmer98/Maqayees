import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  const employeeId = searchParams.get("employeeId");

  const where = {};
  if (date) where.date = new Date(date);
  if (employeeId) where.employeeId = employeeId;

  const records = await prisma.attendance.findMany({
    where,
    include: { employee: { select: { id: true, name: true, jobTitle: true } } },
    orderBy: { date: "desc" },
    take: 200,
  });

  return NextResponse.json({ success: true, records });
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { records } = body;

    if (!Array.isArray(records) || records.length === 0) {
      return NextResponse.json({ success: false, error: "records array is required." }, { status: 400 });
    }

    const date = new Date(records[0].date);

    // Upsert each attendance record (one per employee per day)
    const results = await Promise.all(
      records.map(({ employeeId, status, notes }) =>
        prisma.attendance.upsert({
          where: {
            // Use a compound unique if you add @@unique([employeeId, date]) or fallback to create
            id: `${employeeId}_${date.toISOString().slice(0, 10)}`,
          },
          create: {
            id: `${employeeId}_${date.toISOString().slice(0, 10)}`,
            employeeId,
            date,
            status: status || "present",
            notes: notes || null,
          },
          update: {
            status: status || "present",
            notes: notes || null,
          },
        })
      )
    );

    return NextResponse.json({ success: true, count: results.length }, { status: 200 });
  } catch (error) {
    console.error("Attendance save failed:", error);
    return NextResponse.json({ success: false, error: "Failed to save attendance." }, { status: 500 });
  }
}
