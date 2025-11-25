// app/dashboard/vehicles/add/page.jsx
"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function AddVehiclesPage() {
  const [formData, setFormData] = useState({
    plateNumber: "",
    model: "",
    brand: "",
    year: "",
    color: "",
    registrationExpiry: "",
    insuranceExpiry: "",
    equipmentType: "",
    tankCapacityLiters: "",
    purchaseDate: "",
    initialOdometerKm: "",
    driver: "",
    project: "",
    photo: null,
  });

  // Example data; later you’ll load these from backend APIs
  const drivers = ["John Doe", "Ali Hassan", "Mohammed Saleh"];
  const projects = ["Project A", "Project B", "Project C"];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData((prev) => ({ ...prev, photo: file }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const form = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value) form.append(key, value);
    });

    try {
      console.log("Vehicle submitted:", Object.fromEntries(form));
      // Later: await fetch("/api/vehicles", { method: "POST", body: form });
    } catch (err) {
      console.error(err);
      alert("Error saving vehicle");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-4 px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Add Vehicle</h1>
          <p className="text-sm text-gray-500">
            Register a new vehicle and assign it to a driver/project
          </p>
        </div>

        <Link
          href="/dashboard/vehicles"
          className="text-sm text-gray-600 hover:text-blue-600 transition mt-3 sm:mt-0"
        >
          ← Back to Vehicles
        </Link>
      </header>

      {/* Form Section */}
      <main className="flex-1 p-6 md:p-10 flex justify-center">
        <form
          onSubmit={handleSubmit}
          className="bg-white w-full max-w-3xl p-6 rounded-xl shadow-sm border border-gray-200"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {/* Vehicle Info */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Plate Number
              </label>
              <input
                type="text"
                name="plateNumber"
                value={formData.plateNumber}
                onChange={handleChange}
                placeholder="e.g. ABC-1234"
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Brand
              </label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                placeholder="e.g. Toyota"
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Model
              </label>
              <input
                type="text"
                name="model"
                value={formData.model}
                onChange={handleChange}
                placeholder="e.g. Hilux"
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Year
              </label>
              <input
                type="number"
                name="year"
                value={formData.year}
                onChange={handleChange}
                placeholder="e.g. 2022"
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Color
              </label>
              <input
                type="text"
                name="color"
                value={formData.color}
                onChange={handleChange}
                placeholder="e.g. White"
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Equipment Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Equipment Type
              </label>
              <select
                name="equipmentType"
                value={formData.equipmentType}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Type</option>
                <option value="Compactor">Compactor</option>
                <option value="Pickup">Pickup</option>
                <option value="Loader">Loader</option>
                <option value="Tanker">Tanker</option>
                <option value="Bus">Bus</option>
              </select>
            </div>

            {/* Tank Capacity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tank Capacity (Liters)
              </label>
              <input
                type="number"
                name="tankCapacityLiters"
                value={formData.tankCapacityLiters}
                onChange={handleChange}
                placeholder="e.g. 200"
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Purchase Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Purchase Date
              </label>
              <input
                type="date"
                name="purchaseDate"
                value={formData.purchaseDate}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Initial Odometer */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Initial Odometer (KM)
              </label>
              <input
                type="number"
                name="initialOdometerKm"
                value={formData.initialOdometerKm}
                onChange={handleChange}
                placeholder="e.g. 0"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Expiry Dates */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Registration Expiry
              </label>
              <input
                type="date"
                name="registrationExpiry"
                value={formData.registrationExpiry}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Insurance Expiry
              </label>
              <input
                type="date"
                name="insuranceExpiry"
                value={formData.insuranceExpiry}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Assignments */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assign to Driver
              </label>
              <select
                name="driver"
                value={formData.driver}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Driver</option>
                {drivers.map((driver) => (
                  <option key={driver} value={driver}>
                    {driver}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assign to Project
              </label>
              <select
                name="project"
                value={formData.project}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Project</option>
                {projects.map((project) => (
                  <option key={project} value={project}>
                    {project}
                  </option>
                ))}
              </select>
            </div>

            {/* Vehicle Photo Upload */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vehicle Photo
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />

              {/* Preview */}
              {formData.photo && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">Preview:</p>
                  <img
                    src={URL.createObjectURL(formData.photo)}
                    alt="Vehicle Preview"
                    className="w-full h-48 object-cover rounded-lg border"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Submit button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium shadow-sm transition"
            >
              Save Vehicle
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
