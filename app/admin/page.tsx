import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";

export default async function AdminHome() {
  const session = await requireAdmin();
  if (!session) redirect("/login?next=/admin");

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Link href="/admin/users" className="rounded-2xl border bg-white p-6 shadow-sm hover:bg-slate-50 text-black">
        <h2 className="text-lg font-semibold text-black">Users</h2>
        <p className="mt-1 text-sm text-slate-600">View, deactivate, or delete accounts.</p>
      </Link>

      <Link href="/admin/invites" className="rounded-2xl border bg-white p-6 shadow-sm hover:bg-slate-50 text-black">
        <h2 className="text-lg font-semibold text-black">Invite Keys</h2>
        <p className="mt-1 text-sm text-slate-600">Create Study IDs and manage unused keys.</p>
      </Link>
    </div>
  );
}
