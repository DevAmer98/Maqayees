"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const ROLE_FILTERS = [
  { label: "All Personnel", value: "all" },
  { label: "Managers", value: "manager" },
  { label: "Project Managers", value: "project_manager" },
  { label: "Supervisors", value: "supervisor" },
  { label: "Drivers", value: "driver" },
  { label: "Maintenance", value: "maintenance" },
];

const formatRole = (role) => role?.replace(/_/g, " ") ?? "";

export default function UsersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleParam = searchParams.get("role") ?? "all";
  const queryParam = searchParams.get("q") ?? "";

  const [searchInput, setSearchInput] = useState(queryParam);
  const [state, setState] = useState({
    loading: true,
    error: "",
    users: [],
    pagination: { total: 0, page: 1, totalPages: 1 },
  });

  useEffect(() => {
    setSearchInput(queryParam);
  }, [queryParam]);

  useEffect(() => {
    const controller = new AbortController();
    const loadUsers = async () => {
      setState((prev) => ({ ...prev, loading: true, error: "" }));

      try {
        const params = new URLSearchParams();
        if (roleParam !== "all") params.set("role", roleParam);
        if (queryParam) params.set("q", queryParam);
        const queryString = params.toString();

        const response = await fetch(queryString ? `/api/admin/users?${queryString}` : "/api/admin/users", {
          signal: controller.signal,
        });
        const payload = await response.json();
        if (!response.ok || !payload.success) {
          throw new Error(payload.error || "Failed to load users.");
        }

        setState({
          loading: false,
          error: "",
          users: payload.users,
          pagination: payload.pagination,
        });
      } catch (error) {
        if (error.name === "AbortError") return;
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error.message || "Failed to load users.",
        }));
      }
    };

    loadUsers();
    return () => controller.abort();
  }, [roleParam, queryParam]);

  const roleFilterValue = ROLE_FILTERS.some((filter) => filter.value === roleParam)
    ? roleParam
    : "all";

  const selectedLabel = useMemo(() => {
    return ROLE_FILTERS.find((filter) => filter.value === roleFilterValue)?.label ?? "All Personnel";
  }, [roleFilterValue]);

  const handleRoleChange = (value) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete("role");
    } else {
      params.set("role", value);
    }
    const query = params.toString();
    router.replace(query ? `/dashboard/users?${query}` : "/dashboard/users", { scroll: false });
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (searchInput.trim()) {
      params.set("q", searchInput.trim());
    } else {
      params.delete("q");
    }
    const query = params.toString();
    router.replace(query ? `/dashboard/users?${query}` : "/dashboard/users", { scroll: false });
  };

  const handleClearFilters = () => {
    router.replace("/dashboard/users", { scroll: false });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="w-full bg-white border-b border-gray-200 py-4 px-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Team Directory</h1>
          <p className="text-sm text-gray-500">
            Browse all managers, supervisors, drivers, and more from one view.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link href="/dashboard" className="text-sm text-gray-600 hover:text-black transition">
            ← Back to Admin
          </Link>
          <Link
            href="/dashboard/users/add"
            className="bg-black hover:bg-gray-900 text-white px-4 py-2 rounded-lg text-sm shadow-sm transition"
          >
            + Add User
          </Link>
        </div>
      </header>

      <main className="flex-1 p-4 sm:p-6 md:p-8 space-y-6">
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex flex-wrap gap-2">
              {ROLE_FILTERS.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => handleRoleChange(filter.value)}
                  className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
                    roleFilterValue === filter.value
                      ? "border-black bg-black text-white shadow-sm"
                      : "border-gray-200 text-gray-600 hover:border-black/40"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSearchSubmit} className="flex w-full gap-2 sm:w-auto">
              <input
                type="search"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search name, email, phone..."
                className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black sm:min-w-[280px]"
              />
              <button
                type="submit"
                className="rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-900"
              >
                Search
              </button>
              {(queryParam || roleFilterValue !== "all") && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="rounded-xl border border-gray-300 px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100"
                >
                  Reset
                </button>
              )}
            </form>
          </div>
          <p className="mt-4 text-xs uppercase tracking-wide text-gray-500">
            Viewing: {selectedLabel} · {state.pagination.total} result(s)
          </p>
        </section>

        {state.error && (
          <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</p>
        )}

        <section className="space-y-5">
          {state.loading ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-500 shadow-sm">
              Loading team members...
            </div>
          ) : state.users.length ? (
            <>
              <div className="hidden overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm md:block">
                <table className="min-w-full text-sm text-gray-700">
                  <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold">Name</th>
                      <th className="px-4 py-3 text-left font-semibold">Email</th>
                      <th className="px-4 py-3 text-left font-semibold">Role</th>
                      <th className="px-4 py-3 text-left font-semibold">Phone</th>
                      <th className="px-4 py-3 text-left font-semibold">Iqama</th>
                      <th className="px-4 py-3 text-left font-semibold">Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {state.users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">{user.name}</td>
                        <td className="px-4 py-3">{user.email}</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gray-700">
                            {formatRole(user.role)}
                          </span>
                        </td>
                        <td className="px-4 py-3">{user.phone || "—"}</td>
                        <td className="px-4 py-3">{user.iqama || "—"}</td>
                        <td className="px-4 py-3 text-xs text-gray-500">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="grid gap-4 md:hidden">
                {state.users.map((user) => (
                  <div key={user.id} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-base font-semibold text-gray-900">{user.name}</h3>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gray-700">
                        {formatRole(user.role)}
                      </span>
                    </div>
                    <dl className="mt-3 space-y-1 text-sm text-gray-600">
                      <div>
                        <dt className="inline font-medium text-gray-800">Phone:</dt>{" "}
                        <dd className="inline">{user.phone || "—"}</dd>
                      </div>
                      <div>
                        <dt className="inline font-medium text-gray-800">Iqama:</dt>{" "}
                        <dd className="inline">{user.iqama || "—"}</dd>
                      </div>
                      <div>
                        <dt className="inline font-medium text-gray-800">Added:</dt>{" "}
                        <dd className="inline">{new Date(user.createdAt).toLocaleDateString()}</dd>
                      </div>
                    </dl>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center text-sm text-gray-500 shadow-sm">
              No team members found for this filter. Try a different role or reset the search.
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
