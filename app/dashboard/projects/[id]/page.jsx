"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function ProjectDetailsPage() {
  const { id } = useParams();
  const router = useRouter();

  // Mock data (you can later fetch this dynamically from API)
  const mockProjects = [
    {
      id: "p1",
      name: "Project A",
      supervisor: "Ali Supervisor",
      status: "Active",
      progress: 75,
      startDate: "2025-01-10",
      endDate: "2025-06-10",
      duration: "6 months",
      city: "Riyadh",
      neighborhood: "Al Olaya",
      drivers: ["Ahmed Driver", "Omar Driver"],
      trucks: ["ABC-1234 (Hilux)", "XYZ-5678 (Isuzu NPR)"],
    },
    {
      id: "p2",
      name: "Project B",
      supervisor: "Sara Supervisor",
      status: "Pending",
      progress: 40,
      startDate: "2025-03-01",
      endDate: "2025-09-01",
      duration: "6 months",
      city: "Jeddah",
      neighborhood: "Al Rawdah",
      drivers: ["Yousef Driver"],
      trucks: ["JKL-4321 (Volvo FM)"],
    },
  ];

  const projectData = mockProjects.find((p) => p.id === id);

  const [project, setProject] = useState(projectData || null);
  const [editMode, setEditMode] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!projectData) {
      setMessage("⚠️ Project not found");
    }
  }, [projectData]);

  if (!project) {
    return (
      <div className="p-10 text-center text-gray-600">
        {message || "Loading project..."}
      </div>
    );
  }

  const handleSave = () => {
    setEditMode(false);
    setMessage("✅ Changes saved successfully!");
  };

  const handleChange = (field, value) => {
    setProject((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 md:p-10 text-gray-800"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-black">{project.name}</h1>
          <p className="text-sm text-gray-500">
            Project ID: <span className="font-mono">{project.id}</span>
          </p>
        </div>
        <button
          onClick={() => router.back()}
          className="text-sm px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
        >
          ← Back
        </button>
      </div>

      {/* Main Info Card */}
      <section className="bg-white rounded-2xl shadow p-6 border border-gray-200 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Project Information</h2>
          <button
            onClick={() => setEditMode((prev) => !prev)}
            className="text-sm px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition"
          >
            {editMode ? "Cancel" : "Edit"}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          {[
            ["Name", "name"],
            ["Supervisor", "supervisor"],
            ["Status", "status"],
            ["Start Date", "startDate"],
            ["End Date", "endDate"],
            ["Duration", "duration"],
            ["City", "city"],
            ["Neighborhood", "neighborhood"],
          ].map(([label, field]) => (
            <div key={field}>
              <label className="block font-medium text-gray-700 mb-1">
                {label}
              </label>
              {editMode ? (
                field === "status" ? (
                  <select
                    value={project[field]}
                    onChange={(e) => handleChange(field, e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black"
                  >
                    <option value="Active">Active</option>
                    <option value="Pending">Pending</option>
                    <option value="Not Started">Not Started</option>
                    <option value="Completed">Completed</option>
                  </select>
                ) : (
                  <input
                    value={project[field]}
                    onChange={(e) => handleChange(field, e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black"
                  />
                )
              ) : (
                <p className="text-gray-800">{project[field] || "-"}</p>
              )}
            </div>
          ))}
        </div>

        {editMode && (
          <div className="flex justify-end mt-4">
            <button
              onClick={handleSave}
              className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg font-semibold text-sm"
            >
              Save Changes
            </button>
          </div>
        )}

        {message && (
          <p className="text-sm mt-3 text-green-600 font-medium">{message}</p>
        )}
      </section>

      {/* Drivers */}
      <section className="bg-white rounded-2xl shadow p-6 border border-gray-200 mb-8">
        <h2 className="text-lg font-semibold mb-3">Assigned Drivers</h2>
        <div className="space-y-2">
          {project.drivers.map((driver, i) => (
            <div
              key={i}
              className="flex justify-between items-center bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg"
            >
              <span>{driver}</span>
              {editMode && (
                <button
                  onClick={() =>
                    setProject((prev) => ({
                      ...prev,
                      drivers: prev.drivers.filter((_, idx) => idx !== i),
                    }))
                  }
                  className="text-red-600 text-xs hover:underline"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
        {editMode && (
          <div className="mt-3">
            <input
              type="text"
              placeholder="Add new driver"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-2 focus:ring-2 focus:ring-black"
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.target.value.trim()) {
                  setProject((prev) => ({
                    ...prev,
                    drivers: [...prev.drivers, e.target.value.trim()],
                  }));
                  e.target.value = "";
                }
              }}
            />
          </div>
        )}
      </section>

      {/* Trucks */}
      <section className="bg-white rounded-2xl shadow p-6 border border-gray-200">
        <h2 className="text-lg font-semibold mb-3">Assigned Trucks</h2>
        <div className="space-y-2">
          {project.trucks.map((truck, i) => (
            <div
              key={i}
              className="flex justify-between items-center bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg"
            >
              <span>{truck}</span>
              {editMode && (
                <button
                  onClick={() =>
                    setProject((prev) => ({
                      ...prev,
                      trucks: prev.trucks.filter((_, idx) => idx !== i),
                    }))
                  }
                  className="text-red-600 text-xs hover:underline"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
        {editMode && (
          <div className="mt-3">
            <input
              type="text"
              placeholder="Add new truck"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-2 focus:ring-2 focus:ring-black"
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.target.value.trim()) {
                  setProject((prev) => ({
                    ...prev,
                    trucks: [...prev.trucks, e.target.value.trim()],
                  }));
                  e.target.value = "";
                }
              }}
            />
          </div>
        )}
      </section>
    </motion.div>
  );
}
