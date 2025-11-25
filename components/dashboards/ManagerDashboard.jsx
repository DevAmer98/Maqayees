//app/dashboard/%28role%29/%28manager%29/page.jsx
"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Area, AreaChart, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export default function ManagerDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [employeeFilter, setEmployeeFilter] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");
  const [fleetProjectFilter, setFleetProjectFilter] = useState("all");
  const [fuelProjectFilter, setFuelProjectFilter] = useState("all");
  const [fuelTruckFilter, setFuelTruckFilter] = useState("all");

  const manager = {
    name: "Fatimah Operations Manager",
    email: "manager@maqayees.com",
    phone: "0553214567",
    role: "Operations Manager",
  };

  const navItems = [
    { key: "overview", label: "Overview", icon: "📊" },
    { key: "projects", label: "Projects", icon: "🏗️" },
    { key: "fleet", label: "Fleet", icon: "🚛" },
    { key: "employees", label: "Employees", icon: "🧑‍🤝‍🧑" },
    { key: "profile", label: "Profile", icon: "👤" },
  ];

  const portfolio = [
    {
      id: "proj-01",
      name: "Northern Expansion",
      manager: "Omar PM",
      completion: 72,
      fleetReady: "12 / 14",
      drivers: 26,
      fuelVariance: -2,
      maintenanceOpen: 1,
      notes: ["Concrete pour phase", "Fuel variance -2%"],
    },
    {
      id: "proj-02",
      name: "Eastern Hub",
      manager: "Sara PM",
      completion: 54,
      fleetReady: "15 / 18",
      drivers: 31,
      fuelVariance: 3,
      maintenanceOpen: 2,
      notes: ["Night shift coverage low", "2 trucks awaiting parts"],
    },
    {
      id: "proj-03",
      name: "Retail Fleet Upgrade",
      manager: "Laila PM",
      completion: 81,
      fleetReady: "9 / 9",
      drivers: 12,
      fuelVariance: -1,
      maintenanceOpen: 0,
      notes: ["Supervisor change Monday"],
    },
    {
      id: "proj-04",
      name: "Southern Corridor",
      manager: "Hassan PM",
      completion: 47,
      fleetReady: "10 / 12",
      drivers: 18,
      fuelVariance: 1,
      maintenanceOpen: 1,
      notes: ["Survey crews mobilized", "One standby truck activated"],
    },
  ];

  const fleetAtGlance = [
    { label: "Total Units", value: 72 },
    { label: "In Service", value: 63 },
    { label: "Under Maintenance", value: 6 },
    { label: "Standby", value: 3 },
  ];

  const maintenanceBacklog = [
    { asset: "Dump Truck 21", type: "Brake job", status: "Awaiting parts", priority: "High" },
    { asset: "Loader 8", type: "Hydraulic leak", status: "In workshop", priority: "Medium" },
    { asset: "Mixer 4", type: "Annual inspection", status: "Scheduled", priority: "Low" },
  ];

  const fuelPerformance = [
    { week: "W1", liters: 58000, target: 60000, cost: 320000, distanceKm: 165000 },
    { week: "W2", liters: 62000, target: 61000, cost: 339000, distanceKm: 177000 },
    { week: "W3", liters: 60000, target: 59000, cost: 330000, distanceKm: 171000 },
    { week: "W4", liters: 64000, target: 61000, cost: 347000, distanceKm: 182000 },
    { week: "W5", liters: 65500, target: 63000, cost: 354000, distanceKm: 188500 },
    { week: "W6", liters: 63000, target: 62500, cost: 340000, distanceKm: 179000 },
    { week: "W7", liters: 61500, target: 62000, cost: 333000, distanceKm: 174500 },
    { week: "W8", liters: 66200, target: 64000, cost: 360000, distanceKm: 191000 },
  ];

  const latestFuel = fuelPerformance[fuelPerformance.length - 1];
  const fuelSummary = {
    rollingAverage: Math.round(fuelPerformance.reduce((sum, entry) => sum + entry.liters, 0) / fuelPerformance.length),
    latestWeek: latestFuel,
    variancePct: (((latestFuel.liters - latestFuel.target) / latestFuel.target) * 100).toFixed(1),
  };

  const efficiencyTrend = fuelPerformance.map((entry) => {
    const efficiency = entry.distanceKm && entry.liters ? entry.distanceKm / entry.liters : 0;
    return {
      week: entry.week,
      efficiency: Number(efficiency.toFixed(2)),
    };
  });

  const currentEfficiency = efficiencyTrend.length ? efficiencyTrend[efficiencyTrend.length - 1].efficiency : 0;
  const averageEfficiency =
    efficiencyTrend.length > 0
      ? (efficiencyTrend.reduce((sum, entry) => sum + entry.efficiency, 0) / efficiencyTrend.length).toFixed(2)
      : "0.00";
  const efficiencyYAxisMax = efficiencyTrend.length
    ? Math.max(4, Math.ceil(Math.max(...efficiencyTrend.map((entry) => entry.efficiency)) + 1))
    : 5;

  const fuelByProject = [
    { project: "Northern Expansion", liters: 12600, efficiency: 2.9, variance: -2 },
    { project: "Eastern Hub", liters: 15300, efficiency: 2.4, variance: 4 },
    { project: "Retail Fleet Upgrade", liters: 8100, efficiency: 3.2, variance: -1 },
    { project: "Southern Corridor", liters: 9200, efficiency: 3.0, variance: 1 },
  ];

  const projectFuelBreakdown = [
    {
      id: "pfb-1",
      name: "Northern Expansion",
      liters: 12600,
      target: 13000,
      distanceKm: 36500,
      kmPerL: 2.9,
      costSar: 74000,
      trucks: [
        { id: "DT-21", liters: 3200, distanceKm: 9400, kmPerL: 2.9 },
        { id: "MX-08", liters: 2700, distanceKm: 8200, kmPerL: 3.0 },
      ],
    },
    {
      id: "pfb-2",
      name: "Eastern Hub",
      liters: 15300,
      target: 14700,
      distanceKm: 40800,
      kmPerL: 2.4,
      costSar: 89500,
      trucks: [
        { id: "HT-204", liters: 3800, distanceKm: 8500, kmPerL: 2.2 },
        { id: "DT-09", liters: 3100, distanceKm: 7200, kmPerL: 2.3 },
      ],
    },
    {
      id: "pfb-3",
      name: "Retail Fleet Upgrade",
      liters: 8100,
      target: 8600,
      distanceKm: 25800,
      kmPerL: 3.2,
      costSar: 47300,
      trucks: [
        { id: "PU-11", liters: 1900, distanceKm: 6300, kmPerL: 3.3 },
        { id: "PU-05", liters: 1600, distanceKm: 5400, kmPerL: 3.4 },
      ],
    },
    {
      id: "pfb-4",
      name: "Southern Corridor",
      liters: 9200,
      target: 9400,
      distanceKm: 28100,
      kmPerL: 3.05,
      costSar: 52800,
      trucks: [
        { id: "SC-14", liters: 2100, distanceKm: 6400, kmPerL: 3.0 },
        { id: "SC-07", liters: 1800, distanceKm: 5800, kmPerL: 3.2 },
      ],
    },
  ];

  const truckFuelLogs = [
    { truck: "DT-21", project: "Northern Expansion", startKm: 42980, endKm: 43780, liters: 280, efficiency: 2.86 },
    { truck: "HT-204", project: "Eastern Hub", startKm: 31210, endKm: 32090, liters: 360, efficiency: 2.45 },
    { truck: "MX-08", project: "Northern Expansion", startKm: 21100, endKm: 21920, liters: 260, efficiency: 3.15 },
    { truck: "PU-11", project: "Retail Fleet Upgrade", startKm: 15200, endKm: 15820, liters: 190, efficiency: 3.26 },
    { truck: "SC-14", project: "Southern Corridor", startKm: 28450, endKm: 29290, liters: 310, efficiency: 2.71 },
    { truck: "SC-07", project: "Southern Corridor", startKm: 19800, endKm: 20530, liters: 240, efficiency: 3.03 },
    { truck: "DT-09", project: "Eastern Hub", startKm: 27410, endKm: 28110, liters: 335, efficiency: 2.09 },
  ];

  const fleetTrucks = [
    {
      id: "HT-204",
      plate: "ABC-204",
      model: "Heavy Truck",
      projectId: "pfb-2",
      projectName: "Eastern Hub",
      status: "In Service",
      driver: "Mansour Khalid",
      mileageKm: 32090,
      lastService: "2025-05-10",
      nextService: "2025-06-02",
      efficiency: 2.2,
    },
    {
      id: "DT-21",
      plate: "NE-021",
      model: "Dump Truck",
      projectId: "pfb-1",
      projectName: "Northern Expansion",
      status: "In Service",
      driver: "Ahmed Driver",
      mileageKm: 43780,
      lastService: "2025-04-28",
      nextService: "2025-05-30",
      efficiency: 2.86,
    },
    {
      id: "MX-08",
      plate: "MX-008",
      model: "Mixer",
      projectId: "pfb-1",
      projectName: "Northern Expansion",
      status: "Standby",
      driver: "Unassigned",
      mileageKm: 21920,
      lastService: "2025-05-02",
      nextService: "2025-06-12",
      efficiency: 3.15,
    },
    {
      id: "PU-11",
      plate: "RF-011",
      model: "Pickup",
      projectId: "pfb-3",
      projectName: "Retail Fleet Upgrade",
      status: "In Service",
      driver: "Lina Omar",
      mileageKm: 15820,
      lastService: "2025-05-15",
      nextService: "2025-06-20",
      efficiency: 3.26,
    },
    {
      id: "SC-14",
      plate: "SC-214",
      model: "Side Curtain",
      projectId: "pfb-4",
      projectName: "Southern Corridor",
      status: "Maintenance",
      driver: "Nasser Y.",
      mileageKm: 29290,
      lastService: "2025-05-05",
      nextService: "2025-05-28",
      efficiency: 2.71,
    },
    {
      id: "SC-07",
      plate: "SC-107",
      model: "Side Curtain",
      projectId: "pfb-4",
      projectName: "Southern Corridor",
      status: "In Service",
      driver: "Sami Halim",
      mileageKm: 20530,
      lastService: "2025-04-30",
      nextService: "2025-06-05",
      efficiency: 3.03,
    },
  ];

  const operationsPulse = [
    { label: "Active Projects", value: portfolio.length, delta: "2 flagged items", icon: "🏗️" },
    { label: "Fleet Ready", value: "63 / 72", delta: "6 in workshop", icon: "🚛" },
    { label: "Fuel (L / week)", value: `${fuelSummary.latestWeek.liters.toLocaleString()}`, delta: `${fuelSummary.variancePct}% vs plan`, icon: "⛽" },
    { label: "Fleet Efficiency", value: `${currentEfficiency.toFixed(2)} km/L`, delta: `${averageEfficiency} km/L avg`, icon: "🛢️" },
  ];

  const projectDetails = [
    { id: "p1", name: "Northern Expansion", owner: "Project A", status: "On Track", budget: "SAR 1.2M", completion: 65 },
    { id: "p2", name: "Eastern Logistics Hub", owner: "Project B", status: "At Risk", budget: "SAR 900K", completion: 42 },
    { id: "p3", name: "Urban Delivery", owner: "Project C", status: "Delayed", budget: "SAR 750K", completion: 28 },
    { id: "p4", name: "Retail Fleet Upgrade", owner: "Project D", status: "On Track", budget: "SAR 600K", completion: 78 },
  ];

  const maintenanceSummary = [
    { month: "Jan", scheduled: 12, completed: 11, overdue: 1 },
    { month: "Feb", scheduled: 14, completed: 13, overdue: 1 },
    { month: "Mar", scheduled: 16, completed: 15, overdue: 0 },
    { month: "Apr", scheduled: 12, completed: 10, overdue: 2 },
  ];

  const employees = [
    { id: "sup-01", name: "Ali Supervisor", role: "Supervisor", project: "Northern Expansion", status: "Active" },
    { id: "sup-02", name: "Sara Supervisor", role: "Supervisor", project: "Eastern Logistics Hub", status: "Active" },
    { id: "pm-01", name: "Omar Project Manager", role: "Project Manager", project: "Urban Delivery", status: "Active" },
    { id: "pm-02", name: "Laila Project Manager", role: "Project Manager", project: "Retail Fleet Upgrade", status: "On Leave" },
    { id: "drv-01", name: "Ahmed Driver", role: "Driver", project: "Northern Expansion", status: "On Duty" },
    { id: "drv-02", name: "Omar Driver", role: "Driver", project: "Eastern Logistics Hub", status: "Off Duty" },
  ];

  const filteredEmployees = useMemo(() => {
    if (employeeFilter === "all") {
      return employees;
    }
    return employees.filter((employee) => employee.role.toLowerCase().includes(employeeFilter));
  }, [employeeFilter, employees]);

  const filteredProjects = useMemo(() => {
    if (projectFilter === "all") return projectDetails;
    return projectDetails.filter((project) => project.status === projectFilter);
  }, [projectFilter, projectDetails]);

  const filteredProjectFuelBreakdown = useMemo(() => {
    if (fuelProjectFilter === "all") return projectFuelBreakdown;
    return projectFuelBreakdown.filter((project) => project.id === fuelProjectFilter);
  }, [fuelProjectFilter, projectFuelBreakdown]);

  const availableTrucks = useMemo(() => {
    if (fuelProjectFilter === "all") {
      return projectFuelBreakdown.flatMap((project) =>
        project.trucks.map((truck) => ({ ...truck, projectId: project.id })),
      );
    }
    const selected = projectFuelBreakdown.find((project) => project.id === fuelProjectFilter);
    return selected ? selected.trucks.map((truck) => ({ ...truck, projectId: selected.id })) : [];
  }, [fuelProjectFilter, projectFuelBreakdown]);

  const filteredTruckLogs = useMemo(() => {
    if (fuelTruckFilter === "all") return truckFuelLogs;
    return truckFuelLogs.filter((log) => log.truck === fuelTruckFilter);
  }, [fuelTruckFilter, truckFuelLogs]);

  const filteredFleetTrucks = useMemo(() => {
    if (fleetProjectFilter === "all") return fleetTrucks;
    return fleetTrucks.filter((truck) => truck.projectId === fleetProjectFilter);
  }, [fleetProjectFilter, fleetTrucks]);

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-50 to-gray-100 text-gray-900">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 bg-black text-white flex-col p-6 shadow-2xl rounded-r-3xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-gray-900 to-black flex items-center justify-center text-white font-bold text-xl shadow-lg border border-gray-700">
            M
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Manager Panel</h2>
            <p className="text-sm text-gray-400">Maqayees System</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              className={`flex items-center w-full px-4 py-2.5 rounded-lg text-left font-medium transition-all duration-200 ${
                activeTab === item.key ? "bg-white text-black shadow-inner" : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <span className="mr-3 text-lg">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <button
          className="mt-auto bg-gray-800 hover:bg-gray-700 text-white py-2.5 px-4 rounded-lg font-semibold text-sm shadow-md transition"
          onClick={() => alert("TODO: Implement logout")}
        >
          Logout
        </button>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-black text-white z-20 flex justify-between items-center px-4 py-3 shadow-md">
        <h2 className="text-lg font-semibold">Manager Panel</h2>
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

      {/* Main */}
      <main className="flex-1 p-6 md:p-10 mt-16 md:mt-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {activeTab === "overview" && (
              <>
                <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-bold text-black">Operational Snapshot</h1>
                    <p className="text-gray-600 text-sm">
                      Welcome back, <span className="font-semibold text-black">{manager.name.split(" ")[0]}</span>. Here is what is happening across the fleet today.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button className="bg-black hover:bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-md transition">
                      Refresh Data
                    </button>
                    <button className="bg-white hover:bg-gray-100 text-black border border-gray-300 px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition">
                      Export Summary
                    </button>
                  </div>
                </header>

                <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                  {operationsPulse.map((stat) => (
                    <StatCard key={stat.label} {...stat} />
                  ))}
                </section>

                <section className="grid grid-cols-1 gap-6">
                  <Card title="Projects, Fleet, and People">
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                      {portfolio.map((project) => (
                        <div key={project.id} className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs uppercase text-gray-400">Managed by {project.manager}</p>
                              <h3 className="text-lg font-semibold text-black">{project.name}</h3>
                            </div>
                            <span className="rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-700">
                              {project.completion}%
                            </span>
                          </div>
                          <div className="mt-3">
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span>Completion</span>
                              <span>{project.completion}%</span>
                            </div>
                            <div className="mt-1 h-2 rounded-full bg-gray-100">
                              <div className="h-full rounded-full bg-black" style={{ width: `${project.completion}%` }} />
                            </div>
                          </div>
                          <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-gray-600">
                            <div>
                              <p className="text-gray-400 uppercase tracking-wide">Fleet ready</p>
                              <p className="font-semibold text-black">{project.fleetReady}</p>
                            </div>
                            <div>
                              <p className="text-gray-400 uppercase tracking-wide">Drivers</p>
                              <p className="font-semibold text-black">{project.drivers}</p>
                            </div>
                            <div>
                              <p className="text-gray-400 uppercase tracking-wide">Fuel variance</p>
                              <p className={project.fuelVariance >= 0 ? "text-amber-600 font-semibold" : "text-green-600 font-semibold"}>
                                {project.fuelVariance >= 0 ? "+" : ""}
                                {project.fuelVariance}%
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-400 uppercase tracking-wide">Maintenance</p>
                              <p className="font-semibold text-black">{project.maintenanceOpen} open</p>
                            </div>
                          </div>
                          {project.notes.length ? (
                            <ul className="mt-3 space-y-1 text-xs text-gray-500">
                            {project.notes.map((note, noteIndex) => (
                              <li key={`${project.id}-${noteIndex}`} className="flex items-center gap-1">
                                <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                                {note}
                              </li>
                            ))}
                          </ul>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </Card>
                </section>

                <Card title="Fuel Performance by Project">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <label className="block text-gray-700 font-medium">Project:</label>
                      <select
                        value={fuelProjectFilter}
                        onChange={(event) => {
                          setFuelProjectFilter(event.target.value);
                          setFuelTruckFilter("all");
                        }}
                        className="border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-black text-sm"
                      >
                        <option value="all">All projects</option>
                        {projectFuelBreakdown.map((project) => (
                          <option key={project.id} value={project.id}>
                            {project.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <label className="block text-gray-700 font-medium">Truck:</label>
                      <select
                        value={fuelTruckFilter}
                        onChange={(event) => setFuelTruckFilter(event.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-black text-sm"
                        disabled={!availableTrucks.length}
                      >
                        <option value="all">All trucks</option>
                        {availableTrucks.map((truck) => (
                              <option key={`${truck.projectId}-${truck.id}`} value={truck.id}>
                                {truck.id}
                              </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-800 border border-gray-200 rounded-2xl overflow-hidden">
                      <thead className="bg-gray-100 text-gray-900 text-xs uppercase tracking-wide">
                        <tr>
                          <th className="py-3 px-4">Project</th>
                          <th className="py-3 px-4">Liters vs Plan</th>
                          <th className="py-3 px-4">Distance (km)</th>
                          <th className="py-3 px-4">km/L</th>
                          <th className="py-3 px-4">Fuel Cost (SAR)</th>
                          <th className="py-3 px-4">Top Trucks</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredProjectFuelBreakdown.map((item) => (
                          <tr key={item.id} className="border-b last:border-none hover:bg-gray-50 transition">
                            <td className="py-3 px-4 font-semibold text-black">{item.name}</td>
                            <td className="py-3 px-4">
                              {item.liters.toLocaleString()} L{" "}
                              <span
                                className={`text-xs font-semibold ${
                                  item.liters >= item.target ? "text-amber-600" : "text-green-600"
                                }`}
                              >
                                ({item.liters >= item.target ? "+" : ""}
                                {(item.liters - item.target).toLocaleString()} L vs {item.target.toLocaleString()} L)
                              </span>
                            </td>
                            <td className="py-3 px-4">{item.distanceKm.toLocaleString()} km</td>
                            <td className="py-3 px-4 font-semibold text-black">{item.kmPerL} km/L</td>
                            <td className="py-3 px-4">{item.costSar.toLocaleString()} SAR</td>
                            <td className="py-3 px-4 text-xs text-gray-600 space-y-1">
                              {item.trucks.map((truck) => (
                                <div key={`${item.id}-${truck.id}`} className="flex items-center justify-between">
                                  <span className="font-semibold text-gray-800">{truck.id}</span>
                                  <span>{truck.kmPerL} km/L</span>
                                </div>
                              ))}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>

                <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                  <Card title="Fuel Consumption vs Plan (L)">
                    <p className="text-xs uppercase tracking-wide text-gray-400 mb-3">
                      Rolling average {fuelSummary.rollingAverage.toLocaleString()} L • week {fuelSummary.latestWeek.week}
                    </p>
                    <ResponsiveContainer width="100%" height={240}>
                      <LineChart data={fuelPerformance}>
                        <XAxis dataKey="week" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="liters" stroke="#111827" strokeWidth={3} dot={{ r: 4 }} name="Actual (L)" />
                        <Line type="monotone" dataKey="target" stroke="#9ca3af" strokeDasharray="4 4" name="Plan (L)" />
                      </LineChart>
                    </ResponsiveContainer>
                  </Card>

                  <Card title="Fuel Insights by Project">
                    <div className="space-y-3 text-sm text-gray-700">
                      {filteredProjectFuelBreakdown.map((item) => (
                        <div key={item.id} className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                          <div className="flex items-center justify-between">
                            <p className="font-semibold text-black">{item.name}</p>
                            <span className="text-xs text-gray-500">{item.liters.toLocaleString()} L</span>
                          </div>
                          <p className="text-xs text-gray-500">Efficiency {item.kmPerL} km/L</p>
                          <p
                            className={`mt-1 text-sm font-semibold ${
                              item.liters >= item.target ? "text-amber-600" : "text-green-600"
                            }`}
                          >
                            {item.liters >= item.target ? "+" : ""}
                            {(((item.liters - item.target) / item.target) * 100).toFixed(1)}% vs plan
                          </p>
                        </div>
                      ))}
                    </div>
                  </Card>
                </section>

                <Card title="Fleet Efficiency (km/L)">
                  <p className="text-xs uppercase tracking-wide text-gray-400 mb-3">
                    Calculated from driver shift odometers vs refuel volume
                  </p>
                  <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={efficiencyTrend}>
                      <XAxis dataKey="week" />
                      <YAxis domain={[0, efficiencyYAxisMax]} />
                      <Tooltip formatter={(value) => `${value} km/L`} />
                      <Legend />
                      <Line type="monotone" dataKey="efficiency" stroke="#16a34a" strokeWidth={3} dot={{ r: 4 }} name="km/L" />
                    </LineChart>
                  </ResponsiveContainer>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-gray-700">
                    {efficiencyTrend.map((entry) => (
                      <div
                        key={entry.week}
                        className="rounded-2xl border border-gray-100 bg-gray-50 px-3 py-2 flex items-center justify-between"
                      >
                        <span className="font-semibold text-black">{entry.week}</span>
                        <span className="text-xs text-gray-600">{entry.efficiency} km/L</span>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card title="Recent Truck Fuel Logs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-800 border border-gray-200 rounded-2xl overflow-hidden">
                      <thead className="bg-gray-100 text-gray-900 text-xs uppercase tracking-wide">
                        <tr>
                          <th className="py-3 px-4">Truck</th>
                          <th className="py-3 px-4">Project</th>
                          <th className="py-3 px-4">Start km</th>
                          <th className="py-3 px-4">End km</th>
                          <th className="py-3 px-4">Liters</th>
                          <th className="py-3 px-4">km/L</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTruckLogs.map((log) => (
                          <tr key={`${log.truck}-${log.project}`} className="border-b last:border-none hover:bg-gray-50 transition">
                            <td className="py-3 px-4 font-semibold text-black">{log.truck}</td>
                            <td className="py-3 px-4">{log.project}</td>
                            <td className="py-3 px-4">{log.startKm.toLocaleString()}</td>
                            <td className="py-3 px-4">{log.endKm.toLocaleString()}</td>
                            <td className="py-3 px-4">{log.liters}</td>
                            <td className="py-3 px-4 font-semibold">{log.efficiency} km/L</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>

                <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                  <Card title="Maintenance Backlog">
                    <div className="space-y-3 text-sm text-gray-700">
                      {maintenanceBacklog.map((item) => (
                        <div key={item.asset} className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                          <div className="flex items-center justify-between">
                            <p className="font-semibold text-black">{item.asset}</p>
                            <span
                              className={`text-xs font-semibold uppercase tracking-wide ${
                                item.priority === "High"
                                  ? "text-red-600"
                                  : item.priority === "Medium"
                                  ? "text-amber-600"
                                  : "text-gray-500"
                              }`}
                            >
                              {item.priority}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">{item.type}</p>
                          <p className="mt-1 text-sm text-gray-700">{item.status}</p>
                        </div>
                      ))}
                    </div>
                  </Card>

                  <Card title="Fleet Snapshot">
                    <div className="grid grid-cols-2 gap-3">
                      {fleetAtGlance.map((item) => (
                        <div key={item.label} className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
                          <p className="text-xs uppercase tracking-wide text-gray-400">{item.label}</p>
                          <p className="mt-1 text-2xl font-semibold text-black">{item.value}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-6">
                      <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={maintenanceSummary}>
                          <defs>
                            <linearGradient id="fleetMaint" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#111827" stopOpacity={0.8} />
                              <stop offset="95%" stopColor="#111827" stopOpacity={0.1} />
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Area type="monotone" dataKey="overdue" stroke="#dc2626" fill="#dc262620" name="Overdue" />
                          <Area type="monotone" dataKey="scheduled" stroke="#9ca3af" fill="#9ca3af20" name="Scheduled" />
                          <Area type="monotone" dataKey="completed" stroke="#111827" fill="url(#fleetMaint)" name="Completed" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>
                </section>
              </>
            )}

            {activeTab === "projects" && (
              <Card title="Project Oversight">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-800">Filter status:</label>
                    <select
                      value={projectFilter}
                      onChange={(e) => setProjectFilter(e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-black"
                    >
                      <option value="all">All</option>
                      <option value="On Track">On Track</option>
                      <option value="At Risk">At Risk</option>
                      <option value="Delayed">Delayed</option>
                    </select>
                  </div>
                  <button className="bg-black hover:bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-md transition">
                    Schedule Review
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left text-gray-800 border border-gray-200 rounded-lg overflow-hidden">
                    <thead className="bg-gray-100 text-gray-900">
                      <tr>
                        <th className="py-3 px-4 font-medium">Program</th>
                        <th className="py-3 px-4 font-medium">Business Owner</th>
                        <th className="py-3 px-4 font-medium">Status</th>
                        <th className="py-3 px-4 font-medium">Budget</th>
                        <th className="py-3 px-4 font-medium">Completion</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProjects.map((project) => (
                        <tr key={project.id} className="border-b hover:bg-gray-50 transition">
                          <td className="py-2.5 px-4 font-medium text-black">{project.name}</td>
                          <td className="py-2.5 px-4">{project.owner}</td>
                          <td className="py-2.5 px-4">
                            <span
                              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${
                                project.status === "On Track"
                                  ? "bg-green-100 text-green-700"
                                  : project.status === "At Risk"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {project.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-4">{project.budget}</td>
                          <td className="py-2.5 px-4">
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div
                                className={`h-2.5 rounded-full ${
                                  project.completion >= 70 ? "bg-green-500" : project.completion >= 40 ? "bg-yellow-500" : "bg-red-500"
                                }`}
                                style={{ width: `${project.completion}%` }}
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

            {activeTab === "fleet" && (
              <Card title="Fleet Inventory">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-800">Project:</label>
                    <select
                      value={fleetProjectFilter}
                      onChange={(event) => setFleetProjectFilter(event.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-black"
                    >
                      <option value="all">All Projects</option>
                      {projectFuelBreakdown.map((project) => (
                        <option key={project.id} value={project.id}>
                          {project.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    Showing {filteredFleetTrucks.length} truck{filteredFleetTrucks.length === 1 ? "" : "s"}
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left text-gray-800 border border-gray-200 rounded-2xl overflow-hidden">
                    <thead className="bg-gray-100 text-gray-900 text-xs uppercase tracking-wide">
                      <tr>
                        <th className="py-3 px-4">Truck</th>
                        <th className="py-3 px-4">Plate / Model</th>
                        <th className="py-3 px-4">Project</th>
                        <th className="py-3 px-4">Driver</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Mileage</th>
                        <th className="py-3 px-4">km/L</th>
                        <th className="py-3 px-4">Service</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredFleetTrucks.map((truck) => (
                        <tr key={truck.id} className="border-b last:border-none hover:bg-gray-50 transition">
                          <td className="py-3 px-4 font-semibold text-black">{truck.id}</td>
                          <td className="py-3 px-4">
                            <p className="font-medium text-gray-900">{truck.plate}</p>
                            <p className="text-xs text-gray-500">{truck.model}</p>
                          </td>
                          <td className="py-3 px-4">{truck.projectName}</td>
                          <td className="py-3 px-4">{truck.driver}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${
                                truck.status === "In Service"
                                  ? "bg-green-100 text-green-700"
                                  : truck.status === "Maintenance"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-gray-200 text-gray-800"
                              }`}
                            >
                              {truck.status}
                            </span>
                          </td>
                          <td className="py-3 px-4">{truck.mileageKm.toLocaleString()} km</td>
                          <td className="py-3 px-4">{truck.efficiency} km/L</td>
                          <td className="py-3 px-4 text-xs text-gray-600">
                            Last: {truck.lastService}
                            <br />
                            Next: {truck.nextService}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

            {activeTab === "employees" && (
              <Card title="People Overview">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-800">View:</label>
                    <select
                      value={employeeFilter}
                      onChange={(e) => setEmployeeFilter(e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-black"
                    >
                      <option value="all">All Roles</option>
                      <option value="supervisor">Supervisors</option>
                      <option value="project manager">Project Managers</option>
                      <option value="driver">Drivers</option>
                    </select>
                  </div>
                  <button className="bg-black hover:bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-md transition">
                    Add Personnel
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left text-gray-800 border border-gray-200 rounded-lg overflow-hidden">
                    <thead className="bg-gray-100 text-gray-900">
                      <tr>
                        <th className="py-3 px-4 font-medium">Name</th>
                        <th className="py-3 px-4 font-medium">Role</th>
                        <th className="py-3 px-4 font-medium">Assigned Project</th>
                        <th className="py-3 px-4 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEmployees.map((employee) => (
                        <tr key={employee.id} className="border-b hover:bg-gray-50 transition">
                          <td className="py-2.5 px-4 font-medium text-black">{employee.name}</td>
                          <td className="py-2.5 px-4">{employee.role}</td>
                          <td className="py-2.5 px-4">{employee.project}</td>
                          <td className="py-2.5 px-4">
                            <span
                              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${
                                employee.status === "Active" || employee.status === "On Duty"
                                  ? "bg-green-100 text-green-700"
                                  : employee.status === "On Leave"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-gray-200 text-gray-800"
                              }`}
                            >
                              {employee.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

            {activeTab === "profile" && (
              <Card title="Manager Profile">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-800">
                  <Field label="Name" value={manager.name} />
                  <Field label="Email" value={manager.email} />
                  <Field label="Phone" value={manager.phone} />
                  <Field label="Role" value={manager.role} />
                  <Field label="Admin Rights" value="Global system access" />
                  <Field label="Last Login" value="Today, 08:15 AM" />
                </div>
              </Card>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

function StatCard({ label, value, delta, icon }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 hover:shadow-md transition">
      <div className="flex items-center justify-between mb-4">
        <span className="text-lg">{icon}</span>
        <span className="text-xs uppercase tracking-wide text-gray-500">{label}</span>
      </div>
      <p className="text-2xl font-semibold text-black">{value}</p>
      <p className="text-xs text-gray-600 mt-1">{delta}</p>
    </div>
  );
}

function Card({ title, children, className = "" }) {
  return (
    <section className={`bg-white border border-gray-200 rounded-2xl shadow-sm p-6 hover:shadow-md transition ${className}`}>
      <h2 className="text-lg font-semibold mb-4 text-black border-b border-gray-100 pb-2">{title}</h2>
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
