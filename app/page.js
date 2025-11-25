"use client";

import Image from "next/image";
import Link from "next/link";

export default function Home() {
  const sections = [
    {
      title: "Users",
      description: "Manage managers, project managers, supervisors, and drivers.",
      href: "/dashboard/users",
      icon: "/icons/users-round.svg",
    },
    {
      title: "Projects",
      description: "View and manage ongoing projects.",
      href: "/dashboard/projects",
      icon: "/icons/map-pin-house.svg",
    },
    {
      title: "Vehicles",
      description: "Assign vehicles and monitor their usage.",
      href: "/dashboard/vehicles",
      icon: "/icons/truck.svg",
    },
    {
      title: "Reports",
      description: "Track performance and generate insights.",
      href: "/dashboard/reports",
      icon: "/icons/reports.svg",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      {/* Header */}
      <header className="flex flex-col items-center mb-10 text-center">
      
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Welcome to Your Dashboard
        </h1>
        <p className="text-gray-600">
          Manage users, projects, and vehicles from one place.
        </p>
      </header>

      {/* Main navigation grid */}
      <main className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">
        {sections.map((item) => (
          <Link
            key={item.title}
            href={item.href}
            className="group block p-6 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-500 transition-all duration-200"
          >
            <div className="flex items-center gap-4 mb-3">
              <div className="bg-blue-100 p-3 rounded-xl group-hover:bg-blue-200 transition">
                <Image
                  src={item.icon}
                  alt={`${item.title} icon`}
                  width={24}
                  height={24}
                />
              </div>
              <h2 className="text-lg font-semibold text-gray-800">
                {item.title}
              </h2>
            </div>
            <p className="text-sm text-gray-600">{item.description}</p>
          </Link>
        ))}
      </main>

      {/* Footer */}
      <footer className="mt-12 text-sm text-gray-500 text-center">
        Built with ❤️ By Smart Vision Solutions
      </footer>
    </div>
  );
}
