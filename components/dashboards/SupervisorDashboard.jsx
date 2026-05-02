// app/dashboard/(role)/(supervisor)/page.jsx
"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
import LogoutButton from "@/components/ui/LogoutButton";

const WALKAROUND_ITEMS = {
  before: [
    { id: "before-1", number: 1, label: "Check Engine & Hyd. Oil level", secondary: "آئل اور ہائیڈرولک آئل کی سطح چیک کریں" },
    { id: "before-2", number: 2, label: "Check Coolant level", secondary: "کولنٹ کی سطح چیک کریں" },
    { id: "before-3", number: 3, label: "Check AdBlue level", secondary: "ایڈ بلو کی سطح چیک کریں" },
    { id: "before-4", number: 4, label: "Check for missing tanks caps", secondary: "ٹینک کے ڈھکن چیک کریں" },
    { id: "before-5", number: 5, label: "Check for any leak", secondary: "کسی بھی لیک کے لیے چیک کریں" },
    { id: "before-6", number: 6, label: "Check all the lights", secondary: "تمام لائٹس چیک کریں" },
    { id: "before-7", number: 7, label: "Check vehicle structure & suspension cracks & loose bolts", secondary: "گاڑی کی ساخت اور سسپنشن میں دراڑیں اور ڈھیلے بولٹ چیک کریں" },
    { id: "before-8", number: 8, label: "Check for loose wiring", secondary: "ڈھیلی وائرنگ چیک کریں" },
    { id: "before-9", number: 9, label: "Check all the tires & bolts", secondary: "تمام ٹائروں اور بولٹ کو چیک کریں" },
  ],
  after: [
    { id: "after-10", number: 10, label: "Check the fuel level", secondary: "ایندھن کی سطح چیک کریں" },
    { id: "after-11", number: 11, label: "Check the dashboard warning lights", secondary: "ڈیش بورڈ وارننگ لائٹس چیک کریں" },
    { id: "after-12", number: 12, label: "Check the mirror, wiper, and windshield glass", secondary: "شیشہ، وائپر اور ونڈ اسکرین چیک کریں" },
    { id: "after-13", number: 13, label: "Check the seat belt function", secondary: "سیٹ بیلٹ کی فعالیت چیک کریں" },
    { id: "after-14", number: 14, label: "Check the horn", secondary: "ہارن چیک کریں" },
    { id: "after-15", number: 15, label: "Check the air brake pressure", secondary: "ایئر بریک پریشر چیک کریں" },
    { id: "after-16", number: 16, label: "Test the brake performance", secondary: "بریک کی کارکردگی چیک کریں" },
    { id: "after-17", number: 17, label: "Test the steering performance", secondary: "اسٹیئرنگ کی کارکردگی چیک کریں" },
    { id: "after-18", number: 18, label: "Check for excessive exhaust smoke", secondary: "ایگزاسٹ کے دھوئیں کو چیک کریں" },
    { id: "after-19", number: 19, label: "Check the availability of the first-aid kit & fire extinguisher", secondary: "فرسٹ ایڈ اور فائر بجھانے کا آلہ چیک کریں" },
  ],
};

