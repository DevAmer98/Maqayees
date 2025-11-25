"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function VehiclesPage() {
  const router = useRouter();

  const [vehicles, setVehicles] = useState([
    {
      id: 1,
      plateNumber: "ABC-1234",
      brand: "Toyota",
      model: "Hilux",
      year: 2022,
      color: "White",
      driver: "John Doe",
      project: "Project A",
      status: "Active",
      photo: "/images/truck.jpeg",
    },
    {
      id: 2,
      plateNumber: "XYZ-5678",
      brand: "Ford",
      model: "Ranger",
      year: 2021,
      color: "Black",
      driver: "Ali Hassan",
      project: "Project B",
      status: "Inactive",
      photo: "/images/truck.jpeg",
    },
    {
      id: 3,
      plateNumber: "JKL-9876",
      brand: "Nissan",
      model: "Navara",
      year: 2023,
      color: "Silver",
      driver: "Mohammed Saleh",
      project: "Project A",
      status: "Active",
      photo: "/images/truck.jpeg",
    },
  ]);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [projectFilter, setProjectFilter] = useState("All");

  // Navigate when clicking a row/card
  const handleRowClick = (vehicleId) => {
    router.push(`/dashboard/vehicles/${vehicleId}`);
  };

  // Compute filtered list
  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      const matchesSearch =
        v.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.driver.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.project.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "All" || v.status === statusFilter;

      const matchesProject =
        projectFilter === "All" || v.project === projectFilter;

      return matchesSearch && matchesStatus && matchesProject;
    });
  }, [vehicles, searchTerm, statusFilter, projectFilter]);

  // Unique project list for dropdown
  const projectList = ["All", ...new Set(vehicles.map((v) => v.project))];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="w-full bg-white border-b border-gray-200 py-4 px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Vehicles</h1>
          <p className="text-sm text-gray-500">
            Manage and track all company vehicles
          </p>
        </div>

        <div className="flex items-center gap-3 mt-3 sm:mt-0">
          <Link
            href="/"
            className="text-sm text-gray-600 hover:text-blue-600 transition"
          >
            ← Back to Dashboard
          </Link>
          <Link
            href="/dashboard/vehicles/add"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm shadow-sm transition"
          >
            + Add Vehicle
          </Link>
        </div>
      </header>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200 p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Search */}
        <input
          type="text"
          placeholder="Search by plate, driver, project..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:w-1/3 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
        />

        {/* Filters */}
        <div className="flex flex-wrap gap-3 sm:gap-4 items-center">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>

          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
          >
            {projectList.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 p-4 sm:p-6 md:p-8">
        {/* Table view for desktop */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden shadow-sm bg-white">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">Photo</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Plate</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Brand</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Model</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Year</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Color</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Driver</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Project</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredVehicles.length > 0 ? (
                filteredVehicles.map((vehicle) => (
                  <tr
                    key={vehicle.id}
                    onClick={() => handleRowClick(vehicle.id)}
                    className="border-t hover:bg-blue-50 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3">
                      <img
                        src={vehicle.photo}
                        alt={vehicle.model}
                        className="w-16 h-12 object-cover rounded-lg border"
                      />
                    </td>
                    <td className="px-4 py-3">{vehicle.plateNumber}</td>
                    <td className="px-4 py-3">{vehicle.brand}</td>
                    <td className="px-4 py-3">{vehicle.model}</td>
                    <td className="px-4 py-3">{vehicle.year}</td>
                    <td className="px-4 py-3">{vehicle.color}</td>
                    <td className="px-4 py-3">{vehicle.driver}</td>
                    <td className="px-4 py-3">{vehicle.project}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          vehicle.status === "Active"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {vehicle.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="9"
                    className="text-center py-8 text-gray-500 text-sm"
                  >
                    No vehicles found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Card view for mobile */}
        <div className="grid gap-4 md:hidden">
          {filteredVehicles.map((vehicle) => (
            <div
              key={vehicle.id}
              onClick={() => handleRowClick(vehicle.id)}
              className="border rounded-lg p-4 bg-white shadow-sm flex flex-col space-y-3 hover:bg-blue-50 cursor-pointer transition"
            >
              <div className="flex justify-between items-center">
                <h2 className="font-semibold text-gray-800">
                  {vehicle.plateNumber}
                </h2>
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
              <img
                src={vehicle.photo}
                alt={vehicle.model}
                className="w-full h-40 object-cover rounded-lg border"
              />
              <p className="text-sm text-gray-600">
                <strong>Brand:</strong> {vehicle.brand}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Model:</strong> {vehicle.model}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Year:</strong> {vehicle.year} |{" "}
                <strong>Color:</strong> {vehicle.color}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Driver:</strong> {vehicle.driver}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Project:</strong> {vehicle.project}
              </p>
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
