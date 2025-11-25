//app/dashboard/%28role%29/%28pm%29/page.jsx
"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";


  {/*{ key: "addSupervisor", label: "Add Supervisor", icon: "🧑‍💼" },
 { key: "addDriver", label: "Add Driver", icon: "🚗" },
  { key: "addTruck", label: "Add Truck", icon: "🚛" },*/}

export default function ProjectManagerDashboard() {
  const [activeTab, setActiveTab] = useState("monitor");
  const [filterStatus, setFilterStatus] = useState("all");
const [sortOption, setSortOption] = useState("nameAsc");
const router = useRouter();


  const handleStatusChange = (projectId, newStatus) => {
  setProjects((prev) =>
    prev.map((p) => {
      if (p.id === projectId) {
        let progress = p.progress;
        if (newStatus === "Completed") progress = 100;
        if (newStatus === "Not Started") progress = 0;
        return { ...p, status: newStatus, progress };
      }
      return p;
    })
  );
};


// 📆 Calculate remaining days until end date
const calculateRemainingDays = (endDate) => {
  if (!endDate) return "";
  const today = new Date();
  const end = new Date(endDate);
  const diffTime = end - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return "✅ Completed";
  if (diffDays === 0) return "⏰ Ends today";
  return `${diffDays} day${diffDays > 1 ? "s" : ""} left`;
};


const calculateDuration = (start, end) => {
  if (!start || !end) return "";
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffMonths =
    (endDate.getFullYear() - startDate.getFullYear()) * 12 +
    (endDate.getMonth() - startDate.getMonth());
  return diffMonths > 0 ? `${diffMonths} month${diffMonths > 1 ? "s" : ""}` : "Invalid dates";
};



  const pm = {
    name: "Omar Project Manager",
    email: "pm@maqayees.com",
    phone: "0557654321",
    role: "Project Manager",
  };

 const navItems = [
  { key: "monitor", label: "PM Monitor", icon: "📊" },
  { key: "projects", label: "Projects", icon: "🏗️" },
  { key: "assignSupervisor", label: "Assign Supervisor", icon: "🔗" },
  { key: "assignDriver", label: "Assign Drivers (Project)", icon: "🎯" },
  { key: "assignTruck", label: "Assign Trucks (Project)", icon: "🚚" },
  { key: "assignDriverTruck", label: "Assign Drivers (Fleet)", icon: "🔗" },
  { key: "dailyReport", label: "Daily Report", icon: "⛽" },
  { key: "maintenance", label: "Maintenance", icon: "🛠️" },
  { key: "profile", label: "Profile", icon: "👤" },
];

const [trucks] = useState([
  { id: "t1", plate: "ABC-1234", model: "Hilux", projectId: "p1" },
  { id: "t2", plate: "XYZ-5678", model: "Isuzu NPR", projectId: "p2" },
  { id: "t3", plate: "LMN-9101", model: "Hino 300", projectId: "p3" },
]);


const [projects, setProjects] = useState([
  {
    id: "p1",
    name: "Project A",
    supervisor: "Ali Supervisor",
    status: "Active",
    progress: 78,
    startDate: "2025-01-10",
    endDate: "2025-06-10",
    duration: "6 months",
    city: "Riyadh",
    neighborhood: "Al Olaya",
    fleet: { total: 18, active: 14, maintenance: 2, standby: 2 },
    driversCount: 22,
    fuel: {
      weeklyLiters: 3200,
      targetLiters: 3300,
      variance: -3,
      efficiency: 2.9,
      costSar: 18400,
    },
    distanceCoveredKm: 6800,
    alerts: ["Dump truck 21 due for service", "Fuel usage -3% vs plan"],
  },
  {
    id: "p2",
    name: "Project B",
    supervisor: "Sara Supervisor",
    status: "Pending",
    progress: 52,
    startDate: "2025-03-01",
    endDate: "2025-09-01",
    duration: "6 months",
    city: "Jeddah",
    neighborhood: "Al Rawdah",
    fleet: { total: 14, active: 10, maintenance: 1, standby: 3 },
    driversCount: 17,
    fuel: {
      weeklyLiters: 2700,
      targetLiters: 2600,
      variance: 4,
      efficiency: 2.5,
      costSar: 16200,
    },
    distanceCoveredKm: 5200,
    alerts: ["Fuel variance +4% above plan"],
  },
  {
    id: "p3",
    name: "Project C",
    supervisor: "Unassigned",
    status: "Not Started",
    progress: 12,
    startDate: "2025-05-15",
    endDate: "2025-12-15",
    duration: "7 months",
    city: "Dammam",
    neighborhood: "Al Faisaliah",
    fleet: { total: 9, active: 6, maintenance: 1, standby: 2 },
    driversCount: 11,
    fuel: {
      weeklyLiters: 1800,
      targetLiters: 1900,
      variance: -2,
      efficiency: 3.1,
      costSar: 10100,
    },
    distanceCoveredKm: 3100,
    alerts: ["Awaiting supervisor assignment"],
  },
]);

const totalProjects = projects.length;
const activeProjects = projects.filter((project) => project.status === "Active").length;
const totalFleet = projects.reduce((sum, project) => sum + (project.fleet?.total || 0), 0);
const availableFleet = projects.reduce((sum, project) => sum + (project.fleet?.active || 0), 0);
const weeklyFuelTotal = projects.reduce((sum, project) => sum + (project.fuel?.weeklyLiters || 0), 0);
const averageEfficiency =
  projects.length > 0
    ? (projects.reduce((sum, project) => sum + (project.fuel?.efficiency || 0), 0) / projects.length).toFixed(2)
    : "0.0";

const pmMonitorStats = [
  {
    label: "Projects Live",
    value: totalProjects,
    subLabel: `${activeProjects} active`,
  },
  {
    label: "Fleet Ready",
    value: availableFleet,
    subLabel: `${totalFleet} total units`,
  },
  {
    label: "Weekly Fuel",
    value: `${weeklyFuelTotal.toLocaleString()} L`,
    subLabel: "All running projects",
  },
  {
    label: "Avg Efficiency",
    value: `${averageEfficiency} km/L`,
    subLabel: "Rolling 7 days",
  },
];

const fuelConsumptionSeries = projects.map((project) => ({
  name: project.name,
  actual: project.fuel?.weeklyLiters || 0,
  target: project.fuel?.targetLiters || 0,
}));

const fleetAvailabilityData = projects.map((project) => ({
  name: project.name,
  Active: project.fleet?.active || 0,
  Maintenance: project.fleet?.maintenance || 0,
  Standby: project.fleet?.standby || 0,
}));

const projectAlerts = projects.flatMap((project) =>
  (project.alerts || []).map((alert) => ({
    project: project.name,
    detail: alert,
    status: project.status,
  }))
);

const [newProject, setNewProject] = useState({ name: "", status: "Pending" });
const [projectMsg, setProjectMsg] = useState("");


const [supervisors] = useState([
  { id: "s1", name: "Ali Supervisor" },
  { id: "s2", name: "Sara Supervisor" },
]);

const [drivers] = useState([
  { id: "d1", name: "Ahmed Driver" },
  { id: "d2", name: "Omar Driver" },
]);



const [assignment, setAssignment] = useState({
  supervisor: "",
  drivers: [],
  trucks: [],
  project: "",
  driver: "",
  truck: "",
});

const [message, setMessage] = useState("");
const [supervisorSelectedTruck, setSupervisorSelectedTruck] = useState("all");
const [driverTruckAssignment, setDriverTruckAssignment] = useState({
  driver: "",
  truck: "",
});
const [reportForm, setReportForm] = useState({
  projectId: "",
  truckId: "",
  currentOdometer: "",
  litersFilled: "",
  fuelCost: "",
  notes: "",
  photo: null,
});
const [reportPreviewUrl, setReportPreviewUrl] = useState(null);
const [lastOdometerByTruck, setLastOdometerByTruck] = useState({});
const [fuelInsights, setFuelInsights] = useState([]);

const maintenanceRecords = [
  {
    id: "m1",
    truck: "Hilux — ABC-1234",
    service: "Oil Change",
    date: "2024-09-10",
    status: "Completed",
    cost: "180 SAR",
    notes: "Next inspection due at 75,000 km",
  },
  {
    id: "m2",
    truck: "Isuzu NPR — XYZ-5678",
    service: "Brake Inspection",
    date: "2024-09-14",
    status: "Scheduled",
    cost: "450 SAR",
    notes: "Awaiting parts arrival",
  },
  {
    id: "m3",
    truck: "Hino 300 — LMN-9101",
    service: "Tire Replacement",
    date: "2024-08-20",
    status: "Overdue",
    cost: "1,200 SAR",
    notes: "Follow up with supplier",
  },
];

const formatTruckLabel = (truck) => {
  const label = `${truck.model} — ${truck.plate}`;
  return label.length > 28 ? `${label.slice(0, 25)}...` : label;
};

const filteredReportTrucks = reportForm.projectId
  ? trucks.filter((truck) => truck.projectId === reportForm.projectId)
  : [];

useEffect(() => {
  return () => {
    if (reportPreviewUrl) URL.revokeObjectURL(reportPreviewUrl);
  };
}, [reportPreviewUrl]);

const handleReportChange = (e) => {
  const { name, value } = e.target;
  setReportForm((prev) => ({ ...prev, [name]: value }));
};

const handleReportProjectChange = (e) => {
  const projectId = e.target.value;
  setReportForm((prev) => {
    const truckStillValid =
      prev.truckId &&
      trucks.some(
        (truck) => truck.id === prev.truckId && truck.projectId === projectId
      );
    return {
      ...prev,
      projectId,
      truckId: truckStillValid ? prev.truckId : "",
    };
  });
};

const handleReportTruckChange = (e) => {
  setReportForm((prev) => ({ ...prev, truckId: e.target.value }));
};

const handleReportFileChange = (e) => {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  if (reportPreviewUrl) URL.revokeObjectURL(reportPreviewUrl);
  setReportForm((prev) => ({ ...prev, photo: file }));
  setReportPreviewUrl(URL.createObjectURL(file));
};

const handleDailyReportSubmit = (e) => {
  e.preventDefault();
  if (!reportForm.projectId || !reportForm.truckId) {
    alert("⚠️ Please select both a project and a truck before submitting.");
    return;
  }

  const currentReading = parseFloat(reportForm.currentOdometer);
  const liters = parseFloat(reportForm.litersFilled);
  const truckLastOdometer = lastOdometerByTruck[reportForm.truckId] ?? null;
  const selectedProject =
    projects.find((project) => project.id === reportForm.projectId) || null;
  const projectName = selectedProject?.name || "Unassigned Project";
  const selectedTruck =
    trucks.find((truck) => truck.id === reportForm.truckId) || null;
  const truckLabel = selectedTruck
    ? `${selectedTruck.model} — ${selectedTruck.plate}`
    : "Unassigned Truck";

  const canCalculate =
    truckLastOdometer !== null &&
    Number.isFinite(currentReading) &&
    Number.isFinite(liters) &&
    liters > 0 &&
    currentReading > truckLastOdometer;

  if (canCalculate) {
    const distance = currentReading - truckLastOdometer;
    const efficiency = distance / liters;
    const insight = {
      id: Date.now(),
      projectName,
      truckLabel,
      projectId: reportForm.projectId,
      truckId: reportForm.truckId,
      from: truckLastOdometer,
      to: currentReading,
      distance: distance.toFixed(1),
      liters: liters.toFixed(1),
      efficiency: efficiency.toFixed(2),
    };
    setFuelInsights((prev) => [insight, ...prev].slice(0, 4));
  }

  if (Number.isFinite(currentReading)) {
    setLastOdometerByTruck((prev) => ({
      ...prev,
      [reportForm.truckId]: currentReading,
    }));
  }

  alert(`✅ Daily report submitted for ${truckLabel} in ${projectName}.`);
  setReportForm((prev) => ({
    ...prev,
    currentOdometer: "",
    litersFilled: "",
    fuelCost: "",
    notes: "",
    photo: null,
  }));
  if (reportPreviewUrl) {
    URL.revokeObjectURL(reportPreviewUrl);
  }
  setReportPreviewUrl(null);
};

const filteredProjects = projects
  .filter((p) => filterStatus === "all" || p.status === filterStatus)
  .sort((a, b) => {
    if (sortOption === "nameAsc") return a.name.localeCompare(b.name);
    if (sortOption === "nameDesc") return b.name.localeCompare(a.name);
    if (sortOption === "progressAsc") return a.progress - b.progress;
    if (sortOption === "progressDesc") return b.progress - a.progress;
    return 0;
  });






  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-50 to-gray-100 text-gray-900">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 bg-black text-white flex-col p-6 shadow-2xl rounded-r-3xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-gray-900 to-black flex items-center justify-center text-white font-bold text-xl shadow-lg border border-gray-700">
            PM
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Project Manager</h2>
            <p className="text-sm text-gray-400">Maqayees System</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              className={`flex items-center w-full px-4 py-2.5 rounded-lg text-left font-medium transition-all duration-200 ${
                activeTab === item.key
                  ? "bg-white text-black shadow-inner"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <span className="mr-3 text-lg">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <button
          className="mt-auto bg-gray-800 hover:bg-gray-700 text-white py-2.5 px-4 rounded-lg font-semibold text-sm shadow-md transition"
          onClick={() => alert("TODO: Implement logout")}
        >
          Logout
        </button>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-black text-white z-20 flex justify-between items-center px-4 py-3 shadow-md">
        <h2 className="text-lg font-semibold">PM Dashboard</h2>
        <select
          value={activeTab}
          onChange={(e) => setActiveTab(e.target.value)}
          className="border border-white/40 bg-gray-800 text-white rounded-lg text-xs p-1 focus:outline-none"
        >
          {navItems.map((item) => (
            <option key={item.key} value={item.key}>
              {item.label}
            </option>
          ))}
        </select>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 mt-16 md:mt-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {/* ---- MONITOR TAB ---- */}
            {activeTab === "monitor" && (
              <div className="space-y-6">
                <Card title="PM Monitor">
                  <p className="text-gray-600 text-sm mb-4">
                    Live snapshot covering project progress, fleet availability, and weekly fuel performance.
                  </p>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {pmMonitorStats.map((stat) => (
                      <div
                        key={stat.label}
                        className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 shadow-sm"
                      >
                        <p className="text-xs uppercase tracking-wide text-gray-500">{stat.label}</p>
                        <p className="mt-2 text-2xl font-semibold text-black">{stat.value}</p>
                        <p className="text-xs text-gray-500">{stat.subLabel}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-2">
                    {projects.map((project) => (
                      <div
                        key={project.id}
                        className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                      >
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-xs uppercase tracking-wide text-gray-400">
                              {project.city} • {project.neighborhood}
                            </p>
                            <h3 className="text-lg font-semibold text-black">{project.name}</h3>
                          </div>
                          <span className="rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-700">
                            {project.status}
                          </span>
                        </div>
                        <div className="mt-4">
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>Progress</span>
                            <span>{project.progress}%</span>
                          </div>
                          <div className="mt-1 h-2 rounded-full bg-gray-100">
                            <div
                              className="h-full rounded-full bg-black transition-all"
                              style={{ width: `${project.progress}%` }}
                            />
                          </div>
                        </div>
                        <div className="mt-5 grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                          <div>
                            <p className="text-xs uppercase tracking-wide text-gray-400">Fleet</p>
                            <p className="text-lg font-semibold text-black">
                              {project.fleet?.active ?? 0}/{project.fleet?.total ?? 0} active
                            </p>
                            <p className="text-xs text-gray-500">
                              {project.fleet?.maintenance ?? 0} in maintenance · {project.fleet?.standby ?? 0} standby
                            </p>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-wide text-gray-400">Fuel This Week</p>
                            <p className="text-lg font-semibold text-black">
                              {(project.fuel?.weeklyLiters || 0).toLocaleString()} L
                            </p>
                            <p
                              className={`text-xs ${
                                (project.fuel?.variance || 0) >= 0 ? "text-amber-600" : "text-green-600"
                              }`}
                            >
                              {project.fuel?.variance > 0 ? "+" : ""}
                              {project.fuel?.variance ?? 0}% vs plan
                            </p>
                          </div>
                        </div>
                        <div className="mt-4 grid grid-cols-1 gap-4 text-sm sm:grid-cols-3">
                          <div>
                            <p className="text-xs uppercase tracking-wide text-gray-400">Drivers</p>
                            <p className="font-semibold text-black">{project.driversCount}</p>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-wide text-gray-400">Efficiency</p>
                            <p className="font-semibold text-black">{project.fuel?.efficiency ?? 0} km/L</p>
                          </div>
                        </div>
                        {project.alerts?.length ? (
                          <div className="mt-5 flex flex-wrap gap-2">
                            {project.alerts.map((alert) => (
                              <span
                                key={alert}
                                className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700"
                              >
                                {alert}
                              </span>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </Card>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                  <Card title="Weekly Fuel Consumption">
                    <p className="text-xs uppercase tracking-wide text-gray-400 mb-4">
                      Actual vs target liters per project
                    </p>
                    <ResponsiveContainer width="100%" height={280}>
                      <LineChart data={fuelConsumptionSeries}>
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="actual" stroke="#111827" strokeWidth={3} dot={{ r: 3 }} />
                        <Line type="monotone" dataKey="target" stroke="#a3a3a3" strokeDasharray="6 4" />
                      </LineChart>
                    </ResponsiveContainer>
                  </Card>

                  <Card title="Fleet Availability">
                    <p className="text-xs uppercase tracking-wide text-gray-400 mb-4">
                      Active vs maintenance vs standby units
                    </p>
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={fleetAvailabilityData}>
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="Active" stackId="fleet" fill="#111827" />
                        <Bar dataKey="Maintenance" stackId="fleet" fill="#f97316" />
                        <Bar dataKey="Standby" stackId="fleet" fill="#d4d4d4" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Card>
                </div>

                <Card title="Operational Alerts & Notes">
                  {projectAlerts.length ? (
                    <div className="divide-y divide-gray-100">
                      {projectAlerts.map((alert, index) => (
                        <div key={`${alert.project}-${index}`} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-sm font-semibold text-black">{alert.project}</p>
                            <p className="text-sm text-gray-600">{alert.detail}</p>
                          </div>
                          <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                            {alert.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No open alerts at the moment.</p>
                  )}
                </Card>
              </div>
            )}

            {/* ---- ADD SUPERVISOR ---- */}
            {activeTab === "addSupervisor" && (
              <Card title="Add New Supervisor">
                <form className="space-y-4 text-sm">
                  <Input label="Full Name" placeholder="e.g. Ali Supervisor" />
                  <Input label="Email" type="email" placeholder="e.g. ali@maqayees.com" />
                  <Input label="Phone" type="tel" placeholder="e.g. 0556543210" />
                  <Input label="Project" placeholder="e.g. Project A" />
                  <button
                    type="submit"
                    className="bg-black hover:bg-gray-900 text-white px-5 py-2 rounded-lg font-semibold text-sm shadow-md transition"
                  >
                    Add Supervisor
                  </button>
                </form>
              </Card>
            )}

            {/* ---- ADD DRIVER ---- */}
            {activeTab === "addDriver" && (
              <Card title="Add New Driver">
                <form className="space-y-4 text-sm">
                  <Input label="Full Name" placeholder="e.g. Ahmed Driver" />
                  <Input label="Email" type="email" placeholder="e.g. ahmed@maqayees.com" />
                  <Input label="Phone" type="tel" placeholder="e.g. 0551234567" />
                  <Input label="Assigned Project" placeholder="e.g. Project A" />
                  <button
                    type="submit"
                    className="bg-black hover:bg-gray-900 text-white px-5 py-2 rounded-lg font-semibold text-sm shadow-md transition"
                  >
                    Add Driver
                  </button>
                </form>
              </Card>
            )}

            {/* ---- ADD TRUCK ---- */}
            {activeTab === "addTruck" && (
              <Card title="Add New Truck">
                <form className="space-y-4 text-sm">
                  <Input label="Plate Number" placeholder="e.g. ABC-1234" />
                  <Input label="Brand" placeholder="e.g. Toyota" />
                  <Input label="Model" placeholder="e.g. Hilux" />
                  <Input label="Year" type="number" placeholder="e.g. 2023" />
                  <Input label="Assigned Project" placeholder="e.g. Project A" />
                  <button
                    type="submit"
                    className="bg-black hover:bg-gray-900 text-white px-5 py-2 rounded-lg font-semibold text-sm shadow-md transition"
                  >
                    Add Truck
                  </button>
                </form>
              </Card>
            )}
            {activeTab === "assignSupervisor" && (
  <Card title="Assign Supervisor to Project">
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!assignment.supervisor || !assignment.project) {
          setMessage("⚠️ Please select both a supervisor and a project.");
          return;
        }
        setMessage(
          `✅ ${supervisors.find((s) => s.id === assignment.supervisor)?.name} assigned to ${
            projects.find((p) => p.id === assignment.project)?.name
          } successfully.`
        );
        setAssignment({ supervisor: "", driver: "", project: "" });
      }}
      className="space-y-4 text-sm"
    >
      <div>
        <label className="block text-sm font-medium text-gray-800 mb-1">Supervisor</label>
        <select
          value={assignment.supervisor}
          onChange={(e) => setAssignment((prev) => ({ ...prev, supervisor: e.target.value }))}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black"
        >
          <option value="">-- Choose Supervisor --</option>
          {supervisors.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-800 mb-1">Project</label>
        <select
          value={assignment.project}
          onChange={(e) => setAssignment((prev) => ({ ...prev, project: e.target.value }))}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black"
        >
          <option value="">-- Choose Project --</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        className="bg-black hover:bg-gray-900 text-white px-5 py-2 rounded-lg font-semibold text-sm shadow-md transition"
      >
        Assign
      </button>

      {message && (
        <p className={`mt-2 text-sm ${message.startsWith("✅") ? "text-green-600" : "text-red-600"}`}>
          {message}
        </p>
      )}
    </form>
  </Card>
)}

{activeTab === "assignDriver" && (
  <Card title="Assign Drivers to Project">
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (assignment.drivers.length === 0 || !assignment.project) {
          setMessage("⚠️ Please select at least one driver and a project.");
          return;
        }
        const driverNames = assignment.drivers
          .map((id) => drivers.find((d) => d.id === id)?.name)
          .join(", ");
        setMessage(
          `✅ Drivers [${driverNames}] assigned to ${
            projects.find((p) => p.id === assignment.project)?.name
          } successfully.`
        );
        setAssignment((prev) => ({ ...prev, drivers: [], project: "" }));
      }}
      className="space-y-4 text-sm"
    >
      {/* Select All / Deselect All */}
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-gray-800 font-medium">Select Drivers</h4>
        <button
          type="button"
          onClick={() => {
            if (assignment.drivers.length === drivers.length) {
              setAssignment((prev) => ({ ...prev, drivers: [] }));
            } else {
              setAssignment((prev) => ({
                ...prev,
                drivers: drivers.map((d) => d.id),
              }));
            }
          }}
          className="text-xs text-blue-600 hover:underline"
        >
          {assignment.drivers.length === drivers.length
            ? "Deselect All"
            : "Select All"}
        </button>
      </div>

      {/* Scrollable driver list */}
      <div className="border border-gray-300 rounded-lg p-3 h-64 overflow-y-auto space-y-1">
        {drivers.map((d) => (
          <label
            key={d.id}
            className="flex items-center space-x-2 text-gray-700 cursor-pointer hover:bg-gray-50 rounded-md px-1 py-1"
          >
            <input
              type="checkbox"
              checked={assignment.drivers.includes(d.id)}
              onChange={(e) => {
                const newDrivers = e.target.checked
                  ? [...assignment.drivers, d.id]
                  : assignment.drivers.filter((id) => id !== d.id);
                setAssignment((prev) => ({ ...prev, drivers: newDrivers }));
              }}
              className="text-black focus:ring-black"
            />
            <span>{d.name}</span>
          </label>
        ))}
      </div>

      {/* Project Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-800 mb-1">
          Project
        </label>
        <select
          value={assignment.project}
          onChange={(e) =>
            setAssignment((prev) => ({ ...prev, project: e.target.value }))
          }
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black"
        >
          <option value="">-- Choose Project --</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        className="bg-black hover:bg-gray-900 text-white px-5 py-2 rounded-lg font-semibold text-sm shadow-md transition"
      >
        Assign
      </button>

      {message && (
        <p
          className={`mt-2 text-sm ${
            message.startsWith("✅") ? "text-green-600" : "text-red-600"
          }`}
        >
          {message}
        </p>
      )}
    </form>
  </Card>
)}

{activeTab === "assignTruck" && (
  <Card title="Assign Trucks to Project">
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (assignment.trucks.length === 0 || !assignment.project) {
          setMessage("⚠️ Please select at least one truck and a project.");
          return;
        }
        const truckList = assignment.trucks
          .map((id) => {
            const t = trucks.find((t) => t.id === id);
            return `${t.plate} (${t.model})`;
          })
          .join(", ");
        setMessage(
          `✅ Trucks [${truckList}] assigned to ${
            projects.find((p) => p.id === assignment.project)?.name
          } successfully.`
        );
        setAssignment((prev) => ({ ...prev, trucks: [], project: "" }));
      }}
      className="space-y-4 text-sm"
    >
      {/* Select All / Deselect All */}
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-gray-800 font-medium">Select Trucks</h4>
        <button
          type="button"
          onClick={() => {
            if (assignment.trucks.length === trucks.length) {
              setAssignment((prev) => ({ ...prev, trucks: [] }));
            } else {
              setAssignment((prev) => ({
                ...prev,
                trucks: trucks.map((t) => t.id),
              }));
            }
          }}
          className="text-xs text-blue-600 hover:underline"
        >
          {assignment.trucks.length === trucks.length
            ? "Deselect All"
            : "Select All"}
        </button>
      </div>

      {/* Scrollable truck list */}
      <div className="border border-gray-300 rounded-lg p-3 h-64 overflow-y-auto space-y-1">
        {trucks.map((t) => (
          <label
            key={t.id}
            className="flex items-center space-x-2 text-gray-700 cursor-pointer hover:bg-gray-50 rounded-md px-1 py-1"
          >
            <input
              type="checkbox"
              checked={assignment.trucks.includes(t.id)}
              onChange={(e) => {
                const newTrucks = e.target.checked
                  ? [...assignment.trucks, t.id]
                  : assignment.trucks.filter((id) => id !== t.id);
                setAssignment((prev) => ({ ...prev, trucks: newTrucks }));
              }}
              className="text-black focus:ring-black"
            />
            <span>
              {t.plate} – {t.model}
            </span>
          </label>
        ))}
      </div>

      {/* Project Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-800 mb-1">
          Project
        </label>
        <select
          value={assignment.project}
          onChange={(e) =>
            setAssignment((prev) => ({ ...prev, project: e.target.value }))
          }
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black"
        >
          <option value="">-- Choose Project --</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        className="bg-black hover:bg-gray-900 text-white px-5 py-2 rounded-lg font-semibold text-sm shadow-md transition"
      >
        Assign
      </button>

      {message && (
        <p
          className={`mt-2 text-sm ${
            message.startsWith("✅") ? "text-green-600" : "text-red-600"
          }`}
        >
          {message}
        </p>
      )}
    </form>
  </Card>
)}



{activeTab === "assignDriverTruck" && (
  <Card title="Assign Driver to Truck">
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!driverTruckAssignment.driver || !driverTruckAssignment.truck) {
          setMessage("⚠️ Please select both a driver and a truck.");
          return;
        }
        const driverName = drivers.find((d) => d.id === driverTruckAssignment.driver)?.name;
        const truckLabel = trucks.find((t) => t.id === driverTruckAssignment.truck);
        setMessage(`✅ ${driverName} assigned to ${truckLabel?.plate} successfully.`);
        setDriverTruckAssignment({ driver: "", truck: "" });
      }}
      className="space-y-4 text-sm"
    >
      <div>
        <label className="block text-sm font-medium text-gray-800 mb-1">Driver</label>
        <select
          value={driverTruckAssignment.driver}
          onChange={(e) => setDriverTruckAssignment((prev) => ({ ...prev, driver: e.target.value }))}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black"
        >
          <option value="">-- Choose Driver --</option>
          {drivers.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-800 mb-1">Truck</label>
        <select
          value={driverTruckAssignment.truck}
          onChange={(e) => setDriverTruckAssignment((prev) => ({ ...prev, truck: e.target.value }))}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black"
        >
          <option value="">-- Choose Truck --</option>
          {trucks.map((t) => (
            <option key={t.id} value={t.id}>
              {t.plate} — {t.model}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        className="bg-black hover:bg-gray-900 text-white px-5 py-2 rounded-lg font-semibold text-sm shadow-md transition"
      >
        Assign
      </button>

      {message && (
        <p
          className={`mt-2 text-sm ${message.startsWith("✅") ? "text-green-600" : "text-red-600"}`}
        >
          {message}
        </p>
      )}
    </form>
  </Card>
)}

{activeTab === "dailyReport" && (
  <Card title="Daily Fuel Report">
    <form onSubmit={handleDailyReportSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-800 mb-1">
            Project
          </label>
          <select
            value={reportForm.projectId}
            onChange={handleReportProjectChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-black transition"
            required
          >
            <option value="">-- Choose Project --</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-800 mb-1">
            Truck
          </label>
          <select
            value={reportForm.truckId}
            onChange={handleReportTruckChange}
            disabled={!reportForm.projectId || filteredReportTrucks.length === 0}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-black transition disabled:bg-gray-100 disabled:text-gray-500"
            required
          >
            <option value="">
              {reportForm.projectId
                ? filteredReportTrucks.length
                  ? "-- Choose Truck --"
                  : "No trucks available"
                : "Select a project first"}
            </option>
            {filteredReportTrucks.map((truck) => (
              <option key={truck.id} value={truck.id}>
                {truck.model} — {truck.plate}
              </option>
            ))}
          </select>
        </div>

        <Input
          label="Current Odometer (KM)"
          name="currentOdometer"
          value={reportForm.currentOdometer}
          onChange={handleReportChange}
          type="number"
          min="0"
          step="0.1"
          required
        />
        <Input
          label="Fuel Filled (Liters)"
          name="litersFilled"
          value={reportForm.litersFilled}
          onChange={handleReportChange}
          type="number"
          min="0"
          step="0.1"
          required
        />
        <Input
          label="Fuel Cost (SAR)"
          name="fuelCost"
          value={reportForm.fuelCost}
          onChange={handleReportChange}
          type="number"
          min="0"
          step="0.1"
        />
        <Input
          label="Notes"
          name="notes"
          value={reportForm.notes}
          onChange={handleReportChange}
          placeholder="Any observations?"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-800 mb-1">Upload Photo</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleReportFileChange}
          className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-800 file:rounded-lg file:bg-black file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white focus:ring-2 focus:ring-black"
        />
      </div>

      {reportPreviewUrl && (
        <img
          src={reportPreviewUrl}
          alt="Fuel receipt preview"
          className="h-48 w-full rounded-xl border object-cover"
        />
      )}

      <button
        type="submit"
        className="bg-black hover:bg-gray-900 text-white px-5 py-2 rounded-lg font-semibold text-sm shadow-md transition"
      >
        Submit Report
      </button>
    </form>

    {!!fuelInsights.length && (
      <div className="mt-6">
        <h3 className="text-md font-semibold text-black mb-3">Recent Efficiency Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fuelInsights.map((insight) => (
            <div key={insight.id} className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm">
              <p className="text-gray-600">
                Project: <span className="font-semibold text-gray-900">{insight.projectName}</span>
              </p>
              <p className="text-gray-600">
                Truck: <span className="font-semibold text-gray-900">{insight.truckLabel}</span>
              </p>
              <p className="font-semibold text-gray-900">
                {insight.from} km → {insight.to} km
              </p>
              <p className="text-gray-600 mt-1">
                Distance: <span className="font-semibold">{insight.distance} km</span>
              </p>
              <p className="text-gray-600">
                Fuel Used: <span className="font-semibold">{insight.liters} L</span>
              </p>
              <p className="text-gray-900 mt-2">
                Efficiency: <span className="font-semibold text-green-600">{insight.efficiency} km/L</span>
              </p>
            </div>
          ))}
        </div>
      </div>
    )}
  </Card>
)}

{activeTab === "maintenance" && (
  <Card title="Maintenance Tracker">
    <p className="text-gray-600 text-sm mb-4">View upcoming and completed maintenance jobs.</p>
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left text-gray-800 border border-gray-200 rounded-lg overflow-hidden">
        <thead className="bg-gray-100 text-gray-900">
          <tr>
            <th className="py-3 px-4 font-medium">Truck</th>
            <th className="py-3 px-4 font-medium">Service</th>
            <th className="py-3 px-4 font-medium">Date</th>
            <th className="py-3 px-4 font-medium">Status</th>
            <th className="py-3 px-4 font-medium">Cost</th>
            <th className="py-3 px-4 font-medium">Notes</th>
          </tr>
        </thead>
        <tbody>
          {maintenanceRecords.map((record) => (
            <tr key={record.id} className="border-b hover:bg-gray-50 transition">
              <td className="py-2.5 px-4">{record.truck}</td>
              <td className="py-2.5 px-4">{record.service}</td>
              <td className="py-2.5 px-4">{record.date}</td>
              <td className="py-2.5 px-4">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    record.status === "Completed"
                      ? "bg-green-100 text-green-700"
                      : record.status === "Scheduled"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {record.status}
                </span>
              </td>
              <td className="py-2.5 px-4">{record.cost}</td>
              <td className="py-2.5 px-4 text-gray-600">{record.notes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </Card>
)}


{activeTab === "projects" && (
  <Card title="Projects Overview">
    <p className="text-gray-600 text-sm mb-4">
      Manage all active and planned projects in your department.
    </p>
    

    {/* Project Table */}
    <div className="overflow-x-auto mb-6">
      {/* Controls */}
<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
  <div className="flex items-center gap-3">
    <label className="text-sm font-medium text-gray-800">Filter:</label>
    <select
      value={filterStatus}
      onChange={(e) => setFilterStatus(e.target.value)}
      className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-black"
    >
      <option value="all">All</option>
      <option value="Active">Active</option>
      <option value="Pending">Pending</option>
      <option value="Not Started">Not Started</option>
      <option value="Completed">Completed</option>
    </select>
  </div>

  <div className="flex items-center gap-3">
    <label className="text-sm font-medium text-gray-800">Sort by:</label>
    <select
      value={sortOption}
      onChange={(e) => setSortOption(e.target.value)}
      className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-black"
    >
      <option value="nameAsc">Name (A–Z)</option>
      <option value="nameDesc">Name (Z–A)</option>
      <option value="progressAsc">Progress (Low → High)</option>
      <option value="progressDesc">Progress (High → Low)</option>
    </select>
  </div>
</div>

      <table className="w-full text-sm text-left text-gray-800 border border-gray-200 rounded-lg overflow-hidden">
      <thead className="bg-gray-100 text-gray-900">
  <tr>
    <th className="py-3 px-4 font-medium">Project Name</th>
    <th className="py-3 px-4 font-medium">Supervisor</th>
    <th className="py-3 px-4 font-medium">City</th>
    <th className="py-3 px-4 font-medium">Neighborhood</th>
    <th className="py-3 px-4 font-medium">Start</th>
    <th className="py-3 px-4 font-medium">End</th>
    <th className="py-3 px-4 font-medium">Duration</th>
    <th className="py-3 px-4 font-medium">Time Left</th>
    <th className="py-3 px-4 font-medium">Status</th>
    <th className="py-3 px-4 font-medium">Progress</th>
  </tr>
</thead>
<tbody>
 {projects.map((p) => {
  const remaining = calculateRemainingDays(p.endDate);
  const isOverdue = remaining.includes("Completed");

  return (
    <tr
      key={p.id}
      onClick={() => router.push(`/dashboard/projects/${p.id}`)}
      className="border-b hover:bg-gray-50 transition cursor-pointer"
    >
      {/* Project Name (styled link) */}
      <td className="py-2.5 px-4 font-medium text-blue-600 hover:text-blue-800 hover:underline">
        {p.name}
      </td>

      <td className="py-2.5 px-4">{p.supervisor}</td>
      <td className="py-2.5 px-4">{p.city}</td>
      <td className="py-2.5 px-4">{p.neighborhood}</td>
      <td className="py-2.5 px-4">{p.startDate}</td>
      <td className="py-2.5 px-4">{p.endDate}</td>
      <td className="py-2.5 px-4">{p.duration}</td>

      {/* Time Left */}
      <td
        className={`py-2.5 px-4 font-medium ${
          remaining.includes("Completed")
            ? "text-green-600"
            : remaining.includes("Ends today")
            ? "text-orange-500"
            : "text-blue-600"
        }`}
      >
        {remaining}
      </td>

      {/* Status */}
      <td className="py-2.5 px-4">
        <select
          value={p.status}
          onClick={(e) => e.stopPropagation()} // prevent row click from triggering navigation
          onChange={(e) => handleStatusChange(p.id, e.target.value)}
          className="border border-gray-300 rounded-md px-2 py-1 text-xs sm:text-sm focus:ring-2 focus:ring-black"
        >
          <option value="Active">Active</option>
          <option value="Pending">Pending</option>
          <option value="Not Started">Not Started</option>
          <option value="Completed">Completed</option>
        </select>
      </td>

      {/* Progress Bar */}
      <td className="py-2.5 px-4">
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className={`h-2.5 rounded-full ${
              p.progress >= 100
                ? "bg-green-600"
                : p.progress >= 60
                ? "bg-green-500"
                : p.progress >= 30
                ? "bg-yellow-500"
                : "bg-red-500"
            }`}
            style={{ width: `${p.progress}%` }}
          ></div>
        </div>
      </td>
    </tr>
  );
})}
</tbody>


      </table>
    </div>

    {/* Add New Project Form */}
<h3 className="text-md font-semibold text-black mb-3">Add New Project</h3>
<form
  onSubmit={(e) => {
    e.preventDefault();
    if (!newProject.name.trim()) {
      setProjectMsg("⚠️ Project name is required.");
      return;
    }

    setProjects((prev) => [
      ...prev,
      {
        id: `p${prev.length + 1}`,
        name: newProject.name,
        supervisor: "Unassigned",
        status: newProject.status,
        progress: 0,
        startDate: newProject.startDate,
        endDate: newProject.endDate,
        duration: newProject.duration || calculateDuration(newProject.startDate, newProject.endDate),
        city: newProject.city,
        neighborhood: newProject.neighborhood,
      },
    ]);

    setNewProject({
      name: "",
      status: "Pending",
      startDate: "",
      endDate: "",
      duration: "",
      city: "",
      neighborhood: "",
    });
    setProjectMsg("✅ Project added successfully!");
  }}
  className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm"
>
  {/* Project Name */}
  <Input
    label="Project Name"
    type="text"
    value={newProject.name}
    onChange={(e) => setNewProject((prev) => ({ ...prev, name: e.target.value }))}
    placeholder="e.g. Project D"
  />

  {/* Status */}
  <div>
    <label className="block text-sm font-medium text-gray-800 mb-1">Status</label>
    <select
      value={newProject.status}
      onChange={(e) => setNewProject((prev) => ({ ...prev, status: e.target.value }))}
      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black"
    >
      <option value="Active">Active</option>
      <option value="Pending">Pending</option>
      <option value="Not Started">Not Started</option>
    </select>
  </div>

  {/* Start Date */}
  <Input
    label="Start Date"
    type="date"
    value={newProject.startDate}
    onChange={(e) => {
      const newStart = e.target.value;
      setNewProject((prev) => ({
        ...prev,
        startDate: newStart,
        duration: calculateDuration(newStart, prev.endDate),
      }));
    }}
  />

  {/* End Date */}
  <Input
    label="End Date"
    type="date"
    value={newProject.endDate}
    onChange={(e) => {
      const newEnd = e.target.value;
      setNewProject((prev) => ({
        ...prev,
        endDate: newEnd,
        duration: calculateDuration(prev.startDate, newEnd),
      }));
    }}
  />

  {/* Duration (auto-calculated) */}
  <Input
    label="Contract Duration (auto-calculated)"
    type="text"
    value={newProject.duration}
    onChange={(e) => setNewProject((prev) => ({ ...prev, duration: e.target.value }))}
    placeholder="Automatically filled after choosing dates"
  />

  {/* City */}
  <Input
    label="City"
    type="text"
    value={newProject.city}
    onChange={(e) => setNewProject((prev) => ({ ...prev, city: e.target.value }))}
    placeholder="e.g. Riyadh"
  />

  {/* Neighborhood */}
  <Input
    label="Neighborhood"
    type="text"
    value={newProject.neighborhood}
    onChange={(e) => setNewProject((prev) => ({ ...prev, neighborhood: e.target.value }))}
    placeholder="e.g. Al Olaya"
  />

  <div className="col-span-2 flex justify-end">
    <button
      type="submit"
      className="bg-black hover:bg-gray-900 text-white px-5 py-2 rounded-lg font-semibold text-sm shadow-md transition"
    >
      Add Project
    </button>
  </div>

  {projectMsg && (
    <p
      className={`col-span-2 text-sm ${
        projectMsg.startsWith("✅") ? "text-green-600" : "text-red-600"
      }`}
    >
      {projectMsg}
    </p>
  )}
</form>

  </Card>
)}



            {/* ---- PROFILE ---- */}
            {activeTab === "profile" && (
              <Card title="Project Manager Profile">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-800">
                  <Field label="Name" value={pm.name} />
                  <Field label="Email" value={pm.email} />
                  <Field label="Phone" value={pm.phone} />
                  <Field label="Role" value={pm.role} />
                </div>
              </Card>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

/* --- Reusable Components --- */
function Card({ title, children }) {
  return (
    <section className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 hover:shadow-md transition">
      <h2 className="text-lg font-semibold mb-4 text-black border-b border-gray-100 pb-2">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Field({ label, value }) {
  return (
    <p>
      <span className="font-medium text-black">{label}:</span> {value}
    </p>
  );
}

function Input({ label, ...props }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-800 mb-1">
        {label}
      </label>
      <input
        {...props}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-black transition"
      />
    </div>
  );
}

function SupervisorMonitorCard({ trucks, selectedTruck, setSelectedTruck, formatTruckLabel }) {
  return (
    <Card title="Fleet Monitoring">
      <p className="text-gray-600 text-sm mb-4">
        Overview of driver activity and fleet performance
      </p>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-md font-semibold text-black">Fleet Snapshot</h3>
        <select
          value={selectedTruck}
          onChange={(e) => setSelectedTruck(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-black"
        >
          <option value="all">All Trucks</option>
          {trucks.map((truck) => (
            <option key={truck.id} value={truck.id} title={`${truck.model} — ${truck.plate}`}>
              {formatTruckLabel(truck)}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <h3 className="text-md font-semibold text-black mb-3">Driver Status Summary</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={[
                  { name: "On Duty", value: 8 },
                  { name: "Off Duty", value: 4 },
                ]}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label
              >
                <Cell fill="#16a34a" />
                <Cell fill="#9ca3af" />
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <h3 className="text-md font-semibold text-black mb-3">Weekly Mileage Trend (km)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              data={[
                { day: "Sat", mileage: 220 },
                { day: "Sun", mileage: 310 },
                { day: "Mon", mileage: 290 },
                { day: "Tue", mileage: 330 },
                { day: "Wed", mileage: 280 },
                { day: "Thu", mileage: 340 },
                { day: "Fri", mileage: 260 },
              ]}
            >
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="mileage" fill="#111827" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <h3 className="text-md font-semibold text-black mb-3">Weekly Fuel Consumption (L)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart
              data={[
                { day: "Sat", fuel: 180 },
                { day: "Sun", fuel: 195 },
                { day: "Mon", fuel: 205 },
                { day: "Tue", fuel: 210 },
                { day: "Wed", fuel: 190 },
                { day: "Thu", fuel: 220 },
                { day: "Fri", fuel: 185 },
              ]}
            >
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="fuel"
                stroke="#f97316"
                strokeWidth={3}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
                name="Fuel Used"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
}
