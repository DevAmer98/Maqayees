"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const ROLE_OPTIONS = [
  { label: "Manager", value: "manager" },
  { label: "Project Manager", value: "project_manager" },
  { label: "Supervisor", value: "supervisor" },
  { label: "Driver", value: "driver" },
  { label: "Maintenance", value: "maintenance" },
];

const initialState = {
  name: "",
  phone: "",
  iqama: "",
  passport: "",
  email: "",
  role: "",
};

export default function AddUsersPage() {
  const [formData, setFormData] = useState(initialState);
  const [status, setStatus] = useState({ type: null, message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [licenseFile, setLicenseFile] = useState(null);
  const [licensePreview, setLicensePreview] = useState("");

  const requiresLicensePhoto = formData.role ? formData.role !== "manager" : false;

  useEffect(() => {
    if (!licenseFile) {
      setLicensePreview("");
      return undefined;
    }
    const url = URL.createObjectURL(licenseFile);
    setLicensePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [licenseFile]);

  useEffect(() => {
    if (formData.role === "manager" && licenseFile) {
      setLicenseFile(null);
    }
  }, [formData.role, licenseFile]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLicenseChange = (event) => {
    const file = event.target.files?.[0] || null;
    setLicenseFile(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (requiresLicensePhoto && !licenseFile) {
      setStatus({ type: "error", message: "Driving license photo is required for this role." });
      return;
    }
    setIsSubmitting(true);
    setStatus({ type: null, message: "" });

    try {
      const body = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value) body.append(key, value);
      });
      if (licenseFile) {
        body.append("drivingLicensePhoto", licenseFile);
      }

      const response = await fetch("/api/users", {
        method: "POST",
        body,
      });
      const payload = await response.json();
      if (!response.ok || !payload.success) {
        throw new Error(payload.error || "Failed to create the user.");
      }

      setStatus({
        type: "success",
        message: `User created successfully. Temporary password: ${payload.temporaryPassword}`,
      });
      setFormData(initialState);
      setLicenseFile(null);
    } catch (error) {
      setStatus({
        type: "error",
        message: error.message || "Failed to create the user.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 text-gray-900">
      <header className="w-full border-b border-gray-200 bg-white px-6 py-5">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">Team Directory</p>
            <h1 className="text-2xl font-semibold text-black">Add Team Member</h1>
            <p className="text-sm text-gray-500">Provide the personnel details to issue dashboard access.</p>
          </div>
          <Link
            href="/dashboard/users"
            className="inline-flex items-center justify-center rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
          >
            ← Back to team list
          </Link>
        </div>
      </header>

      <main className="px-4 py-8 sm:px-6 lg:px-8">
        <section className="mx-auto flex w-full max-w-4xl flex-col gap-6">
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-black">Personnel Details</h2>
            <p className="mt-1 text-sm text-gray-500">
              These fields help supervisors and project managers find the right contact quickly.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm"
          >
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Input
                label="Full Name"
                name="name"
                placeholder="e.g. Ahmed Ali"
                value={formData.name}
                onChange={handleChange}
                required
              />
              <Input
                label="Phone Number"
                name="phone"
                type="tel"
                placeholder="e.g. 0551234567"
                value={formData.phone}
                onChange={handleChange}
              />
              <Input
                label="Iqama / ID"
                name="iqama"
                placeholder="e.g. 2456789231"
                value={formData.iqama}
                onChange={handleChange}
              />
              <Input
                label="Passport Number"
                name="passport"
                placeholder="Optional"
                value={formData.passport}
                onChange={handleChange}
              />
              <Input
                label="Email Address"
                name="email"
                type="email"
                placeholder="name@maqayees.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="sm:col-span-2"
              />
              <Select
                label="Role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
                options={ROLE_OPTIONS}
                placeholder="Select role"
                className="sm:col-span-2"
              />
              {requiresLicensePhoto && (
                <div className="sm:col-span-2">
                  <label className="flex flex-col gap-1 text-sm text-gray-700">
                    <span className="font-medium text-gray-900">Driving License Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLicenseChange}
                      required
                      className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm text-gray-900 focus:border-black focus:outline-none focus:ring-2 focus:ring-black bg-white"
                    />
                  </label>
                  {licensePreview && (
                    <img
                      src={licensePreview}
                      alt="Driving license preview"
                      className="mt-3 h-40 w-60 rounded-xl border border-gray-200 object-cover"
                    />
                  )}
                  <p className="mt-1 text-xs text-gray-500">Accepted formats: JPG, PNG, WEBP up to 5MB.</p>
                </div>
              )}
            </div>

            {status.message && (
              <p
                className={`mt-4 text-sm ${
                  status.type === "success" ? "text-green-600" : "text-red-600"
                }`}
              >
                {status.message}
              </p>
            )}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs uppercase tracking-wider text-gray-400">
                Access level: {formData.role ? formData.role.replace(/_/g, " ") : "—"}
              </p>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center rounded-xl bg-black px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-900 disabled:cursor-not-allowed disabled:bg-gray-500"
              >
                {isSubmitting ? "Saving..." : "Save Team Member"}
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}

function Input({ label, className = "", ...props }) {
  return (
    <label className={`flex flex-col gap-1 text-sm text-gray-700 ${className}`}>
      <span className="font-medium text-gray-900">{label}</span>
      <input
        {...props}
        className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm text-gray-900 focus:border-black focus:outline-none focus:ring-2 focus:ring-black"
      />
    </label>
  );
}

function Select({ label, options, placeholder, className = "", ...props }) {
  return (
    <label className={`flex flex-col gap-1 text-sm text-gray-700 ${className}`}>
      <span className="font-medium text-gray-900">{label}</span>
      <select
        {...props}
        className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm text-gray-900 focus:border-black focus:outline-none focus:ring-2 focus:ring-black"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
