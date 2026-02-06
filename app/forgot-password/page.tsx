"use client";

import React, { useMemo, useState } from "react";
import { Mail, Loader2, ArrowRight } from "lucide-react";

function cn(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  // We show a generic success state to prevent email enumeration.
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => email.trim().length > 0 && !loading, [email, loading]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      // Always show success even if email is not found (security best practice)
      await res.json().catch(() => null);
      setDone(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#071a3a]">
      {/* background */}
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
            <h1 className="text-3xl font-semibold tracking-tight text-white">Forgot password</h1>
            <p className="mt-1 text-sm text-white/75">
              We’ll email you a reset link if the address is enrolled.
            </p>
          </div>

          <div className="rounded-3xl bg-white/[0.08] p-6 shadow-2xl ring-1 ring-white/15 backdrop-blur-xl">
            <div className="mb-5 h-1 w-16 rounded-full bg-[#f2b01e]" />

            {done ? (
              <div className="space-y-3">
                <div className="rounded-2xl border border-white/15 bg-white/[0.06] p-4 text-sm text-white/80">
                  <p className="font-semibold text-white">Check your inbox</p>
                  <p className="mt-1 text-white/75">
                    If <span className="font-medium text-white">{email}</span> is enrolled,
                    you’ll receive a password reset link shortly.
                  </p>
                </div>

                <a
                  href="/login"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#f2b01e] px-4 py-3 text-sm font-semibold text-[#071a3a] shadow-[0_12px_30px_-16px_rgba(242,176,30,0.75)] hover:brightness-[1.03]"
                >
                  Back to Log In <ArrowRight className="h-4 w-4" />
                </a>

                <p className="text-center text-xs text-white/55">
                  Need help? Email{" "}
                  <a className="underline" href="mailto:pcrg@umb.edu">
                    pcrg@umb.edu
                  </a>{" "}
                  or call{" "}
                  <a className="underline" href="tel:+16172874067">
                    617-287-4067
                  </a>
                  .
                </p>
              </div>
            ) : (
              <form className="space-y-4" onSubmit={onSubmit}>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-white/75">Email</span>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/45" />
                    <input
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@umb.edu"
                      className={cn(
                        "w-full rounded-2xl bg-white/5 px-10 py-3 text-sm text-white placeholder:text-white/35",
                        "ring-1 ring-white/15 outline-none",
                        "focus:ring-2 focus:ring-[#f2b01e]/60"
                      )}
                    />
                  </div>
                </label>

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
                      <Loader2 className="h-4 w-4 animate-spin" /> Sending…
                    </>
                  ) : (
                    "Send reset link"
                  )}
                </button>

                <p className="text-center text-xs text-white/55">
                  Remember your password?{" "}
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
