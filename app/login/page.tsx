"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, Loader2, ArrowRight } from "lucide-react";

function cn(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    return email.trim().length > 0 && password.length > 0 && !loading;
  }, [email, password, loading]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!data.ok) {
        setError(data.error ?? "Login failed.");
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        {/* Soft gradient blobs */}
        <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute -right-24 top-32 h-80 w-80 rounded-full bg-cyan-500/15 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-fuchsia-500/10 blur-3xl" />

        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(148,163,184,0.25) 1px, transparent 1px), linear-gradient(to right, rgba(148,163,184,0.25) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            backgroundPosition: "center",
          }}
        />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-6xl items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15">
              <Lock className="h-5 w-5 text-white/90" />
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-white">
              Welcome back
            </h1>
            <p className="mt-1 text-sm text-white/70">
              Sign in to access your dashboard.
            </p>
          </div>

          {/* Card */}
          <div className="rounded-3xl bg-white/[0.06] p-6 shadow-2xl ring-1 ring-white/10 backdrop-blur-xl">
            <form className="space-y-4" onSubmit={onSubmit}>
              {/* Email */}
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-white/70">
                  Email
                </span>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                  <input
                    autoComplete="email"
                    inputMode="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@umb.edu"
                    className={cn(
                      "w-full rounded-2xl bg-white/5 px-10 py-3 text-sm text-white placeholder:text-white/35",
                      "ring-1 ring-white/10 outline-none",
                      "focus:ring-2 focus:ring-indigo-400/60"
                    )}
                  />
                </div>
              </label>

              {/* Password */}
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-white/70">
                  Password
                </span>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                  <input
                    autoComplete="current-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={cn(
                      "w-full rounded-2xl bg-white/5 px-10 py-3 text-sm text-white placeholder:text-white/35",
                      "ring-1 ring-white/10 outline-none",
                      "focus:ring-2 focus:ring-indigo-400/60"
                    )}
                  />
                </div>
              </label>

              {/* Error */}
              {error ? (
                <div className="rounded-2xl border border-red-400/20 bg-red-500/10 p-3 text-sm text-red-200">
                  {error}
                </div>
              ) : null}

              {/* Submit */}
              <button
                type="submit"
                disabled={!canSubmit}
                className={cn(
                  "group inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold",
                  "bg-white text-slate-950",
                  "shadow-[0_10px_30px_-12px_rgba(255,255,255,0.35)]",
                  "transition active:scale-[0.99]",
                  "disabled:cursor-not-allowed disabled:opacity-60"
                )}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing in…
                  </>
                ) : (
                  <>
                    Log in
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                  </>
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="mt-5 flex items-center justify-between text-sm">
              <p className="text-white/70">
                Need a Study ID?{" "}
                <a
                  href="/activate"
                  className="font-medium text-white underline decoration-white/30 underline-offset-4 hover:decoration-white/70"
                >
                  Activate here
                </a>
              </p>
            </div>
          </div>

          {/* Tiny footer text */}
          <p className="mt-6 text-center text-xs text-white/45">
            By signing in, you agree to the study portal access rules.
          </p>
        </div>
      </div>
    </main>
  );
}
