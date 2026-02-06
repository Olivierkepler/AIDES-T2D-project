"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Invite = {
  id: string;
  studyCode: string;
  emailAllowed: string | null;
  redeemedAt: string | null;
  redeemedBy: string | null;
  createdAt: string;
};

export default function InvitesTable() {
  const router = useRouter();
  const [rows, setRows] = useState<Invite[]>([]);
  const [emailAllowed, setEmailAllowed] = useState("");
  const [studyCode, setStudyCode] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/invites");
    const data = await res.json();
    setRows(data.invites ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function createInvite() {
    const res = await fetch("/api/admin/invites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studyCode: studyCode.trim() || undefined,
        emailAllowed: emailAllowed.trim() || null,
      }),
    });
    const data = await res.json();
    if (!data.ok) {
      alert(data.error ?? "Create failed.");
      return;
    }
    setStudyCode("");
    setEmailAllowed("");
    await load();
    router.refresh();
  }

  async function deleteInvite(code: string) {
    if (!confirm(`Delete unused Study ID ${code}?`)) return;
    const res = await fetch(`/api/admin/invites/${encodeURIComponent(code)}`, { method: "DELETE" });
    const data = await res.json();
    if (!data.ok) {
      alert(data.error ?? "Delete failed.");
      return;
    }
    await load();
    router.refresh();
  }

  return (
    <div className="mt-6">
      <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-end">
        <div className="flex-1">
          <label className="text-xs text-slate-600 text-black">Study ID (optional)</label>
          <input
            className="mt-1 w-full rounded-xl border px-3 py-2 text-black"
            value={studyCode}
            onChange={(e) => setStudyCode(e.target.value)}
            placeholder="Leave empty to auto-generate"
          />
        </div>
        <div className="flex-1">
          <label className="text-xs text-slate-600 text-black">Lock to Email (optional)</label>
          <input
            className="mt-1 w-full rounded-xl border px-3 py-2 text-black"
            value={emailAllowed}
            onChange={(e) => setEmailAllowed(e.target.value)}
            placeholder="user@example.com"
          />
        </div>
        <button
          className="rounded-xl bg-slate-900 px-4 py-2 text-white text-black"
          onClick={createInvite}
        >
          Create
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-slate-600 text-black ">Loading…</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-black">
            <thead className="border-b text-slate-600 text-black">
              <tr>
                <th className="py-2 text-black">Study ID</th>
                <th className="py-2 text-black">Email Locked</th>
                <th className="py-2 text-black">Redeemed</th>
                <th className="py-2 text-black">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((i) => (
                <tr key={i.id} className="border-b">
                  <td className="py-2 font-mono text-black">{i.studyCode}</td>
                  <td className="py-2 text-black">{i.emailAllowed ?? "—"}</td>
                  <td className="py-2 text-black">{i.redeemedAt ? "Yes" : "No"}</td>
                  <td className="py-2 text-black">
                    {!i.redeemedAt ? (
                      <button
                        className="rounded-lg border px-3 py-1 text-red-600 hover:bg-red-50"
                        onClick={() => deleteInvite(i.studyCode)}
                      >
                        Delete
                      </button>
                    ) : (
                      <span className="text-slate-500 text-black">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