const escapeHtml = (value) => {
  if (!value) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

const formatChecklistDateTime = (value) => {
  if (!value) return "—";
  return value.replace("T", " ");
};

function openChecklistPdf(driverName, checklist) {
  if (typeof window === "undefined") return;
  const popup = window.open("", "checklistWindow", "width=900,height=1200");
  if (!popup) return;
  popup.opener = null;

  const record = checklist?.record || {};
  const info = record.checklistInfo || {};
  const checks = record.walkaroundChecks || {};

  const shiftLabel = info.shift === "day" ? "Day Shift" : info.shift === "night" ? "Night Shift" : "—";

  const infoRows = [
    ["Driver ID", info.driverId || "—"],
    ["Driver Name", info.driverName || driverName || "—"],
    ["Plate No", info.plateNo || "—"],
    ["Shift", shiftLabel],
    ["Date & Time", formatChecklistDateTime(info.checklistDateTime)],
    ["Current Mileage", info.currentMileage || "—"],
  ];

  const infoTableRows = infoRows
    .map(([label, value]) => `<tr><td>${escapeHtml(label)}</td><td>${escapeHtml(value)}</td></tr>`)
    .join("");

  const buildSection = (title, items) => `
    <h3>${escapeHtml(title)}</h3>
    <table class="items">
      <thead><tr><th>#</th><th>Inspection Item</th><th>Status</th></tr></thead>
      <tbody>
        ${items.map((item) => `
          <tr>
            <td>${item.number}</td>
            <td>
              <div>${escapeHtml(item.label)}</div>
              ${item.secondary ? `<div class="secondary">${escapeHtml(item.secondary)}</div>` : ""}
            </td>
            <td class="status">${checks[item.id] ? "☑" : "☐"}</td>
          </tr>`).join("")}
      </tbody>
    </table>`;

  popup.document.write(`<!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Daily Vehicle Walkaround Checklist — ${escapeHtml(driverName)}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 32px; color: #111; }
          h1 { font-size: 24px; margin-bottom: 4px; }
          h3 { font-size: 16px; margin: 20px 0 8px; }
          table { width: 100%; border-collapse: collapse; }
          table.meta tr td:first-child { width: 35%; font-weight: 600; }
          table.meta td { border: 1px solid #e5e7eb; padding: 6px 10px; font-size: 13px; }
          table.items th { text-align: left; background: #f3f4f6; font-size: 12px; }
          table.items th, table.items td { border: 1px solid #e5e7eb; padding: 6px 8px; }
          table.items td.status { text-align: center; font-size: 18px; }
          table.items td div.secondary { font-size: 11px; color: #6b7280; margin-top: 4px; }
          .note { border: 1px solid #e5e7eb; padding: 12px; min-height: 80px; margin-top: 24px; }
          .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 24px; }
          .signature { border-top: 1px solid #111; padding-top: 8px; font-size: 13px; }
          .footer { margin-top: 32px; font-size: 12px; color: #6b7280; }
        </style>
      </head>
      <body>
        <h1>Daily Vehicle Walkaround Checklist</h1>
        <p>Check each inspection item before moving.</p>
        <table class="meta">${infoTableRows}</table>
        ${buildSection("Before Engine Start", WALKAROUND_ITEMS.before)}
        ${buildSection("After Engine Start", WALKAROUND_ITEMS.after)}
        <div class="note">
          <strong>Pre-Trip Defects</strong>
          <p>${escapeHtml(info.preTripDefects || "—")}</p>
        </div>
        <div class="signatures">
          <div class="signature">Dispatcher Signature<br/>${escapeHtml(info.dispatcher || "—")}</div>
          <div class="signature">Driver Signature<br/>${escapeHtml(info.driverSignature || "—")}</div>
        </div>
        <p class="footer">Generated: ${escapeHtml(new Date().toLocaleString())} &nbsp;|&nbsp; Checklist Date: ${escapeHtml(new Date(checklist.updatedAt).toLocaleString())}</p>
      </body>
    </html>`);
  popup.document.close();
  popup.focus();
  popup.print();
}

export default function SupervisorDashboard() {
  const [activeTab, setActiveTab] = useState("monitor");
  const [selectedTruck, setSelectedTruck] = useState("all");
  const [dateFilter, setDateFilter] = useState({ from: "", to: "" });
  const [assignment, setAssignment] = useState({ driver: "", truck: "" });
  const [message, setMessage] = useState("");
  const [drivers, setDrivers] = useState([]);
  const [trucks, setTrucks] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [monitorLoading, setMonitorLoading] = useState(true);
  const [monitorError, setMonitorError] = useState("");
  const [monitorData, setMonitorData] = useState({
    driverStatus: [
      { name: "On Duty", value: 0 },
      { name: "Off Duty", value: 0 },
    ],
    weeklyMileage: [],
    weeklyFuel: [],
    activeDrivers: [],
  });
  const [maintenanceRecords, setMaintenanceRecords] = useState([]);
  const [maintenanceLoading, setMaintenanceLoading] = useState(true);
  const [maintenanceError, setMaintenanceError] = useState("");

  // Fuel logs state
  const [fuelLogs, setFuelLogs] = useState([]);
  const [fuelLogsLoading, setFuelLogsLoading] = useState(false);
  const [fuelLogsError, setFuelLogsError] = useState("");
  const [fuelLogsFilter, setFuelLogsFilter] = useState({ vehicleId: "", from: "", to: "" });

  // 🔹 Report Form States
  const [formData, setFormData] = useState({
    truckId: "",
    currentOdometer: "",
    litersFilled: "",
    fuelCost: "",
    notes: "",
    photo: null,
  });
  const [previewUrl, setPreviewUrl] = useState(null);
  const [lastOdometerByTruck, setLastOdometerByTruck] = useState({});
  const [fuelInsights, setFuelInsights] = useState([]);
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportMessage, setReportMessage] = useState("");

  const handleReportChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData({ ...formData, photo: file });
    setPreviewUrl(URL.createObjectURL(file));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setReportMessage("");
    if (!formData.truckId) {
      setReportMessage("Please select a truck before submitting the report.");
      return;
    }

    setReportSubmitting(true);
    try {
      const response = await fetch("/api/fuel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          vehicleId: formData.truckId,
          currentOdometer: formData.currentOdometer,
          litersFilled: formData.litersFilled,
          fuelCost: formData.fuelCost,
          notes: formData.notes,
          date: new Date().toISOString(),
        }),
      });
      const payload = await response.json();
      if (!response.ok || !payload?.success) {
        throw new Error(payload?.error || "Failed to submit daily fuel report.");
      }

      const summary = payload.summary || {};
      if (summary.distanceCoveredKm !== null && summary.distanceCoveredKm !== undefined) {
        const insight = {
          id: Date.now(),
          truckId: formData.truckId,
          truckLabel: summary.truckLabel || "Truck",
          from: summary.startKmHr,
          to: summary.endKmHr,
          distance: Number(summary.distanceCoveredKm).toFixed(1),
          liters: Number(formData.litersFilled).toFixed(1),
          efficiency:
            summary.efficiencyLtrPerKm === null || summary.efficiencyLtrPerKm === undefined
              ? "0.00"
              : Number(summary.efficiencyLtrPerKm).toFixed(2),
        };
        setFuelInsights((prev) => [insight, ...prev].slice(0, 4));
      }

      setLastOdometerByTruck((prev) => ({
        ...prev,
        [formData.truckId]: Number(formData.currentOdometer),
      }));
      setFormData((prev) => ({
        ...prev,
        currentOdometer: "",
        litersFilled: "",
        fuelCost: "",
        notes: "",
        photo: null,
      }));
      setPreviewUrl(null);
      setReportMessage("Daily fuel report submitted successfully.");
      await loadMonitorData();
    } catch (error) {
      setReportMessage(error.message || "Failed to submit daily fuel report.");
    } finally {
      setReportSubmitting(false);
    }
  };

  const supervisor = {
    name: "Mohammed Supervisor",
    email: "supervisor@maqayees.com",
    phone: "0559876543",
    role: "Fleet Supervisor",
  };

  const navItems = [
    { key: "monitor", label: "Monitor", icon: "📊" },
    { key: "assign", label: "Assign Driver", icon: "🔗" },
    { key: "report", label: "Daily Report", icon: "⛽" },
    { key: "fuellogs", label: "Fuel Logs", icon: "🪣" },
    { key: "maintenance", label: "Maintenance", icon: "🛠️" },
    { key: "profile", label: "Profile", icon: "👤" },
  ];

  const loadAssignmentData = useCallback(async () => {
    setDataLoading(true);
    setDataError("");
    try {
      const [driversResponse, trucksResponse] = await Promise.all([
        fetch("/api/admin/users?role=driver&page=1&pageSize=100", { cache: "no-store" }),
        fetch("/api/admin/trucks", { cache: "no-store" }),
      ]);

      const [driversPayload, trucksPayload] = await Promise.all([
        driversResponse.json(),
        trucksResponse.json(),
      ]);

      if (!driversResponse.ok || !driversPayload?.success) {
        throw new Error(driversPayload?.error || "Failed to load drivers.");
      }
      if (!trucksResponse.ok || !trucksPayload?.success) {
        throw new Error(trucksPayload?.error || "Failed to load trucks.");
      }

      setDrivers(Array.isArray(driversPayload.users) ? driversPayload.users : []);
      setTrucks(
        Array.isArray(trucksPayload.vehicles)
          ? trucksPayload.vehicles.map((vehicle) => ({
              id: vehicle.id,
              plate: vehicle.plateNumber,
              model: vehicle.model,
              brand: vehicle.brand,
              driverName: vehicle.driverName || "",
            }))
          : []
      );
    } catch (error) {
      setDataError(error.message || "Failed to load assignment data.");
      setDrivers([]);
      setTrucks([]);
    } finally {
      setDataLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAssignmentData();
  }, [loadAssignmentData]);

  const loadMonitorData = useCallback(async () => {
    setMonitorLoading(true);
    setMonitorError("");
    try {
      const params = new URLSearchParams();
      if (selectedTruck !== "all") params.set("truckId", selectedTruck);
      if (dateFilter.from) params.set("from", dateFilter.from);
      if (dateFilter.to) params.set("to", dateFilter.to);
      const query = params.toString();
      const response = await fetch(`/api/supervisor/monitor${query ? `?${query}` : ""}`, { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok || !payload?.success) {
        throw new Error(payload?.error || "Failed to load monitor data.");
      }

      setMonitorData({
        driverStatus: Array.isArray(payload.data?.driverStatus) ? payload.data.driverStatus : [],
        weeklyMileage: Array.isArray(payload.data?.weeklyMileage) ? payload.data.weeklyMileage : [],
        weeklyFuel: Array.isArray(payload.data?.weeklyFuel) ? payload.data.weeklyFuel : [],
        activeDrivers: Array.isArray(payload.data?.activeDrivers) ? payload.data.activeDrivers : [],
      });
    } catch (error) {
      setMonitorError(error.message || "Failed to load monitor data.");
      setMonitorData((prev) => ({ ...prev, activeDrivers: [] }));
    } finally {
      setMonitorLoading(false);
    }
  }, [selectedTruck, dateFilter]);

  useEffect(() => {
    loadMonitorData();
  }, [loadMonitorData]);

  const formatMaintenanceType = (value) => {
    const normalized = String(value || "").trim();
    if (!normalized) return "Inspection";
    return normalized
      .split("_")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  };

  const resolveMaintenanceStatus = (record) => {
    const raw = String(record?.status || "").toLowerCase();
    if (raw === "completed" || raw === "scheduled" || raw === "overdue") {
      return raw.charAt(0).toUpperCase() + raw.slice(1);
    }
    const nextDue = record?.nextDueDate ? new Date(record.nextDueDate) : null;
    if (nextDue && !Number.isNaN(nextDue.getTime())) {
      return nextDue.getTime() < Date.now() ? "Overdue" : "Scheduled";
    }
    return "Completed";
  };

  const loadMaintenanceData = useCallback(async () => {
    setMaintenanceLoading(true);
    setMaintenanceError("");
    try {
      const response = await fetch("/api/maintenance/history", { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok || !payload?.success) {
        throw new Error(payload?.error || "Failed to load maintenance records.");
      }

      const mapped = Array.isArray(payload.history)
        ? payload.history.map((record) => ({
            id: record.id,
            truck: record.vehicle || "--",
            service: formatMaintenanceType(record.type),
            date: record.date || record.resolvedAt,
            status: resolveMaintenanceStatus(record),
            cost: record.cost ? `${record.cost} SAR` : "N/A",
            notes: record.notes || "--",
            jobCard: record.jobCard && typeof record.jobCard === "object" ? record.jobCard : null,
          }))
        : [];

      setMaintenanceRecords(mapped);
    } catch (error) {
      setMaintenanceError(error.message || "Failed to load maintenance records.");
      setMaintenanceRecords([]);
    } finally {
      setMaintenanceLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMaintenanceData();
  }, [loadMaintenanceData]);

  const loadFuelLogs = useCallback(async (filter = {}) => {
    setFuelLogsLoading(true);
    setFuelLogsError("");
    try {
      const params = new URLSearchParams();
      if (filter.vehicleId) params.set("vehicleId", filter.vehicleId);
      if (filter.from) params.set("from", filter.from);
      if (filter.to) params.set("to", filter.to);
      const query = params.toString();
      const res = await fetch(`/api/supervisor/fuel-logs${query ? `?${query}` : ""}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to load fuel logs.");
      setFuelLogs(data.logs);
    } catch (err) {
      setFuelLogsError(err.message || "Failed to load fuel logs.");
    } finally {
      setFuelLogsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "fuellogs") loadFuelLogs(fuelLogsFilter);
  }, [activeTab, loadFuelLogs]);

  const formatTruckLabel = (truck) => {
    const label = `${truck.model} — ${truck.plate}`;
    return label.length > 28 ? `${label.slice(0, 25)}...` : label;
  };

  return (
    <div className="min-h-screen md:flex bg-gradient-to-br from-gray-50 to-gray-100 text-gray-900">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 bg-black text-white flex-col p-6 shadow-2xl rounded-r-3xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-gray-900 to-black flex items-center justify-center text-white font-bold text-xl shadow-lg border border-gray-700">
            S
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">
              Supervisor Panel
            </h2>
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
        <LogoutButton className="mt-auto bg-gray-800 hover:bg-gray-700 text-white py-2.5 px-4 rounded-lg font-semibold text-sm shadow-md transition disabled:opacity-70">
          Logout
        </LogoutButton>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden sticky top-0 z-20 bg-black text-white shadow-md">
        <div className="flex items-center justify-between px-4 py-3">
          <h2 className="text-lg font-semibold">Supervisor Panel</h2>
          <LogoutButton className="bg-gray-800 hover:bg-gray-700 text-white py-1.5 px-3 rounded-lg text-xs font-semibold transition disabled:opacity-70">
            Logout
          </LogoutButton>
        </div>
        <div className="border-t border-white/10 px-3 py-2">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {navItems.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setActiveTab(item.key)}
                className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  activeTab === item.key ? "bg-white text-black" : "bg-gray-800 text-gray-200"
                }`}
              >
                {item.icon} {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 md:p-10">
        {dataError && (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {dataError}
          </div>
        )}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {/* Profile */}
            {activeTab === "profile" && (
              <Card title="Supervisor Profile">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-800">
                  <Field label="Name" value={supervisor.name} />
                  <Field label="Email" value={supervisor.email} />
                  <Field label="Phone" value={supervisor.phone} />
                  <Field label="Role" value={supervisor.role} />
                </div>
              </Card>
            )}

            {/* Monitor */}
            {activeTab === "monitor" && (
              <MonitorTab
                trucks={trucks}
                selectedTruck={selectedTruck}
                setSelectedTruck={setSelectedTruck}
                dateFilter={dateFilter}
                setDateFilter={setDateFilter}
                formatTruckLabel={formatTruckLabel}
                monitorData={monitorData}
                monitorLoading={monitorLoading}
                monitorError={monitorError}
              />
            )}

            {/* Assign */}
            {activeTab === "assign" && (
              <Card title="Assign Driver to Truck">
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!assignment.driver || !assignment.truck) {
                      setMessage("Please select both a driver and a truck.");
                      return;
                    }
                    setAssigning(true);
                    try {
                      const response = await fetch(`/api/trucks/${assignment.truck}`, {
                        method: "PUT",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ driverId: assignment.driver }),
                      });
                      const payload = await response.json();
                      if (!response.ok || !payload?.success) {
                        throw new Error(payload?.error || "Failed to assign driver.");
                      }

                      const selectedDriver = drivers.find((d) => d.id === assignment.driver);
                      const selectedTruckItem = trucks.find((t) => t.id === assignment.truck);
                      setMessage(
                        `${selectedDriver?.name || "Driver"} assigned to ${selectedTruckItem?.plate || "truck"} successfully.`
                      );
                      setAssignment({ driver: "", truck: "" });
                      setTrucks((prev) =>
                        prev.map((truck) =>
                          truck.id === assignment.truck
                            ? { ...truck, driverName: selectedDriver?.name || "" }
                            : truck
                        )
                      );
                    } catch (error) {
                      setMessage(error.message || "Failed to assign driver.");
                    } finally {
                      setAssigning(false);
                    }
                  }}
                  className="space-y-4 text-sm"
                >
                  <Select
                    label="Select Driver"
                    value={assignment.driver}
                    onChange={(e) =>
                      setAssignment((p) => ({ ...p, driver: e.target.value }))
                    }
                    options={drivers.map((d) => ({
                      value: d.id,
                      label: d.iqama ? `${d.name} (${d.iqama})` : d.name,
                    }))}
                    placeholder="-- Choose Driver --"
                  />
                  <Select
                    label="Select Truck"
                    value={assignment.truck}
                    onChange={(e) =>
                      setAssignment((p) => ({ ...p, truck: e.target.value }))
                    }
                    options={trucks.map((t) => ({
                      value: t.id,
                      label: `${t.plate} — ${t.model}`,
                    }))}
                    placeholder="-- Choose Truck --"
                  />

                  <button
                    type="submit"
                    disabled={assigning || dataLoading}
                    className="w-full sm:w-auto bg-black hover:bg-gray-900 text-white px-5 py-2 rounded-lg font-semibold text-sm shadow-md transition"
                  >
                    {assigning ? "Assigning..." : "Assign"}
                  </button>

                  {message && (
                    <p
                      className={`mt-2 text-sm ${
                        message.includes("successfully")
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {message}
                    </p>
                  )}
                </form>
              </Card>
            )}

            {/* Report */}
            {activeTab === "report" && (
              <Card title="⛽ Daily Fuel Report">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-800 mb-1">
                        Truck
                      </label>
                      <select
                        name="truckId"
                        value={formData.truckId}
                        onChange={handleReportChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-black transition"
                        required
                      >
                        <option value="">-- Choose Truck --</option>
                        {trucks.map((truck) => (
                          <option key={truck.id} value={truck.id}>
                            {truck.model} — {truck.plate}
                          </option>
                        ))}
                      </select>
                    </div>
                    <Input
                      label="Current Odometer (KM)"
                      name="currentOdometer"
                      value={formData.currentOdometer}
                      onChange={handleReportChange}
                      type="number"
                      min="0"
                      step="0.1"
                      required
                    />
                    <Input
                      label="Fuel Filled (Liters)"
                      name="litersFilled"
                      value={formData.litersFilled}
                      onChange={handleReportChange}
                      type="number"
                      min="0"
                      step="0.1"
                      required
                    />
                    <Input
                      label="Fuel Cost (SAR)"
                      name="fuelCost"
                      value={formData.fuelCost}
                      onChange={handleReportChange}
                      type="number"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    Record the odometer reading showing right after the fill-up and the liters you added. Each submission builds a fuel consumption history for the truck.
                  </p>

                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-1">
                      Upload Photo (Optional)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="block w-full border border-gray-300 rounded-lg text-sm px-3 py-2"
                    />
                    {previewUrl && (
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-40 object-cover rounded-lg border mt-3"
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-1">
                      Notes
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleReportChange}
                      rows="3"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    />
                  </div>

                  {fuelInsights.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-xs text-gray-500">
                      Add at least two fuel entries to unlock automatic km-per-liter tracking.
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                        Recent Fuel Consumption
                      </p>
                      <ul className="divide-y divide-gray-200">
                        {fuelInsights.map((entry) => (
                          <li
                            key={entry.id}
                            className="py-2 flex flex-wrap items-center justify-between gap-3"
                          >
                            <div>
                              <p className="text-xs font-semibold text-gray-600">
                                {entry.truckLabel || "Truck"}
                              </p>
                              <p className="text-sm font-semibold text-gray-900">
                                {entry.distance} km driven
                              </p>
                              <p className="text-xs text-gray-500">
                                {entry.from} km → {entry.to} km
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-semibold text-gray-900">
                                {entry.efficiency} km/L
                              </p>
                              <p className="text-xs text-gray-500">
                                {entry.liters} L consumed
                              </p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={reportSubmitting}
                      className="w-full sm:w-auto bg-black hover:bg-gray-900 text-white px-5 py-2 rounded-lg text-sm font-semibold shadow-md transition"
                    >
                      {reportSubmitting ? "Submitting..." : "Submit Report"}
                    </button>
                  </div>
                  {reportMessage && (
                    <p className={`text-sm ${reportMessage.includes("successfully") ? "text-green-600" : "text-red-600"}`}>
                      {reportMessage}
                    </p>
                  )}
                </form>
              </Card>
            )}

            {activeTab === "fuellogs" && (
              <FuelLogsTab
                logs={fuelLogs}
                loading={fuelLogsLoading}
                error={fuelLogsError}
                trucks={trucks}
                filter={fuelLogsFilter}
                onFilterChange={(next) => {
                  setFuelLogsFilter(next);
                  loadFuelLogs(next);
                }}
              />
            )}

            {activeTab === "maintenance" && (
              <MaintenanceTab
                records={maintenanceRecords}
                loading={maintenanceLoading}
                error={maintenanceError}
              />
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
    <section className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6 hover:shadow-md transition">
      <h2 className="text-base sm:text-lg font-semibold mb-4 text-black border-b border-gray-100 pb-2">
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

function Select({ label, value, onChange, options, placeholder }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <select
        value={value}
        onChange={onChange}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black"
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function exportToCSV(filename, headers, rows) {
  const escape = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const lines = [headers.map(escape).join(","), ...rows.map((row) => row.map(escape).join(","))];
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/* --- Monitor Tab Extracted --- */
function MonitorTab({
  trucks,
  selectedTruck,
  setSelectedTruck,
  dateFilter,
  setDateFilter,
  formatTruckLabel,
  monitorData,
  monitorLoading,
  monitorError,
}) {
  const [localDate, setLocalDate] = useState({ from: dateFilter.from, to: dateFilter.to });
  const visibleDrivers = monitorData.activeDrivers;

  const weeklyMileage =
    monitorData.weeklyMileage.length > 0
      ? monitorData.weeklyMileage
      : [
          { day: "Sun", mileage: 0 },
          { day: "Mon", mileage: 0 },
          { day: "Tue", mileage: 0 },
          { day: "Wed", mileage: 0 },
          { day: "Thu", mileage: 0 },
          { day: "Fri", mileage: 0 },
          { day: "Sat", mileage: 0 },
        ];

  const weeklyFuel =
    monitorData.weeklyFuel.length > 0
      ? monitorData.weeklyFuel
      : [
          { day: "Sun", fuel: 0 },
          { day: "Mon", fuel: 0 },
          { day: "Tue", fuel: 0 },
          { day: "Wed", fuel: 0 },
          { day: "Thu", fuel: 0 },
          { day: "Fri", fuel: 0 },
          { day: "Sat", fuel: 0 },
        ];

  function handleApplyDateFilter() {
    if (localDate.from && localDate.to && localDate.from > localDate.to) return;
    setDateFilter(localDate);
  }

  function handleResetDateFilter() {
    setLocalDate({ from: "", to: "" });
    setDateFilter({ from: "", to: "" });
  }

  function handleExportDriversCSV() {
    exportToCSV(
      `fleet-drivers-${new Date().toISOString().slice(0, 10)}.csv`,
      ["Driver", "Truck", "Status", "Last Update"],
      visibleDrivers.map((d) => [
        d.name,
        d.truck || "Unassigned",
        d.status,
        d.lastUpdate && d.lastUpdate !== "—" ? new Date(d.lastUpdate).toLocaleString() : "—",
      ])
    );
  }

  function handleExportChartsCSV() {
    const rows = weeklyMileage.map((m, i) => [
      m.day,
      m.mileage,
      weeklyFuel[i]?.fuel ?? 0,
    ]);
    exportToCSV(
      `fleet-weekly-${new Date().toISOString().slice(0, 10)}.csv`,
      ["Day", "Mileage (km)", "Fuel (L)"],
      rows
    );
  }

  const hasDateFilter = dateFilter.from && dateFilter.to;

  return (
    <Card title="Fleet Monitoring">
      <p className="text-gray-600 text-sm mb-4">
        Overview of driver activity and fleet performance
      </p>
      {monitorError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {monitorError}
        </div>
      )}
      {monitorLoading && (
        <div className="mb-4 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-600">
          Loading monitoring data...
        </div>
      )}

      {/* Filters bar */}
      <div className="mb-4 flex flex-wrap gap-3 items-end">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500">Truck</label>
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

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500">From</label>
          <input
            type="date"
            value={localDate.from}
            onChange={(e) => setLocalDate((p) => ({ ...p, from: e.target.value }))}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-black"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500">To</label>
          <input
            type="date"
            value={localDate.to}
            min={localDate.from || undefined}
            onChange={(e) => setLocalDate((p) => ({ ...p, to: e.target.value }))}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-black"
          />
        </div>

        <button
          type="button"
          onClick={handleApplyDateFilter}
          disabled={!localDate.from || !localDate.to}
          className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-40 transition"
        >
          Apply
        </button>

        {hasDateFilter && (
          <button
            type="button"
            onClick={handleResetDateFilter}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
          >
            Reset
          </button>
        )}

        {/* Export buttons */}
        <div className="ml-auto flex gap-2">
          <button
            type="button"
            onClick={handleExportChartsCSV}
            className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100 transition"
          >
            Export Charts CSV
          </button>
          <button
            type="button"
            onClick={handleExportDriversCSV}
            className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100 transition"
          >
            Export Drivers CSV
          </button>
        </div>
      </div>

      {hasDateFilter && (
        <p className="mb-3 text-xs text-gray-500">
          Showing data from <strong>{dateFilter.from}</strong> to <strong>{dateFilter.to}</strong>
        </p>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 mb-8">
        {/* Driver Status Pie Chart */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <h3 className="text-md font-semibold text-black mb-3">
            Driver Status Summary
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={monitorData.driverStatus}
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

        {/* Weekly Mileage */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <h3 className="text-md font-semibold text-black mb-3">
            Weekly Mileage Trend (km)
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              data={weeklyMileage}
            >
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="mileage" fill="#111827" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Fuel Consumption */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <h3 className="text-md font-semibold text-black mb-3">
            Weekly Fuel Consumption (L)
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart
              data={weeklyFuel}
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

      {/* Table */}
      <h3 className="text-md font-semibold text-black mb-2">
        Active Drivers
      </h3>
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-[800px] w-full text-sm text-left text-gray-800">
          <thead className="bg-gray-100 text-gray-900">
            <tr>
              <th className="py-3 px-4 font-medium">Driver</th>
              <th className="py-3 px-4 font-medium">Truck</th>
              <th className="py-3 px-4 font-medium">Status</th>
              <th className="py-3 px-4 font-medium">Last Update</th>
              <th className="py-3 px-4 font-medium">Checklist</th>
            </tr>
          </thead>
          <tbody>
            {visibleDrivers.length ? (
              visibleDrivers.map((driver) => (
                <tr key={driver.id} className="border-b hover:bg-gray-50 transition">
                  <td className="py-2.5 px-4">{driver.name}</td>
                  <td className="py-2.5 px-4">{driver.truck || "Unassigned"}</td>
                  <td
                    className={`py-2.5 px-4 font-semibold ${
                      driver.status === "On Duty" ? "text-green-600" : "text-gray-500"
                    }`}
                  >
                    {driver.status}
                  </td>
                  <td className="py-2.5 px-4">
                    {driver.lastUpdate && driver.lastUpdate !== "—"
                      ? new Date(driver.lastUpdate).toLocaleString()
                      : "—"}
                  </td>
                  <td className="py-2.5 px-4">
                    {driver.checklist ? (
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs text-gray-500">
                          {new Date(driver.checklist.updatedAt).toLocaleDateString()}
                        </span>
                        <button
                          type="button"
                          onClick={() => openChecklistPdf(driver.name, driver.checklist)}
                          className="text-xs text-blue-600 hover:underline text-left"
                        >
                          View PDF
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs">—</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="py-4 px-4 text-gray-500 text-sm" colSpan={5}>
                  No active driver data found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function MaintenanceTab({ records, loading, error }) {
  const [selectedJobCard, setSelectedJobCard] = useState(null);
  const summary = records.reduce(
    (acc, record) => {
      const key = record.status.toLowerCase();
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    },
    { completed: 0, scheduled: 0, overdue: 0 }
  );

  const statusStyles = {
    Completed: "text-green-700 bg-green-100",
    Scheduled: "text-blue-700 bg-blue-100",
    Overdue: "text-red-700 bg-red-100",
  };

  return (
    <Card title="Maintenance Records">
      <p className="text-gray-600 text-sm mb-6">
        Track recent service history and upcoming maintenance tasks for your fleet.
      </p>
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </div>
      )}
      {loading && (
        <div className="mb-4 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-600">
          Loading maintenance records...
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <MaintenanceStat label="Scheduled" value={summary.scheduled} tone="bg-blue-50" />
        <MaintenanceStat label="Completed" value={summary.completed} tone="bg-green-50" />
        <MaintenanceStat label="Overdue" value={summary.overdue} tone="bg-red-50" />
      </div>

      <div className="overflow-x-auto border border-gray-200 rounded-xl">
        <table className="min-w-[860px] w-full text-sm text-left text-gray-800">
          <thead className="bg-gray-100 text-gray-900">
            <tr>
              <th className="py-3 px-4 font-medium">Truck</th>
              <th className="py-3 px-4 font-medium">Service</th>
              <th className="py-3 px-4 font-medium">Date</th>
              <th className="py-3 px-4 font-medium">Status</th>
              <th className="py-3 px-4 font-medium">Cost</th>
              <th className="py-3 px-4 font-medium">Notes</th>
              <th className="py-3 px-4 font-medium">Job Card</th>
            </tr>
          </thead>
          <tbody>
            {records.length ? (
              records.map((record) => (
                <tr key={record.id} className="border-t hover:bg-gray-50 transition">
                  <td className="py-2.5 px-4 whitespace-nowrap">{record.truck}</td>
                  <td className="py-2.5 px-4 whitespace-nowrap">{record.service}</td>
                  <td className="py-2.5 px-4 whitespace-nowrap">
                    {record.date
                      ? new Intl.DateTimeFormat("en-GB", {
                          year: "numeric",
                          month: "short",
                          day: "2-digit",
                        }).format(new Date(record.date))
                      : "—"}
                  </td>
                  <td className="py-2.5 px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                        statusStyles[record.status] || "text-gray-700 bg-gray-100"
                      }`}
                    >
                      {record.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 whitespace-nowrap">{record.cost}</td>
                  <td className="py-2.5 px-4 text-gray-600 min-w-[12rem]">{record.notes}</td>
                  <td className="py-2.5 px-4 whitespace-nowrap">
                    {record.jobCard ? (
                      <button
                        type="button"
                        onClick={() => setSelectedJobCard(record.jobCard)}
                        className="rounded-md border border-gray-300 px-2.5 py-1 text-xs font-medium text-gray-800 hover:bg-gray-100"
                      >
                        View
                      </button>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="py-4 px-4 text-sm text-gray-500" colSpan={7}>
                  No maintenance records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <JobCardModal jobCard={selectedJobCard} onClose={() => setSelectedJobCard(null)} />
    </Card>
  );
}

function MaintenanceStat({ label, value, tone }) {
  return (
    <div className={`rounded-xl border border-gray-200 px-4 py-3 shadow-sm ${tone}`}>
      <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
      <p className="text-2xl font-semibold text-gray-900">{value}</p>
    </div>
  );
}

function JobCardModal({ jobCard, onClose }) {
  if (!jobCard) return null;

  const info = jobCard.info && typeof jobCard.info === "object" ? jobCard.info : {};
  const repairs = Array.isArray(jobCard.repairs) ? jobCard.repairs : [];
  const filledRepairs = repairs.filter((row) =>
    [row?.service, row?.repTag, row?.qty, row?.itemCode, row?.unitPrice, row?.totalPrice].some(
      (value) => value && String(value).trim()
    )
  );

  const jobCardFields = [
    { label: "Job No", value: info.jobNo },
    { label: "Plate", value: info.plateNo },
    { label: "Driver", value: info.driverName },
    { label: "Date In", value: info.dateIn },
    { label: "Date Out", value: info.dateOut },
    { label: "Mileage", value: info.workshopMileage || info.kms },
    { label: "Type", value: info.workshopType || info.repairType },
    { label: "Workshop", value: info.workshopName },
    { label: "Cost", value: info.workshopCost || info.totalAmount },
    { label: "Next Due", value: info.workshopNextDueDate },
    { label: "Complaint", value: info.complaint },
    { label: "Details", value: info.workshopDetails },
    { label: "Prepared By", value: info.preparedBy },
    { label: "Approved By", value: info.approvedBy },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-2 sm:p-4">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 px-4 sm:px-5 py-4">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Maintenance Job Card</h3>
            <p className="text-xs text-gray-500">
              Request: {jobCard.requestId || "--"} | Updated:{" "}
              {jobCard.updatedAt ? new Date(jobCard.updatedAt).toLocaleString() : "--"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-gray-300 px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100"
          >
            Close
          </button>
        </div>

        <div className="max-h-[75vh] overflow-y-auto px-4 sm:px-5 py-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {jobCardFields.map((field) => (
              <div key={field.label} className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                <p className="text-[11px] uppercase tracking-wide text-gray-500">{field.label}</p>
                <p className="mt-1 text-sm font-medium text-gray-900 break-words">{field.value || "--"}</p>
              </div>
            ))}
          </div>

          <div>
            <h4 className="mb-2 text-sm font-semibold text-gray-900">Repair Items</h4>
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full text-sm text-left text-gray-800">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-3 py-2 font-medium">Service</th>
                    <th className="px-3 py-2 font-medium">Tag</th>
                    <th className="px-3 py-2 font-medium">Qty</th>
                    <th className="px-3 py-2 font-medium">Item Code</th>
                    <th className="px-3 py-2 font-medium">Unit Price</th>
                    <th className="px-3 py-2 font-medium">Total Price</th>
                  </tr>
                </thead>
                <tbody>
                  {filledRepairs.length ? (
                    filledRepairs.map((row, index) => (
                      <tr key={row.id || `repair-${index}`} className="border-t">
                        <td className="px-3 py-2">{row.service || "--"}</td>
                        <td className="px-3 py-2">{row.repTag || "--"}</td>
                        <td className="px-3 py-2">{row.qty || "--"}</td>
                        <td className="px-3 py-2">{row.itemCode || "--"}</td>
                        <td className="px-3 py-2">{row.unitPrice || "--"}</td>
                        <td className="px-3 py-2">{row.totalPrice || "--"}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="px-3 py-3 text-sm text-gray-500" colSpan={6}>
                        No repair items listed.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FuelLogsTab({ logs, loading, error, trucks, filter, onFilterChange }) {
  const fmt = (n, decimals = 1) =>
    n !== null && n !== undefined ? Number(n).toFixed(decimals) : "—";

  return (
    <Card title="🪣 Driver Fuel Logs">
      <p className="text-sm text-gray-500 mb-4">
        All fuel entries submitted by drivers and supervisors, most recent first.
      </p>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <select
          value={filter.vehicleId}
          onChange={(e) => onFilterChange({ ...filter, vehicleId: e.target.value })}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-black"
        >
          <option value="">All Trucks</option>
          {trucks.map((t) => (
            <option key={t.id} value={t.id}>
              {t.model} — {t.plate}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={filter.from}
          onChange={(e) => onFilterChange({ ...filter, from: e.target.value })}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-black"
          placeholder="From"
        />
        <input
          type="date"
          value={filter.to}
          onChange={(e) => onFilterChange({ ...filter, to: e.target.value })}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-black"
          placeholder="To"
        />
        <button
          type="button"
          onClick={() => onFilterChange({ vehicleId: "", from: "", to: "" })}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm hover:bg-gray-100"
        >
          Clear
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </div>
      )}
      {loading && (
        <div className="mb-4 text-sm text-gray-500">Loading fuel logs...</div>
      )}

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-[900px] w-full text-sm text-left text-gray-800">
          <thead className="bg-gray-100 text-gray-900">
            <tr>
              <th className="py-3 px-4 font-medium">Date</th>
              <th className="py-3 px-4 font-medium">Driver</th>
              <th className="py-3 px-4 font-medium">Truck</th>
              <th className="py-3 px-4 font-medium">Start KM</th>
              <th className="py-3 px-4 font-medium">End KM</th>
              <th className="py-3 px-4 font-medium">Distance</th>
              <th className="py-3 px-4 font-medium">Liters</th>
              <th className="py-3 px-4 font-medium">Cost (SAR)</th>
              <th className="py-3 px-4 font-medium">km/L</th>
              <th className="py-3 px-4 font-medium">Photos</th>
            </tr>
          </thead>
          <tbody>
            {logs.length ? (
              logs.map((log) => (
                <tr key={log.id} className="border-b hover:bg-gray-50 transition">
                  <td className="py-2.5 px-4 whitespace-nowrap">
                    {new Date(log.date).toLocaleDateString()}
                    <div className="text-xs text-gray-400">{new Date(log.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                  </td>
                  <td className="py-2.5 px-4">
                    <span>{log.driverName}</span>
                    <div className="text-xs text-gray-400">{log.submittedBy}</div>
                  </td>
                  <td className="py-2.5 px-4">{log.plateNumber}</td>
                  <td className="py-2.5 px-4">{fmt(log.startKm, 0)}</td>
                  <td className="py-2.5 px-4">{fmt(log.endKm, 0)}</td>
                  <td className="py-2.5 px-4">
                    {log.distanceKm !== null ? (
                      <span className="font-medium">{fmt(log.distanceKm, 1)} km</span>
                    ) : "—"}
                  </td>
                  <td className="py-2.5 px-4">{fmt(log.liters, 1)} L</td>
                  <td className="py-2.5 px-4">{log.cost !== null ? fmt(log.cost, 2) : "—"}</td>
                  <td className="py-2.5 px-4">
                    {log.efficiency !== null ? (
                      <span className={`font-medium ${log.efficiency >= 3 ? "text-green-600" : log.efficiency >= 2 ? "text-amber-600" : "text-red-600"}`}>
                        {fmt(log.efficiency, 2)}
                      </span>
                    ) : "—"}
                  </td>
                  <td className="py-2.5 px-4">
                    <div className="flex gap-2">
                      {log.odometerPhotoUrl && (
                        <a
                          href={log.odometerPhotoUrl.startsWith("/") ? `/api/files?path=${encodeURIComponent(log.odometerPhotoUrl)}` : log.odometerPhotoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline"
                        >
                          Odo
                        </a>
                      )}
                      {log.fuelPumpPhotoUrl && (
                        <a
                          href={log.fuelPumpPhotoUrl.startsWith("/") ? `/api/files?path=${encodeURIComponent(log.fuelPumpPhotoUrl)}` : log.fuelPumpPhotoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline"
                        >
                          Pump
                        </a>
                      )}
                      {!log.odometerPhotoUrl && !log.fuelPumpPhotoUrl && (
                        <span className="text-gray-400 text-xs">—</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="py-4 px-4 text-gray-500 text-sm" colSpan={10}>
                  {loading ? "Loading..." : "No fuel logs found."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
