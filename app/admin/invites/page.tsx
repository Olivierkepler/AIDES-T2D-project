import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import InvitesTable from "./InvitesTable";

export default async function AdminInvitesPage() {
  const session = await requireAdmin();
  if (!session) redirect("/login?next=/admin/invites");

  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-black">Invite Keys (Study IDs)</h2>
      <p className="mt-1 text-sm text-slate-600 text-black">Create and manage unused Study IDs.</p>
      <InvitesTable />
    </div>
  );
}
