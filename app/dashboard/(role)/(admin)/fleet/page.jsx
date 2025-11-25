// app/dashboard/(role)/(admin)/fleet/page.jsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

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

export default function FleetInventoryPage() {
  const [state, setState] = useState({
    loading: true,
    error: "",
    vehicles: [],
  });
  const [search, setSearch] = useState("");

  useEffect(() => {
    let isMounted = true;
    const loadVehicles = async () => {
      setState((prev) => ({ ...prev, loading: true, error: "" }));
      try {
        const response = await fetch("/api/admin/trucks");
        const payload = await response.json();
        if (!response.ok || !payload.success) {
          throw new Error(payload.error || "Failed to load vehicles.");
        }
        if (isMounted) {
          setState({ loading: false, error: "", vehicles: payload.vehicles });
        }
      } catch (error) {
        if (isMounted) {
          setState((prev) => ({ ...prev, loading: false, error: error.message || "Failed to load vehicles." }));
        }
      }
    };

    loadVehicles();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredVehicles = useMemo(() => {
    if (!search.trim()) return state.vehicles;
    const term = search.toLowerCase();
    return state.vehicles.filter(
      (vehicle) =>
        vehicle.plateNumber.toLowerCase().includes(term) ||
        vehicle.brand.toLowerCase().includes(term) ||
        vehicle.model.toLowerCase().includes(term) ||
        (vehicle.projectName || "").toLowerCase().includes(term) ||
        (vehicle.driverName || "").toLowerCase().includes(term)
    );
  }, [search, state.vehicles]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-6 py-10 text-gray-900">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="flex flex-col gap-4 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-black">Fleet Inventory</h1>
            <p className="text-sm text-gray-600">Browse every registered truck and its assignment details.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search plate, driver, project..."
              className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black sm:w-72"
            />
            <Link
              href="/dashboard"
              className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
            >
              ← Back to Admin
            </Link>
          </div>
        </header>

        {state.error && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {state.error}
          </p>
        )}

        {state.loading && !state.vehicles.length ? (
          <p className="text-sm text-gray-600">Loading fleet data...</p>
        ) : filteredVehicles.length ? (
          <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredVehicles.map((vehicle) => {
              const photoUrl = resolveVehiclePhotoUrl(vehicle.photo);
              return (
                <Link
                  key={vehicle.id}
                  href={`/dashboard/fleet/${vehicle.id}`}
                  className="flex flex-col rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
                >
                  <div className="relative h-52 w-full overflow-hidden rounded-t-2xl bg-gray-200">
                    {photoUrl ? (
                      <img src={photoUrl} alt={`${vehicle.plateNumber} photo`} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-sm text-gray-500">Photo unavailable</div>
                    )}
                    <span className="absolute left-4 top-4 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-gray-800">
                      {vehicle.status || "Unknown"}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col gap-2 p-5 text-sm text-gray-700">
                    <p className="text-lg font-semibold text-black">
                      {vehicle.brand} {vehicle.model} • {vehicle.year}
                    </p>
                    <p>
                      <span className="font-medium text-black">Plate:</span> {vehicle.plateNumber}
                    </p>
                    <p>
                      <span className="font-medium text-black">Color:</span> {vehicle.color}
                    </p>
                    <p>
                      <span className="font-medium text-black">Equipment:</span> {vehicle.equipmentType || "—"}
                    </p>
                    <p>
                      <span className="font-medium text-black">Project:</span> {vehicle.projectName || "Unassigned"}
                    </p>
                    <p>
                      <span className="font-medium text-black">Driver:</span> {vehicle.driverName || "Unassigned"}
                    </p>
                    <p className="text-xs text-gray-500">
                      Added on {new Date(vehicle.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-xs font-semibold text-black/70">Edit truck →</p>
                  </div>
                </Link>
              );
            })}
          </section>
        ) : (
          <p className="text-sm text-gray-600">No vehicles matched your search.</p>
        )}
      </div>
    </main>
  );
}
