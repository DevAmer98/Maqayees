import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

import ManagerDashboard from "@/components/dashboards/ManagerDashboard";
import ProjectManagerDashboard from "@/components/dashboards/ProjectManagerDashboard";
import SupervisorDashboard from "@/components/dashboards/SupervisorDashboard";
import DriverDashboard from "@/components/dashboards/DriverDashboard";
import AdminDashboard from "@/components/dashboards/AdminDashboard";
import MaintenanceDashboard from "@/components/dashboards/MaintenanceDashboard";

export default async function DashboardPage() {
  // Get current session
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const role = session.user.role;

  // Dynamically render dashboard by role
  switch (role) {
    case "manager":
      return <ManagerDashboard />;

    case "project_manager":
      return <ProjectManagerDashboard />;

    case "supervisor":
      return <SupervisorDashboard />;

        case "admin":
      return <AdminDashboard />;

    case "driver":
      return <DriverDashboard />;

       case "maintenance":
      return <MaintenanceDashboard />;

    default:
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <p className="text-gray-700 text-lg">
            Unknown role: <span className="font-semibold">{role}</span>
          </p>
        </div>
      );
  }
}
