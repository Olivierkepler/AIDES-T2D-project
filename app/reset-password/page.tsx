"use client";

import React, { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Loader2, ArrowRight } from "lucide-react";

function cn(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const token = sp.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    if (!token) return false;
    if (password.length < 8) return false;
    if (password !== confirm) return false;
    return !loading;
  }, [token, password, confirm, loading]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json().catch(() => ({}));
      if (!data.ok) {
        setError(data.error ?? "Reset failed.");
        return;
      }

      setDone(true);
      setTimeout(() => router.push("/login"), 800);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#071a3a]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#071a3a]/70 via-[#071a3a]/75 to-[#071a3a]/90" />
        <div
          className="absolute inset-0 opacity-[0.14]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.18) 1px, transparent 1px), linear-gradient(to right, rgba(255,255,255,0.18) 1px, transparent 1px)",
            backgroundSize: "52px 52px",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-[#f2b01e]/20 blur-3xl" />
        <div className="absolute -right-24 bottom-10 h-72 w-72 rounded-full bg-[#0b4db3]/20 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-6xl items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-semibold tracking-tight text-white">Reset password</h1>
            <p className="mt-1 text-sm text-white/75">Choose a new password for your account.</p>
          </div>

          <div className="rounded-3xl bg-white/[0.08] p-6 shadow-2xl ring-1 ring-white/15 backdrop-blur-xl">
            <div className="mb-5 h-1 w-16 rounded-full bg-[#f2b01e]" />

            {done ? (
              <div className="rounded-2xl border border-white/15 bg-white/[0.06] p-4 text-sm text-white/80">
                <p className="font-semibold text-white">Password updated</p>
                <p className="mt-1 text-white/75">Redirecting you to Log In…</p>
              </div>
            ) : (
              <form className="space-y-4" onSubmit={onSubmit}>
                {!token ? (
                  <div className="rounded-2xl border border-red-400/25 bg-red-500/10 p-3 text-sm text-red-100">
                    Missing or invalid reset token. Please request a new reset link.
                  </div>
                ) : null}

                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-white/75">New password</span>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/45" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 8 characters"
                      className={cn(
                        "w-full rounded-2xl bg-white/5 px-10 py-3 text-sm text-white placeholder:text-white/35",
                        "ring-1 ring-white/15 outline-none",
                        "focus:ring-2 focus:ring-[#f2b01e]/60"
                      )}
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-white/75">Confirm password</span>
                  <input
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Repeat new password"
                    className={cn(
                      "w-full rounded-2xl bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/35",
                      "ring-1 ring-white/15 outline-none",
                      "focus:ring-2 focus:ring-[#f2b01e]/60"
                    )}
                  />
                </label>

                {password && password.length < 8 ? (
                  <p className="text-xs text-white/60">Password must be at least 8 characters.</p>
                ) : null}
                {confirm && password !== confirm ? (
                  <p className="text-xs text-white/60">Passwords do not match.</p>
                ) : null}

                {error ? (
                  <div className="rounded-2xl border border-red-400/25 bg-red-500/10 p-3 text-sm text-red-100">
                    {error}
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={!canSubmit}
                  className={cn(
                    "inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold",
                    "bg-[#f2b01e] text-[#071a3a]",
                    "shadow-[0_12px_30px_-16px_rgba(242,176,30,0.75)]",
                    "transition active:scale-[0.99] hover:brightness-[1.03]",
                    "disabled:cursor-not-allowed disabled:opacity-60"
                  )}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Updating…
                    </>
                  ) : (
                    <>
                      Update password <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>

                <p className="text-center text-xs text-white/55">
                  <a className="underline decoration-white/35 underline-offset-4 hover:decoration-white/70" href="/login">
                    Back to Log In
                  </a>
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
