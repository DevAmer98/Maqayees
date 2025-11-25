import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const allowedRoles = new Set(["admin", "manager", "project_manager", "supervisor", "driver", "maintenance"]);

export async function GET(req) {
  const { searchParams } = new URL(req.url);

  const role = searchParams.get("role")?.trim().toLowerCase();
  const query = searchParams.get("q")?.trim();
  const page = Math.max(parseInt(searchParams.get("page") ?? "1", 10), 1);
  const pageSize = Math.min(Math.max(parseInt(searchParams.get("pageSize") ?? "25", 10), 1), 100);

  const where = {};

  if (role) {
    if (!allowedRoles.has(role)) {
      return NextResponse.json({ success: false, error: "Invalid role filter." }, { status: 400 });
    }
    where.role = role;
  }

  if (query) {
    where.OR = [
      { name: { contains: query, mode: "insensitive" } },
      { email: { contains: query, mode: "insensitive" } },
      { phone: { contains: query, mode: "insensitive" } },
      { iqama: { contains: query, mode: "insensitive" } },
      { passport: { contains: query, mode: "insensitive" } },
    ];
  }

  try {
    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
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
      }),
    ]);

    return NextResponse.json({
      success: true,
      users,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.max(Math.ceil(total / pageSize), 1),
      },
    });
  } catch (error) {
    console.error("Failed to load users", error);
    return NextResponse.json({ success: false, error: "Failed to load users." }, { status: 500 });
  }
}
