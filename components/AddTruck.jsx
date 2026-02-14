// components/AddTruck.jsx
"use client";

import React, { useEffect, useMemo, useState } from "react";

const createInitialFormState = () => ({
  plateNumber: "",
  model: "",
  brand: "",
  year: "",
  color: "",
  serialNumber: "",
  chassisNumber: "",
  registrationExpiry: "",
  insuranceExpiry: "",
  equipmentType: "",
  fuelType: "",
  tankCapacityLiters: "",
  purchaseDate: "",
  initialOdometerKm: "",
  driverId: "",
  driverName: "",
  projectName: "",
  vehiclePhotos: [],
  registrationImages: [],
});

export default function AddTruck({ onSuccess }) {
  const [formData, setFormData] = useState(createInitialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [drivers, setDrivers] = useState([]);
  const [driversLoading, setDriversLoading] = useState(true);
  const [driversError, setDriversError] = useState("");
  const projects = ["Project A", "Project B", "Project C"];
  const equipmentTypes = ["Compactor", "Pickup", "Loader", "Tanker", "Bus"];
  const fuelTypes = ["Diesel", "Petrol", "Electric", "Hybrid"]; // ✅ new

  useEffect(() => {
    let active = true;

    const loadDrivers = async () => {
      setDriversLoading(true);
      setDriversError("");
      try {
        const response = await fetch("/api/admin/users?role=driver&page=1&pageSize=100");
        const payload = await response.json();
        if (!response.ok || !payload?.success) {
          throw new Error(payload?.error || "Failed to load drivers.");
        }
        if (!active) return;
        setDrivers(Array.isArray(payload.users) ? payload.users : []);
      } catch (error) {
        if (!active) return;
        setDrivers([]);
        setDriversError(error.message || "Failed to load drivers.");
      } finally {
        if (active) setDriversLoading(false);
      }
    };

    loadDrivers();
    return () => {
      active = false;
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDriverChange = (e) => {
    const selectedId = e.target.value;
    const selectedDriver = drivers.find((driver) => driver.id === selectedId);
    setFormData((prev) => ({
      ...prev,
      driverId: selectedId,
      driverName: selectedDriver?.name || "",
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormData((prev) => ({ ...prev, [name]: Array.from(files || []) }));
  };

  const vehiclePhotoPreviews = useMemo(() => {
    if (!formData.vehiclePhotos.length) return [];
    return formData.vehiclePhotos.map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
    }));
  }, [formData.vehiclePhotos]);

  const registrationImagePreviews = useMemo(() => {
    if (!formData.registrationImages.length) return [];
    return formData.registrationImages.map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
    }));
  }, [formData.registrationImages]);

  useEffect(() => {
    return () => {
      vehiclePhotoPreviews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [vehiclePhotoPreviews]);

  useEffect(() => {
    return () => {
      registrationImagePreviews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [registrationImagePreviews]);

  const handleRemoveFile = (field, index) => {
    setFormData((prev) => {
      const updated = [...(prev[field] || [])];
      updated.splice(index, 1);
      return { ...prev, [field]: updated };
    });
  };

  const driverOptions = drivers.map((driver) => ({
    value: driver.id,
    label: driver.iqama ? `${driver.name} (${driver.iqama})` : driver.name,
  }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    setSubmitSuccess("");
    setIsSubmitting(true);

    if (!formData.vehiclePhotos.length || !formData.registrationImages.length) {
      setSubmitError("Please attach both vehicle photos and registration images.");
      setIsSubmitting(false);
      return;
    }
    const form = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value === null || value === undefined) return;
      if (Array.isArray(value)) {
        value.forEach((item, index) => {
          if (item) form.append(`${key}[${index}]`, item);
        });
      } else if (value !== "") {
        form.append(key, value);
      }
    });

    try {
      const response = await fetch("/api/trucks", {
        method: "POST",
        body: form,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to upload vehicle");
      }

      const payload = await response.json();
      console.log("Vehicle submitted:", payload);
      setSubmitSuccess("Vehicle uploaded successfully.");
      setFormData(createInitialFormState());
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error(err);
      setSubmitError(err.message || "Error saving vehicle");
    }
    setIsSubmitting(false);
  };

  return (
    <section className="bg-white border border-gray-200 rounded-2xl shadow-sm transition hover:shadow-md">
      <div className="border-b border-gray-100 px-6 py-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-black">Add New Truck</h2>
            <p className="text-sm text-gray-600">
              Onboard a vehicle into the Maqayees fleet and capture its key specs.
            </p>
          </div>
          <span className="inline-flex items-center gap-2 self-start rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-600 sm:self-auto">
            🚛 Fleet Intake
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 px-6 pb-6 pt-4">
        {/* --- Vehicle Profile --- */}
        <div className="rounded-xl border border-gray-100 bg-gray-50 p-5">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-700">
              Vehicle Profile
            </h3>
            <p className="text-xs text-gray-500">
              Plate, brand and specification details.
            </p>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Plate Number" name="plateNumber" value={formData.plateNumber} onChange={handleChange} required />
            <Input label="Brand" name="brand" value={formData.brand} onChange={handleChange} required />
            <Input label="Model" name="model" value={formData.model} onChange={handleChange} required />
            <Input label="Year" name="year" type="number" value={formData.year} onChange={handleChange} required />
            <Input label="Color" name="color" value={formData.color} onChange={handleChange} required />
            <Input label="Serial Number" name="serialNumber" value={formData.serialNumber} onChange={handleChange} required />
            <Input label="Chassis Number" name="chassisNumber" value={formData.chassisNumber} onChange={handleChange} required />

            <Select
              label="Equipment Type"
              name="equipmentType"
              options={equipmentTypes}
              value={formData.equipmentType}
              onChange={handleChange}
              placeholder="Select Type"
              required
            />

  

            <Input
              label="Tank Capacity (Liters)"
              name="tankCapacityLiters"
              type="number"
              value={formData.tankCapacityLiters}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* --- Operational Details & Compliance --- */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-5">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-700">Operational Details</h3>
            <div className="mt-4 space-y-4">
              <Input label="Purchase Date" name="purchaseDate" type="date" value={formData.purchaseDate} onChange={handleChange} />
              <Input label="Initial Odometer (KM)" name="initialOdometerKm" type="number" value={formData.initialOdometerKm} onChange={handleChange} />
            </div>
          </div>

          <div className="rounded-xl border border-gray-100 bg-gray-50 p-5">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-700">Compliance</h3>
            <div className="mt-4 space-y-4">
              <Input label="Registration Expiry" name="registrationExpiry" type="date" value={formData.registrationExpiry} onChange={handleChange} required />
              <Input label="Insurance Expiry" name="insuranceExpiry" type="date" value={formData.insuranceExpiry} onChange={handleChange} required />
            </div>
          </div>
        </div>

        {/* --- Assignment --- */}
        <div className="rounded-xl border border-gray-100 bg-gray-50 p-5">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-700">Assignment</h3>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select
              label="Assign Driver"
              name="driverId"
              options={driverOptions}
              value={formData.driverId}
              onChange={handleDriverChange}
              placeholder="Optional"
              disabled={driversLoading}
              required={false}
            />
            <Select
              label="Assign Project"
              name="projectName"
              options={projects}
              value={formData.projectName}
              onChange={handleChange}
              placeholder="Optional"
              required={false}
            />
          </div>
          {driversLoading && <p className="mt-2 text-xs text-gray-500">Loading drivers...</p>}
          {driversError && <p className="mt-2 text-xs text-red-600">{driversError}</p>}
        </div>

        {/* --- Registration Images --- */}
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-5">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-700">Registration Images</h3>
            <p className="text-xs text-gray-500">Upload the official registration documents.</p>
          </div>
          <div className="mt-4 space-y-4">
            <input
              type="file"
              name="registrationImages"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              required
              className="block w-full cursor-pointer rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-600 transition file:mr-4 file:rounded-md file:border-0 file:bg-black file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-black"
            />
            {!!registrationImagePreviews.length && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {registrationImagePreviews.map((preview, index) => (
                  <div
                    key={`${preview.url}-${index}`}
                    className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white"
                  >
                    <img src={preview.url} alt={preview.name} className="h-32 w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveFile("registrationImages", index)}
                      aria-label="Remove registration image"
                      className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-xs font-bold text-white shadow-md transition hover:bg-black"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* --- Vehicle Photos --- */}
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-5">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-700">Vehicle Photos</h3>
            <p className="text-xs text-gray-500">Upload one or more recent inspection images.</p>
          </div>
          <div className="mt-4 space-y-4">
            <input
              type="file"
              name="vehiclePhotos"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              required
              className="block w-full cursor-pointer rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-600 transition file:mr-4 file:rounded-md file:border-0 file:bg-black file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-black"
            />
            {!!vehiclePhotoPreviews.length && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {vehiclePhotoPreviews.map((preview, index) => (
                  <div
                    key={`${preview.url}-${index}`}
                    className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white"
                  >
                    <img src={preview.url} alt={preview.name} className="h-32 w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveFile("vehiclePhotos", index)}
                      aria-label="Remove vehicle photo"
                      className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-xs font-bold text-white shadow-md transition hover:bg-black"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {submitError && <p className="text-sm text-red-600">{submitError}</p>}
        {submitSuccess && <p className="text-sm text-green-600">{submitSuccess}</p>}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center rounded-lg bg-black px-5 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {isSubmitting ? "Saving..." : "Save Vehicle"}
          </button>
        </div>
      </form>
    </section>
  );
}

/* --- Reusable Inputs --- */
function Input({ label, className = "", ...props }) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-gray-800">{label}</label>
      <input
        {...props}
        className={`w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 transition focus:border-black focus:outline-none focus:ring-2 focus:ring-black ${className}`}
      />
    </div>
  );
}

function Select({ label, name, options, value, onChange, placeholder = "Select", className = "", required = false, disabled = false }) {
  const normalizedOptions = options.map((opt) =>
    typeof opt === "string" ? { value: opt, label: opt } : opt
  );

  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-gray-800">{label}</label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        className={`w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 transition focus:border-black focus:outline-none focus:ring-2 focus:ring-black ${className}`}
      >
        <option value="">{placeholder}</option>
        {normalizedOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
