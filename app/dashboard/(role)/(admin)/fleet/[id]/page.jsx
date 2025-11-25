// app/dashboard/%28role%29/%28admin%29/fleet/%5Bid%5D/page.jsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

const statusOptions = ["Active", "In Maintenance", "Inactive", "Reserved"];

function resolveVehiclePhotoUrl(photoPath) {
  if (!photoPath) return null;
  if (photoPath.startsWith("http://") || photoPath.startsWith("https://")) {
    return photoPath;
  }
  if (photoPath.startsWith("/uploads")) {
    return photoPath;
  }
  return `/api/files?path=${encodeURIComponent(photoPath)}`;
}

const resolveUploadEntryUrl = (entry) => {
  if (!entry) return null;
  return resolveVehiclePhotoUrl(entry.remotePath || entry.localPath || "");
};

export default function EditFleetVehiclePage() {
  const params = useParams();
  const router = useRouter();
  const vehicleId = params?.id;

  const [state, setState] = useState({
    loading: true,
    saving: false,
    error: "",
    success: "",
    vehicle: null,
    uploads: { vehiclePhotos: [], registrationImages: [] },
  });

  const [form, setForm] = useState({});
  const [newPhotoFile, setNewPhotoFile] = useState(null);

  useEffect(() => {
    if (!vehicleId) return;
    let isMounted = true;
    const loadVehicle = async () => {
      setState((prev) => ({ ...prev, loading: true, error: "", success: "" }));
      try {
        const response = await fetch(`/api/trucks/${vehicleId}`);
        const payload = await response.json();
        if (!response.ok || !payload.success) {
          throw new Error(payload.error || "Failed to load vehicle.");
        }
        if (isMounted) {
          setState({
            loading: false,
            saving: false,
            error: "",
            success: "",
            vehicle: payload.vehicle,
            uploads: payload.uploads || { vehiclePhotos: [], registrationImages: [] },
          });
          setForm({
            plateNumber: payload.vehicle.plateNumber || "",
            brand: payload.vehicle.brand || "",
            model: payload.vehicle.model || "",
            year: payload.vehicle.year || "",
            color: payload.vehicle.color || "",
            equipmentType: payload.vehicle.equipmentType || "",
            fuelType: payload.vehicle.fuelType || "",
            tankCapacityLiters: payload.vehicle.tankCapacityLiters ?? "",
            purchaseDate: payload.vehicle.purchaseDate ? payload.vehicle.purchaseDate.slice(0, 10) : "",
            initialOdometerKm: payload.vehicle.initialOdometerKm ?? "",
            registrationExpiry: payload.vehicle.registrationExpiry ? payload.vehicle.registrationExpiry.slice(0, 10) : "",
            insuranceExpiry: payload.vehicle.insuranceExpiry ? payload.vehicle.insuranceExpiry.slice(0, 10) : "",
            serialNumber: payload.vehicle.serialNumber || "",
            chassisNumber: payload.vehicle.chassisNumber || "",
            projectName: payload.vehicle.projectName || "",
            driverName: payload.vehicle.driverName || "",
            status: payload.vehicle.status || "Active",
          });
        }
      } catch (error) {
        if (isMounted) {
          setState((prev) => ({ ...prev, loading: false, error: error.message || "Failed to load vehicle." }));
        }
      }
    };
    loadVehicle();
    return () => {
      isMounted = false;
    };
  }, [vehicleId]);

  useEffect(() => {
    return () => {
      if (newPhotoFile && newPhotoFile.previewUrl) {
        URL.revokeObjectURL(newPhotoFile.previewUrl);
      }
    };
  }, [newPhotoFile]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0] || null;
    setNewPhotoFile((prev) => {
      if (prev?.previewUrl) {
        URL.revokeObjectURL(prev.previewUrl);
      }
      if (!file) return null;
      const previewUrl = URL.createObjectURL(file);
      return Object.assign(file, { previewUrl });
    });
  };

  const currentPhotoUrl = useMemo(() => resolveVehiclePhotoUrl(state.vehicle?.photo), [state.vehicle?.photo]);
  const newPhotoPreviewUrl = newPhotoFile?.previewUrl;
  const registrationImages = state.uploads?.registrationImages || [];

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!vehicleId) return;
    setState((prev) => ({ ...prev, saving: true, error: "", success: "" }));
    try {
      const updateResponse = await fetch(`/api/trucks/${vehicleId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const updatePayload = await updateResponse.json();
      if (!updateResponse.ok || !updatePayload.success) {
        throw new Error(updatePayload.error || "Failed to update vehicle.");
      }

      let latestVehicle = updatePayload.vehicle;
      let latestUploads = updatePayload.uploads || state.uploads;
      let messages = ["Vehicle details saved."];

      if (newPhotoFile) {
        const photoForm = new FormData();
        photoForm.append("photo", newPhotoFile);

        const photoResponse = await fetch(`/api/trucks/${vehicleId}/photo`, {
          method: "POST",
          body: photoForm,
        });
        const photoPayload = await photoResponse.json();
        if (!photoResponse.ok || !photoPayload.success) {
          throw new Error(photoPayload.error || "Failed to update vehicle photo.");
        }
        latestVehicle = photoPayload.vehicle;
        messages.push("Photo updated.");
        setNewPhotoFile((prev) => {
          if (prev?.previewUrl) {
            URL.revokeObjectURL(prev.previewUrl);
          }
          return null;
        });
      }

      setState((prev) => ({
        ...prev,
        saving: false,
        success: messages.join(" "),
        vehicle: latestVehicle,
        uploads: latestUploads,
      }));
    } catch (error) {
      setState((prev) => ({ ...prev, saving: false, error: error.message || "Failed to update vehicle." }));
    }
  };

  const headerSubtitle = useMemo(() => {
    if (!state.vehicle) return "Edit the selected truck.";
    return `Editing ${state.vehicle.brand} ${state.vehicle.model} • ${state.vehicle.plateNumber}`;
  }, [state.vehicle]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-8 text-gray-900 sm:px-8 sm:py-10">
      <div className="mx-auto max-w-4xl space-y-8">
        <header className="flex flex-col gap-4 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-black">Edit Truck</h1>
            <p className="text-sm text-gray-600">{headerSubtitle}</p>
          </div>
          <Link
            href="/dashboard/fleet"
            className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
          >
            ← Back to Fleet
          </Link>
        </header>

        {state.error && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {state.error}
          </p>
        )}

        {state.loading ? (
          <p className="text-sm text-gray-600">Loading vehicle...</p>
        ) : (
          <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <Fieldset title="Vehicle Identity">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Input label="Plate Number" name="plateNumber" value={form.plateNumber || ""} onChange={handleChange} required />
                  <Input label="Brand" name="brand" value={form.brand || ""} onChange={handleChange} required />
                  <Input label="Model" name="model" value={form.model || ""} onChange={handleChange} required />
                  <Input label="Year" name="year" type="number" value={form.year || ""} onChange={handleChange} required />
                  <Input label="Color" name="color" value={form.color || ""} onChange={handleChange} required />
                  <Select label="Status" name="status" value={form.status || "Active"} onChange={handleChange} options={statusOptions} />
                </div>
              </Fieldset>

              <Fieldset title="Display Photo">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <p className="mb-2 text-sm font-medium text-gray-800">Current Photo</p>
                    <div className="h-48 w-full overflow-hidden rounded-2xl border border-gray-200 bg-gray-100">
                      {currentPhotoUrl ? (
                        <img src={currentPhotoUrl} alt="Current vehicle" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-sm text-gray-500">No photo available</div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-800">Upload New Photo</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                      />
                    </div>
                    {newPhotoPreviewUrl && (
                      <div>
                        <p className="text-xs text-gray-500">Preview</p>
                        <div className="mt-1 h-32 w-full overflow-hidden rounded-2xl border border-gray-200 bg-gray-100">
                          <img src={newPhotoPreviewUrl} alt="New preview" className="h-full w-full object-cover" />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setNewPhotoFile((prev) => {
                              if (prev?.previewUrl) {
                                URL.revokeObjectURL(prev.previewUrl);
                              }
                              return null;
                            });
                          }}
                          className="mt-2 text-xs font-semibold text-red-600 hover:underline"
                        >
                          Remove new photo
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </Fieldset>

              <Fieldset title="Assignments">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Input label="Project Name" name="projectName" value={form.projectName || ""} onChange={handleChange} placeholder="Optional" />
                  <Input label="Driver Name" name="driverName" value={form.driverName || ""} onChange={handleChange} placeholder="Optional" />
                  <Input label="Serial Number" name="serialNumber" value={form.serialNumber || ""} onChange={handleChange} placeholder="Optional" />
                  <Input label="Chassis Number" name="chassisNumber" value={form.chassisNumber || ""} onChange={handleChange} placeholder="Optional" />
                </div>
              </Fieldset>

              <Fieldset title="Specifications">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Input label="Equipment Type" name="equipmentType" value={form.equipmentType || ""} onChange={handleChange} placeholder="e.g. Compactor" />
                  <Input label="Fuel Type" name="fuelType" value={form.fuelType || ""} onChange={handleChange} placeholder="e.g. Diesel" />
                  <Input
                    label="Tank Capacity (Liters)"
                    name="tankCapacityLiters"
                    type="number"
                    value={form.tankCapacityLiters ?? ""}
                    onChange={handleChange}
                    placeholder="Optional"
                  />
                  <Input
                    label="Initial Odometer (KM)"
                    name="initialOdometerKm"
                    type="number"
                    value={form.initialOdometerKm ?? ""}
                    onChange={handleChange}
                    placeholder="Optional"
                  />
                </div>
              </Fieldset>

              <Fieldset title="Compliance & Dates">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Input label="Purchase Date" name="purchaseDate" type="date" value={form.purchaseDate || ""} onChange={handleChange} />
                  <Input label="Registration Expiry" name="registrationExpiry" type="date" value={form.registrationExpiry || ""} onChange={handleChange} />
                  <Input label="Insurance Expiry" name="insuranceExpiry" type="date" value={form.insuranceExpiry || ""} onChange={handleChange} />
                </div>
              </Fieldset>

              <Fieldset title="Registration Documents">
                {registrationImages.length ? (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {registrationImages.map((doc, index) => {
                      const docUrl = resolveUploadEntryUrl(doc);
                      return (
                        <a
                          key={`${doc.remotePath || doc.localPath || index}`}
                          href={docUrl || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group block rounded-2xl border border-gray-200 bg-gray-50 p-4 transition hover:border-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
                        >
                          <div className="h-40 w-full overflow-hidden rounded-xl bg-white">
                            {docUrl ? (
                              <img src={docUrl} alt={doc.originalName || `document-${index + 1}`} className="h-full w-full object-cover transition group-hover:scale-105" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-sm text-gray-500">Preview unavailable</div>
                            )}
                          </div>
                          <p className="mt-2 text-xs text-gray-600">{doc.originalName || `Document ${index + 1}`}</p>
                        </a>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">No registration documents uploaded for this truck.</p>
                )}
              </Fieldset>

              {state.success && <p className="text-sm text-green-600">{state.success}</p>}

              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={state.saving}
                  className="rounded-xl bg-black px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-gray-900 disabled:cursor-not-allowed disabled:bg-gray-500"
                >
                  {state.saving ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/dashboard/fleet")}
                  className="rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>
        )}
      </div>
    </main>
  );
}

function Fieldset({ title, children }) {
  return (
    <fieldset className="rounded-2xl border border-gray-200 p-5">
      <legend className="px-2 text-sm font-semibold uppercase tracking-wide text-gray-600">{title}</legend>
      <div className="mt-4">{children}</div>
    </fieldset>
  );
}

function Input({ label, className = "", ...props }) {
  return (
    <div className="space-y-1 text-sm">
      <label className="font-medium text-gray-800">{label}</label>
      <input
        {...props}
        className={`w-full rounded-xl border border-gray-300 px-3 py-2 focus:border-black focus:outline-none focus:ring-2 focus:ring-black ${className}`}
      />
    </div>
  );
}

function Select({ label, name, value, onChange, options = [] }) {
  return (
    <div className="space-y-1 text-sm">
      <label className="font-medium text-gray-800">{label}</label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:border-black focus:outline-none focus:ring-2 focus:ring-black"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}
