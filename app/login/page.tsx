"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
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
    <main className="relative min-h-screen overflow-hidden bg-[#071a3a]">
      {/* Background image (optional) */}
      <div className="absolute inset-0">
        {/* If you have a hero image, put it in /public and set src below */}
        {/* Example: /public/hero.jpg */}
        {/* Remove this Image block if you don’t want a photo background */}
        <Image
          src="/hero.jpg"
          alt="Background"
          fill
          priority
          className="object-cover"
        />

        {/* Dark overlay + subtle brand tint */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#071a3a]/70 via-[#071a3a]/75 to-[#071a3a]/90" />

        {/* Subtle grid like your site */}
        <div
          className="absolute inset-0 opacity-[0.14]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.18) 1px, transparent 1px), linear-gradient(to right, rgba(255,255,255,0.18) 1px, transparent 1px)",
            backgroundSize: "52px 52px",
            backgroundPosition: "center",
          }}
        />

        {/* Gold accent glow */}
        <div className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-[#f2b01e]/20 blur-3xl" />
        <div className="absolute -right-24 bottom-10 h-72 w-72 rounded-full bg-[#0b4db3]/20 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-6xl items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Brand header */}
          <div className="mb-6 text-center">
            {/* Optional logo: put your logo in /public/logo.png */}
            <div className="mx-auto mb-4 flex items-center justify-center">
              <div className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-2 ring-1 ring-white/15 backdrop-blur">
                {/* If you have a logo file, uncomment this Image */}
                {/* <Image src="/logo.png" alt="Stampley" width={28} height={28} /> */}
                <span className="text-sm font-semibold tracking-wide text-white">
                  Stampley Research Group
                </span>
                <span className="h-4 w-px bg-white/20" />
                <span className="text-xs text-white/70">Study Portal</span>
              </div>
            </div>

            <h1 className="text-3xl font-semibold tracking-tight text-white">
              Sign in
            </h1>
            <p className="mt-1 text-sm text-white/75">
              Access your participant dashboard securely.
            </p>
          </div>

          {/* Card */}
          <div className="rounded-3xl bg-white/[0.08] p-6 shadow-2xl ring-1 ring-white/15 backdrop-blur-xl">
            {/* Gold top rule */}
            <div className="mb-5 h-1 w-16 rounded-full bg-[#f2b01e]" />

            <form className="space-y-4" onSubmit={onSubmit}>
              {/* Email */}
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-white/75">
                  Email
                </span>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/45" />
                  <input
                    autoComplete="email"
                    inputMode="email"
                    type="email"
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

              {/* Password */}
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-white/75">
                  Password
                </span>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/45" />
                  <input
                    autoComplete="current-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={cn(
                      "w-full rounded-2xl bg-white/5 px-10 py-3 text-sm text-white placeholder:text-white/35",
                      "ring-1 ring-white/15 outline-none",
                      "focus:ring-2 focus:ring-[#f2b01e]/60"
                    )}
                  />
                </div>

                
              </label>

              {/* Error */}
              {error ? (
                <div className="rounded-2xl border border-red-400/25 bg-red-500/10 p-3 text-sm text-red-100">
                  {error}
                </div>
              ) : null}

              {/* Submit */}
              <button
                type="submit"
                disabled={!canSubmit}
                className={cn(
                  "group inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold",
                  "bg-[#f2b01e] text-[#071a3a]",
                  "shadow-[0_12px_30px_-16px_rgba(242,176,30,0.75)]",
                  "transition active:scale-[0.99]",
                  "hover:brightness-[1.03]",
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
                    Log In
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                  </>
                )}
              </button>
            </form>
            <a
  href="/forgot-password"
  className="text-xs font-medium text-white underline decoration-white/30 underline-offset-4 hover:decoration-white/70"
>
  Forgot Password?
</a>


            <div className="mt-5 flex items-center justify-between">
              <p className="text-sm text-white/75">
                Need a Study ID?{" "}
                <a
                  href="/activate"
                  className="font-medium text-white underline decoration-white/35 underline-offset-4 hover:decoration-white/70"
                >
                  Activate here
                </a>
              </p>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-white/55">
            Protected access for authorized study participants.
          </p>
        </div>
      </div>
    </main>
  );
}
