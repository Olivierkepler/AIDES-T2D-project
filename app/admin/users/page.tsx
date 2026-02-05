import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import UsersTable from "@/app/api/admin/users/UsersTable";

export default async function AdminUsersPage() {
  const session = await requireAdmin();
  if (!session) redirect("/login?next=/admin/users");

  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold">Users</h2>
      <p className="mt-1 text-sm text-slate-600">Edit, deactivate, or delete users.</p>
      <UsersTable />
    </div>
  );
}
