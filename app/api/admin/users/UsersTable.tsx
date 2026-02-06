"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type UserRow = {
  id: string;
  email: string;
  role: "ADMIN" | "PARTICIPANT";
  status: "active" | "inactive";
  createdAt: string;
  participant?: { studyCode: string } | null;
};

export default function UsersTable() {
  const router = useRouter();
  const [rows, setRows] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/admin/users");
    const data = await res.json();
    setLoading(false);

    if (!data.ok) {
      setError(data.error ?? "Failed to load users.");
      return;
    }
    setRows(data.users);
  }

  useEffect(() => {
    load();
  }, []);

  async function patchUser(id: string, body: any) {
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!data.ok) {
      alert(data.error ?? "Update failed.");
      return;
    }
    await load();
    router.refresh();
  }

  async function deleteUser(id: string) {
    if (!confirm("Delete this user? This cannot be undone.")) return;
    const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!data.ok) {
      alert(data.error ?? "Delete failed.");
      return;
    }
    await load();
    router.refresh();
  }

  if (loading) return <p className="mt-4 text-sm text-slate-600">Loading…</p>;
  if (error) return <p className="mt-4 text-sm text-red-600">{error}</p>;

  return (
    <div className="mt-6 overflow-x-auto">
      <table className="w-full text-left text-sm text-black">
        <thead className="border-b text-slate-600 text-black    ">
          <tr>
            <th className="py-2">Email</th>
            <th className="py-2">Study ID</th>
            <th className="py-2">Role</th>
            <th className="py-2">Status</th>
            <th className="py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((u) => (
            <tr key={u.id} className="border-b">
              <td className="py-2">{u.email}</td>
              <td className="py-2">{u.participant?.studyCode ?? "—"}</td>
              <td className="py-2">{u.role}</td>
              <td className="py-2">{u.status}</td>
              <td className="py-2 flex gap-2">
                <button
                  className="rounded-lg border px-3 py-1 hover:bg-slate-50"
                  onClick={() =>
                    patchUser(u.id, { status: u.status === "active" ? "inactive" : "active" })
                  }
                >
                  {u.status === "active" ? "Deactivate" : "Activate"}
                </button>

                <button
                  className="rounded-lg border px-3 py-1 hover:bg-slate-50"
                  onClick={() =>
                    patchUser(u.id, { role: u.role === "ADMIN" ? "PARTICIPANT" : "ADMIN" })
                  }
                >
                  Toggle Role
                </button>

                <button
                  className="rounded-lg border px-3 py-1 text-red-600 hover:bg-red-50"
                  onClick={() => deleteUser(u.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
