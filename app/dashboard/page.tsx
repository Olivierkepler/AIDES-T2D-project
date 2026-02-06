// app/dashboard/page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE } from "@/lib/auth";
import LogoutButton from "./LogoutButton";
import CheckInCard from "./CheckInCard";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) redirect("/login");

  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!session || session.expiresAt <= new Date()) redirect("/login");

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-2xl rounded-2xl border bg-white p-6 shadow-sm text-black">
        <h1 className="text-2xl font-semibold text-black">Dashboard</h1>
        <p className="mt-2 text-slate-600 text-black">Logged in as: {session.user.email}</p>
        {(session.user as any).role === "ADMIN" && (
          <a
            href="/admin"
            className="mt-4 inline-block rounded-xl bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 text-black"
          >
            Go to Admin Page
          </a>
        )}

        <LogoutButton />

        <CheckInCard />
      </div>
    </main>
  );
}
