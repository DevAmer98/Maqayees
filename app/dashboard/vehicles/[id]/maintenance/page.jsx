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
        {/* Table view (desktop) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden shadow-sm bg-white">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Mileage</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Type</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Workshop</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Details</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Cost (SAR)</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Next Due</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Attachment</th>
                <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.map((rec) => (
                <tr
                  key={rec.id}
                  className="border-t hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3">{rec.date}</td>
                  <td className="px-4 py-3">{rec.mileage.toLocaleString()}</td>
                  <td className="px-4 py-3">{rec.type}</td>
                  <td className="px-4 py-3">{rec.workshop}</td>
                  <td className="px-4 py-3 text-gray-600 truncate max-w-xs">
                    {rec.details}
                  </td>
                  <td className="px-4 py-3">{rec.cost}</td>
                  <td className="px-4 py-3">{rec.nextDueDate}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        rec.status === "Completed"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {rec.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {rec.attachment ? (
                      <a
                        href={rec.attachment}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm"
                      >
                        View
                      </a>
                    ) : (
                      <span className="text-gray-400 text-sm">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right space-x-3">
                    <button className="text-blue-600 hover:underline text-sm">
                      Edit
                    </button>
                    <button className="text-red-600 hover:underline text-sm">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Card view (mobile) */}
        <div className="grid gap-4 md:hidden">
          {records.map((rec) => (
            <div
              key={rec.id}
              className="border rounded-lg p-4 bg-white shadow-sm flex flex-col space-y-3"
            >
              <div className="flex justify-between">
                <h2 className="font-semibold text-gray-800">{rec.type}</h2>
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

              <p className="text-sm text-gray-600">
                <strong>Date:</strong> {rec.date}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Mileage:</strong> {rec.mileage.toLocaleString()} km
              </p>
              <p className="text-sm text-gray-600">
                <strong>Workshop:</strong> {rec.workshop}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Cost:</strong> {rec.cost} SAR
              </p>
              <p className="text-sm text-gray-600">
                <strong>Next Due:</strong> {rec.nextDueDate}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Details:</strong> {rec.details}
              </p>

              {rec.attachment && (
                <img
                  src={rec.attachment}
                  alt="Maintenance"
                  className="w-full h-40 object-cover rounded-lg border"
                />
              )}

              <div className="flex justify-end space-x-3 pt-2">
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
