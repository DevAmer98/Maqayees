// app/dashboard/(role)/(supervisor)/page.jsx
"use client";

import { useState } from "react";
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

export default function SupervisorDashboard() {
  const [activeTab, setActiveTab] = useState("monitor");
  const [selectedTruck, setSelectedTruck] = useState("all");
  const [assignment, setAssignment] = useState({ driver: "", truck: "" });
  const [message, setMessage] = useState("");

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

  const handleReportChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData({ ...formData, photo: file });
    setPreviewUrl(URL.createObjectURL(file));
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.truckId) {
      alert("⚠️ Please select a truck before submitting the report.");
      return;
    }

    const currentReading = parseFloat(formData.currentOdometer);
    const liters = parseFloat(formData.litersFilled);
    const truckLastOdometer = lastOdometerByTruck[formData.truckId] ?? null;
    const selectedTruck =
      trucks.find((truck) => truck.id === formData.truckId) || null;
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
        truckId: formData.truckId,
        truckLabel,
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
        [formData.truckId]: currentReading,
      }));
    }

    console.log("Daily report:", formData);
    alert(`✅ Daily report submitted for ${truckLabel}.`);
    setFormData((prev) => ({
      ...prev,
      currentOdometer: "",
      litersFilled: "",
      fuelCost: "",
      notes: "",
      photo: null,
    }));
    setPreviewUrl(null);
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
    { key: "maintenance", label: "Maintenance", icon: "🛠️" },
    { key: "profile", label: "Profile", icon: "👤" },
  ];

  const drivers = [
    { id: "d1", name: "Ahmed Driver" },
    { id: "d2", name: "Ali Hassan" },
    { id: "d3", name: "Omar Khalid" },
  ];

  const trucks = [
    { id: "t1", plate: "ABC-1234", model: "Hilux" },
    { id: "t2", plate: "XYZ-5678", model: "Isuzu D-Max" },
    { id: "t3", plate: "LMN-9101", model: "Hino 300" },
  ];

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
      truck: "Isuzu D-Max — XYZ-5678",
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

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-50 to-gray-100 text-gray-900">
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
        <button
          className="mt-auto bg-gray-800 hover:bg-gray-700 text-white py-2.5 px-4 rounded-lg font-semibold text-sm shadow-md transition"
          onClick={() => alert("TODO: Implement logout")}
        >
          Logout
        </button>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-black text-white z-20 flex justify-between items-center px-4 py-3 shadow-md">
        <h2 className="text-lg font-semibold">Supervisor Panel</h2>
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
                formatTruckLabel={formatTruckLabel}
              />
            )}

            {/* Assign */}
            {activeTab === "assign" && (
              <Card title="Assign Driver to Truck">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!assignment.driver || !assignment.truck) {
                      setMessage("⚠️ Please select both a driver and a truck.");
                      return;
                    }
                    setMessage(
                      `✅ ${
                        drivers.find((d) => d.id === assignment.driver)?.name
                      } assigned to ${
                        trucks.find((t) => t.id === assignment.truck)?.plate
                      } successfully.`
                    );
                    setAssignment({ driver: "", truck: "" });
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
                      label: d.name,
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
                    className="bg-black hover:bg-gray-900 text-white px-5 py-2 rounded-lg font-semibold text-sm shadow-md transition"
                  >
                    Assign
                  </button>

                  {message && (
                    <p
                      className={`mt-2 text-sm ${
                        message.startsWith("✅")
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
                      className="bg-black hover:bg-gray-900 text-white px-5 py-2 rounded-lg text-sm font-semibold shadow-md transition"
                    >
                      Submit Report
                    </button>
                  </div>
                </form>
              </Card>
            )}

            {activeTab === "maintenance" && (
              <MaintenanceTab records={maintenanceRecords} />
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

/* --- Monitor Tab Extracted --- */
function MonitorTab({ trucks, selectedTruck, setSelectedTruck, formatTruckLabel }) {
  return (
    <Card title="Fleet Monitoring">
      <p className="text-gray-600 text-sm mb-4">
        Overview of driver activity and fleet performance
      </p>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-md font-semibold text-black">Fleet Monitoring</h3>
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

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Driver Status Pie Chart */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <h3 className="text-md font-semibold text-black mb-3">
            Driver Status Summary
          </h3>
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

        {/* Weekly Mileage */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <h3 className="text-md font-semibold text-black mb-3">
            Weekly Mileage Trend (km)
          </h3>
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

        {/* Fuel Consumption */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <h3 className="text-md font-semibold text-black mb-3">
            Weekly Fuel Consumption (L)
          </h3>
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

      {/* Table */}
      <h3 className="text-md font-semibold text-black mb-2">
        Active Drivers
      </h3>
      <table className="w-full text-sm text-left text-gray-800 border border-gray-200 rounded-lg overflow-hidden">
        <thead className="bg-gray-100 text-gray-900">
          <tr>
            <th className="py-3 px-4 font-medium">Driver</th>
            <th className="py-3 px-4 font-medium">Truck</th>
            <th className="py-3 px-4 font-medium">Status</th>
            <th className="py-3 px-4 font-medium">Last Update</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b hover:bg-gray-50 transition">
            <td className="py-2.5 px-4">Ahmed Driver</td>
            <td className="py-2.5 px-4">Hilux - ABC1234</td>
            <td className="py-2.5 px-4 text-green-600 font-semibold">
              On Duty
            </td>
            <td className="py-2.5 px-4">Today, 1:10 PM</td>
          </tr>
          <tr className="border-b hover:bg-gray-50 transition">
            <td className="py-2.5 px-4">Ali Hassan</td>
            <td className="py-2.5 px-4">Isuzu - XYZ5678</td>
            <td className="py-2.5 px-4 text-gray-500 font-semibold">
              Off Duty
            </td>
            <td className="py-2.5 px-4">Today, 9:00 AM</td>
          </tr>
        </tbody>
      </table>
    </Card>
  );
}

function MaintenanceTab({ records }) {
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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <MaintenanceStat label="Scheduled" value={summary.scheduled} tone="bg-blue-50" />
        <MaintenanceStat label="Completed" value={summary.completed} tone="bg-green-50" />
        <MaintenanceStat label="Overdue" value={summary.overdue} tone="bg-red-50" />
      </div>

      <div className="overflow-x-auto border border-gray-200 rounded-xl">
        <table className="min-w-full text-sm text-left text-gray-800">
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
            {records.map((record) => (
              <tr key={record.id} className="border-t hover:bg-gray-50 transition">
                <td className="py-2.5 px-4 whitespace-nowrap">{record.truck}</td>
                <td className="py-2.5 px-4 whitespace-nowrap">{record.service}</td>
                <td className="py-2.5 px-4 whitespace-nowrap">
                  {new Intl.DateTimeFormat("en-GB", {
                    year: "numeric",
                    month: "short",
                    day: "2-digit",
                  }).format(new Date(record.date))}
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
