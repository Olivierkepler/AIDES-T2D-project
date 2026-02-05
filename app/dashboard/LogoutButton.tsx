"use client";

export default function LogoutButton() {
  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    window.location.href = "/login";
  }

  return (
    <button
      onClick={handleLogout}
      className="mt-6 rounded-xl bg-slate-900 px-4 py-2 text-white"
    >
      Logout
    </button>
  );
}
