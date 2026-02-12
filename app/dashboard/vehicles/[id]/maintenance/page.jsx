"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function MaintenancePage() {
  const { id } = useParams();

  // Example static data (replace with API data later)
  const [records, setRecords] = useState([
    {
      id: 1,
      date: "2025-10-01",
      mileage: 52300,
      type: "PPM",
      workshop: "Al-Futtaim Service Center",
      details: "Oil change and tire rotation",
      cost: 450,
      nextDueDate: "2026-01-01",
      status: "Completed",
            attachment: "/images/truck.jpeg",
    },
    {
      id: 2,
      date: "2025-08-15",
      mileage: 48000,
      type: "Repair",
      workshop: "QuickFix Garage",
      details: "Replaced front brake pads",
      cost: 300,
      nextDueDate: "2025-12-15",
      status: "Completed",
            attachment: "/images/truck.jpeg",
    },
  ]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="w-full bg-white border-b border-gray-200 py-4 px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Maintenance History</h1>
          <p className="text-sm text-gray-500">
            All maintenance records for this vehicle
          </p>
        </div>

        <div className="flex items-center gap-3 mt-3 sm:mt-0">
          <Link
            href={`/dashboard/vehicles`}
            className="text-sm text-gray-600 hover:text-blue-600 transition"
          >
            ← Back to Vehicles
          </Link>

          <Link
            href={`/dashboard/vehicles/${id}/maintenance/add`}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm shadow-sm transition"
          >
            + Add Maintenance Record
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 p-4 sm:p-6 md:p-8">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {records.map((rec) => (
            <div
              key={rec.id}
              className="border rounded-lg p-4 bg-white shadow-sm flex flex-col space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold text-gray-800">{rec.type}</h2>
                  <p className="text-xs text-gray-500">Record #{rec.id}</p>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    rec.status === "Completed"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {rec.status}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
                <p>
                  <strong>Date:</strong> {rec.date}
                </p>
                <p>
                  <strong>Mileage:</strong> {rec.mileage.toLocaleString()} km
                </p>
                <p>
                  <strong>Workshop:</strong> {rec.workshop}
                </p>
                <p>
                  <strong>Cost:</strong> {rec.cost} SAR
                </p>
                <p className="sm:col-span-2">
                  <strong>Next Due:</strong> {rec.nextDueDate}
                </p>
                <p className="sm:col-span-2">
                  <strong>Details:</strong> {rec.details}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  <strong>Attachment:</strong>{" "}
                  {rec.attachment ? (
                    <a
                      href={rec.attachment}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      View file
                    </a>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </p>

                {rec.attachment && (
                  <img
                    src={rec.attachment}
                    alt="Maintenance"
                    className="w-full h-40 object-cover rounded-lg border"
                  />
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-1">
                <button className="text-blue-600 text-sm hover:underline">
                  Edit
                </button>
                <button className="text-red-600 text-sm hover:underline">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-sm text-gray-500 py-4 border-t bg-white">
        © {new Date().getFullYear()} Dashboard System
      </footer>
    </div>
  );
}
