import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-5xl">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Admin</h1>
            <p className="text-sm text-slate-600">Manage users and Study IDs</p>
          </div>
          <nav className="flex gap-3 text-sm">
            <Link className="rounded-lg border px-3 py-2 hover:bg-slate-50" href="/admin">
              Overview
            </Link>
            <Link className="rounded-lg border px-3 py-2 hover:bg-slate-50" href="/admin/users">
              Users
            </Link>
            <Link className="rounded-lg border px-3 py-2 hover:bg-slate-50" href="/admin/invites">
              Invite Keys
            </Link>
          </nav>
        </header>

        <div className="mt-6">{children}</div>
      </div>
    </main>
  );
}
