//app/dashboard/%28role%29/%28admin%29/page.jsx
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import AddTruck from "@/components/AddTruck";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("monitor");

  const admin = {
    name: "ADMIN",
    email: "admin@maqayees.com",
    phone: "0559876543",
    role: "Fleet admin",
  };

  const navItems = [
    { key: "monitor", label: "Monitor", icon: "📊" },
    { key: "addManager", label: "Add Manager", icon: "➕" },
    { key: "addPM", label: "Add Product Manager", icon: "➕" },
    { key: "addSupervisor", label: "Add Supervisor", icon: "➕" },
    { key: "addDriver", label: "Add Driver", icon: "➕" },
    { key: "addTruck", label: "Add Truck", icon: "🚛" },
  ];

  const [drivers] = useState([
    { id: "d1", name: "Ahmed Driver" },
    { id: "d2", name: "Ali Hassan" },
    { id: "d3", name: "Omar Khalid" },
  ]);

  const [trucks] = useState([
    { id: "t1", plate: "ABC-1234", model: "Hilux" },
    { id: "t2", plate: "XYZ-5678", model: "Isuzu D-Max" },
    { id: "t3", plate: "LMN-9101", model: "Volvo FH" },
    { id: "t4", plate: "PRS-3344", model: "MAN TGS" },
  ]);

  const [monitorState, setMonitorState] = useState({
    loading: true,
    refreshing: false,
    error: "",
    data: null,
  });


  const fetchMonitorMetrics = useCallback(
    async (isRefresh = false) => {
      setMonitorState((prev) => ({
        ...prev,
        loading: isRefresh ? prev.loading : true,
        refreshing: isRefresh,
        error: "",
      }));

      try {
        const response = await fetch("/api/admin/metrics");
        const payload = await response.json();
        if (!response.ok || !payload.success) {
          throw new Error(payload.error || "Failed to load metrics.");
        }

        setMonitorState({
          loading: false,
          refreshing: false,
          error: "",
          data: payload.data,
        });
      } catch (error) {
        setMonitorState((prev) => ({
          ...prev,
          loading: false,
          refreshing: false,
          error: error.message || "Failed to load metrics.",
        }));
      }
    },
    []
  );

  useEffect(() => {
    fetchMonitorMetrics(false);
  }, [fetchMonitorMetrics]);


  const roleSummary = [
    {
      key: "managers",
      label: "Managers",
      value: monitorState.data?.users?.manager ?? 0,
      accent: "from-gray-900 to-gray-700",
      icon: "👔",
      description: "Oversee depots and fleet teams",
      href: "/dashboard/users?role=manager",
      cta: "View managers →",
    },
    {
      key: "pms",
      label: "Project Managers",
      value: monitorState.data?.users?.project_manager ?? 0,
      accent: "from-gray-800 to-gray-600",
      icon: "🗂️",
      description: "Coordinate project deliveries",
      href: "/dashboard/users?role=project_manager",
      cta: "View PMs →",
    },
    {
      key: "supervisors",
      label: "Supervisors",
      value: monitorState.data?.users?.supervisor ?? 0,
      accent: "from-gray-700 to-gray-500",
      icon: "🛰️",
      description: "Monitor day-to-day operations",
      href: "/dashboard/users?role=supervisor",
      cta: "View supervisors →",
    },
    {
      key: "drivers",
      label: "Drivers",
      value: monitorState.data?.users?.driver ?? 0,
      accent: "from-gray-600 to-gray-400",
      icon: "🚚",
      description: "Active drivers on the road",
      href: "/dashboard/users?role=driver",
      cta: "View drivers →",
    },
    {
      key: "trucks",
      label: "Trucks",
      value: monitorState.data?.totals?.vehicles ?? 0,
      accent: "from-gray-500 to-gray-300",
      icon: "🚛",
      description: "Available vehicles in fleet",
      href: "/dashboard/fleet",
      cta: "View fleet →",
    },
  ];

  const totalPersonnel = monitorState.data?.totals?.personnel ?? 0;
  const trucksAvailable = monitorState.data?.totals?.vehicles ?? 0;
  const lastUpdated = monitorState.data?.refreshedAt ? new Date(monitorState.data.refreshedAt).toLocaleString() : null;
  const isInitialLoading = monitorState.loading && !monitorState.data;

  const [assignment, setAssignment] = useState({ driver: "", truck: "" });
  const [message, setMessage] = useState("");

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-50 to-gray-100 text-gray-900">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 bg-black text-white flex-col p-6 shadow-2xl rounded-r-3xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-gray-900 to-black flex items-center justify-center text-white font-bold text-xl shadow-lg border border-gray-700">
            A
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Admin Panel</h2>
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
            {activeTab === "addManager" && (
              <RoleRegistrationForm
                role="manager"
                title="Add New Manager"
                ctaLabel="Add Manager"
                description="Register a fleet manager so they can access the control center."
              />
            )}

            {activeTab === "addPM" && (
              <RoleRegistrationForm
                role="project_manager"
                title="Add New Project Manager"
                ctaLabel="Add Project Manager"
                description="Provision a project manager for client-facing coordination."
              />
            )}

            {activeTab === "addSupervisor" && (
              <RoleRegistrationForm
                role="supervisor"
                title="Add New Supervisor"
                ctaLabel="Add Supervisor"
                description="Supervisors handle day-to-day oversight for a project cluster."
              />
            )}
            {activeTab === "addDriver" && (
              <RoleRegistrationForm
                role="driver"
                title="Add New Driver"
                ctaLabel="Add Driver"
                description="Create driver credentials so the mobile dashboard can be accessed."
              />
            )}

            {activeTab === "addTruck" && (
              <AddTruck />
            )}

            {activeTab === "monitor" && (
              <Card title="Organization Monitor">
                <div className="mb-4 flex flex-col gap-3 text-sm text-gray-600 md:flex-row md:items-center md:justify-between">
                  <p>Overview of the headcount across key Maqayees roles and assets.</p>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    {lastUpdated && <span>Last updated {lastUpdated}</span>}
                    <button
                      type="button"
                      onClick={() => fetchMonitorMetrics(true)}
                      disabled={monitorState.refreshing || isInitialLoading}
                      className="rounded-lg border border-gray-300 px-3 py-1.5 font-semibold text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {monitorState.refreshing ? "Refreshing..." : "Refresh"}
                    </button>
                  </div>
                </div>
                {monitorState.error && (
                  <p className="mb-4 text-sm text-red-600">{monitorState.error}</p>
                )}
                {isInitialLoading && (
                  <p className="mb-4 text-sm text-gray-500">Loading live metrics...</p>
                )}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {roleSummary.map((item) => {
                    const displayValue = monitorState.loading && !monitorState.data ? "…" : item.value;
                    const clickable = !isInitialLoading && Boolean(item.href);
                    const CardWrapper = clickable ? Link : "div";
                    const cardProps = clickable
                      ? { href: item.href, className: "block focus:outline-none" }
                      : {};
                    return (
                      <CardWrapper
                        key={item.key}
                        {...cardProps}
                        className={`${cardProps.className || ""} relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition ${
                          clickable ? "hover:shadow-lg focus-visible:ring-2 focus-visible:ring-black" : "hover:shadow-md"
                        }`}
                      >
                        <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${item.accent}`} />
                        <div className="p-6 space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-xl">{item.icon}</span>
                            <span className="text-xs uppercase tracking-wide text-gray-400">
                              {item.label}
                            </span>
                          </div>
                          <p className="text-4xl font-semibold text-black">{displayValue}</p>
                          <p className="text-sm text-gray-500">
                            {item.description}
                            {clickable && item.cta && (
                              <span className="ml-1 font-semibold text-black/60">{item.cta}</span>
                            )}
                          </p>
                        </div>
                      </CardWrapper>
                    );
                  })}
                </div>
                <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                    <h3 className="text-sm font-semibold text-black">Personnel Coverage</h3>
                    <p className="mt-2 text-sm text-gray-600">
                      {isInitialLoading
                        ? "Calculating personnel coverage..."
                        : `${totalPersonnel} team members currently support the fleet operations.`}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                    <h3 className="text-sm font-semibold text-black">Asset Availability</h3>
                    <p className="mt-2 text-sm text-gray-600">
                      {isInitialLoading
                        ? "Calculating fleet availability..."
                        : `${trucksAvailable} trucks available. Update this overview after each new vehicle onboarding.`}
                    </p>
                  </div>
                </div>
              </Card>
            )}

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
          `✅ ${drivers.find((d) => d.id === assignment.driver)?.name} assigned to ${
            trucks.find((t) => t.id === assignment.truck)?.plate
          } successfully.`
        );
        setAssignment({ driver: "", truck: "" });
      }}
      className="space-y-4 text-sm"
    >
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Select Driver
        </label>
        <select
          value={assignment.driver}
          onChange={(e) =>
            setAssignment((prev) => ({ ...prev, driver: e.target.value }))
          }
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black"
        >
          <option value="">-- Choose Driver --</option>
          {drivers.map((driver) => (
            <option key={driver.id} value={driver.id}>
              {driver.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Select Truck
        </label>
        <select
          value={assignment.truck}
          onChange={(e) =>
            setAssignment((prev) => ({ ...prev, truck: e.target.value }))
          }
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black"
        >
          <option value="">-- Choose Truck --</option>
          {trucks.map((truck) => (
            <option key={truck.id} value={truck.id}>
              {truck.plate} — {truck.model}
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

function RoleRegistrationForm({ role, title, ctaLabel, description }) {
  const initialState = { name: "", email: "", phone: "", iqama: "", passport: "" };
  const [formState, setFormState] = useState(initialState);
  const [status, setStatus] = useState({ type: null, text: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [licenseFile, setLicenseFile] = useState(null);
  const [licensePreview, setLicensePreview] = useState("");
  const requiresLicensePhoto = role !== "manager";

  useEffect(() => {
    if (!licenseFile) {
      setLicensePreview("");
      return undefined;
    }
    const url = URL.createObjectURL(licenseFile);
    setLicensePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [licenseFile]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleLicenseChange = (event) => {
    const file = event.target.files?.[0] || null;
    setLicenseFile(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (requiresLicensePhoto && !licenseFile) {
      setStatus({ type: "error", text: "Driving license photo is required for this role." });
      return;
    }
    setIsSubmitting(true);
    setStatus({ type: null, text: "" });

    try {
      const formPayload = new FormData();
      Object.entries(formState).forEach(([key, value]) => {
        if (value) formPayload.append(key, value);
      });
      formPayload.append("role", role);
      if (licenseFile) {
        formPayload.append("drivingLicensePhoto", licenseFile);
      }

      const response = await fetch("/api/users", {
        method: "POST",
        body: formPayload,
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data?.error || "Failed to create the user.");
      }

      setStatus({
        type: "success",
        text: `User created. Temporary password: ${data.temporaryPassword}`,
      });
      setFormState(initialState);
      setLicenseFile(null);
    } catch (error) {
      setStatus({ type: "error", text: error.message || "Failed to create the user." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card title={title}>
      {description && <p className="mb-4 text-sm text-gray-600">{description}</p>}
      <form onSubmit={handleSubmit} className="space-y-4 text-sm">
        <Input label="Full Name" name="name" placeholder="e.g. Ahmed Ali" value={formState.name} onChange={handleChange} required />
        <Input label="Email" name="email" type="email" placeholder="e.g. ahmed@maqayees.com" value={formState.email} onChange={handleChange} required />
        <Input label="Phone" name="phone" type="tel" placeholder="e.g. 0551234567" value={formState.phone} onChange={handleChange} />
        <Input label="Iqama / ID" name="iqama" placeholder="e.g. 2456789231" value={formState.iqama} onChange={handleChange} />
        {requiresLicensePhoto && (
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">Driving License Photo</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleLicenseChange}
              required={requiresLicensePhoto}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-black transition bg-white text-sm"
            />
            {licensePreview && (
              <img
                src={licensePreview}
                alt="Driving license preview"
                className="mt-2 h-32 w-48 rounded-lg border border-gray-200 object-cover"
              />
            )}
            <p className="mt-1 text-xs text-gray-500">Accepted formats: JPG, PNG, WEBP. Max 5MB.</p>
          </div>
        )}
        {status.text && (
          <p className={`text-sm ${status.type === "success" ? "text-green-600" : "text-red-600"}`}>
            {status.text}
          </p>
        )}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-black px-5 py-2 font-semibold text-white shadow-md transition hover:bg-gray-900 disabled:cursor-not-allowed disabled:bg-gray-500"
          >
            {isSubmitting ? "Saving..." : ctaLabel}
          </button>
        </div>
      </form>
    </Card>
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
