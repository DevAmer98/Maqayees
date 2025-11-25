"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function SingleVehiclePage() {
  const { id } = useParams();

  // Example static data — replace later with API fetch
  const [vehicle, setVehicle] = useState({
    id,
    photo: "/images/sample-vehicle.jpg",
    plateNumber: "ABC-1234",
    brand: "Toyota",
    model: "Hilux",
    year: 2022,
    color: "White",
    driver: "John Doe",
    project: "Project A",
    lastServiceDate: "2025-08-15",
    nextServiceDue: "2026-02-15",
    status: "Active",
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-4 px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Vehicle Details
          </h1>
          <p className="text-sm text-gray-500">
            Overview and maintenance summary for this vehicle
          </p>
        </div>

        <div className="flex items-center gap-3 mt-3 sm:mt-0">
          <Link
            href="/dashboard/vehicles"
            className="text-sm text-gray-600 hover:text-blue-600 transition"
          >
            ← Back to Vehicles
          </Link>
          <Link
            href={`/dashboard/vehicles/${id}/maintenance`}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm shadow-sm transition"
          >
            View Maintenance
          </Link>
        </div>
      </header>

      {/* Vehicle Details */}
      <main className="flex-1 p-6 md:p-10 flex justify-center">
        <div className="bg-white w-full max-w-4xl p-6 rounded-xl shadow-sm border border-gray-200">
          {/* Vehicle Photo */}
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-1/3">
              <img
                src={vehicle.photo}
                alt={vehicle.model}
                className="w-full h-56 object-cover rounded-lg border"
              />
            </div>

            {/* Info */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h2 className="text-sm text-gray-500 mb-1">Plate Number</h2>
                <p className="font-semibold text-gray-800">
                  {vehicle.plateNumber}
                </p>
              </div>

              <div>
                <h2 className="text-sm text-gray-500 mb-1">Brand</h2>
                <p className="font-semibold text-gray-800">{vehicle.brand}</p>
              </div>

              <div>
                <h2 className="text-sm text-gray-500 mb-1">Model</h2>
                <p className="font-semibold text-gray-800">{vehicle.model}</p>
              </div>

              <div>
                <h2 className="text-sm text-gray-500 mb-1">Year</h2>
                <p className="font-semibold text-gray-800">{vehicle.year}</p>
              </div>

              <div>
                <h2 className="text-sm text-gray-500 mb-1">Color</h2>
                <p className="font-semibold text-gray-800">{vehicle.color}</p>
              </div>

              <div>
                <h2 className="text-sm text-gray-500 mb-1">Driver</h2>
                <p className="font-semibold text-gray-800">{vehicle.driver}</p>
              </div>

              <div>
                <h2 className="text-sm text-gray-500 mb-1">Project</h2>
                <p className="font-semibold text-gray-800">{vehicle.project}</p>
              </div>

              <div>
                <h2 className="text-sm text-gray-500 mb-1">Status</h2>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    vehicle.status === "Active"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {vehicle.status}
                </span>
              </div>

              <div>
                <h2 className="text-sm text-gray-500 mb-1">
                  Last Service Date
                </h2>
                <p className="font-semibold text-gray-800">
                  {vehicle.lastServiceDate}
                </p>
              </div>

              <div>
                <h2 className="text-sm text-gray-500 mb-1">
                  Next Service Due
                </h2>
                <p className="font-semibold text-gray-800">
                  {vehicle.nextServiceDue}
                </p>
              </div>
            </div>
          </div>

          {/* Divider */}
          <hr className="my-6 border-gray-200" />

          {/* Quick Actions */}
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <Link
              href={`/dashboard/vehicles/${id}/maintenance/add`}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium shadow-sm transition text-center"
            >
              + Add Maintenance Record
            </Link>

            <button className="border border-gray-300 hover:border-gray-400 text-gray-700 px-6 py-2 rounded-lg text-sm font-medium transition">
              Edit Vehicle Info
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-sm text-gray-500 py-4 border-t bg-white">
        © {new Date().getFullYear()} Dashboard System
      </footer>
    </div>
  );
}
