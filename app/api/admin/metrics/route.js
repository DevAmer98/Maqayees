import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

const trackedRoles = ["admin", "manager", "project_manager", "supervisor", "driver", "maintenance"];

export async function GET() {
  try {
    const [userGroups, vehicleCount, projectCount] = await Promise.all([
      prisma.user.groupBy({
        by: ["role"],
        _count: { _all: true },
      }),
      prisma.vehicle.count(),
      prisma.project.count(),
    ]);

    const roleCounts = trackedRoles.reduce((acc, role) => {
      acc[role] = 0;
      return acc;
    }, {});

    userGroups.forEach((group) => {
      if (roleCounts[group.role] !== undefined) {
        roleCounts[group.role] = group._count._all;
      }
    });

    const personnelTotal = roleCounts.manager + roleCounts.project_manager + roleCounts.supervisor + roleCounts.driver;

    return NextResponse.json(
      {
        success: true,
        data: {
          users: roleCounts,
          totals: {
            vehicles: vehicleCount,
            projects: projectCount,
            personnel: personnelTotal,
          },
          refreshedAt: new Date().toISOString(),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to load admin metrics:", error);
    return NextResponse.json({ success: false, error: "Unable to load metrics." }, { status: 500 });
  }
}
