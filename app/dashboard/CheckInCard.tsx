"use client";

import React, { useMemo, useState, useEffect } from "react";
import { Loader2, CheckCircle2, AlertTriangle } from "lucide-react";

function cn(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

const TAGS = [
  { key: "DOCTOR_APPT", label: "Doctor's appointment" },
  { key: "BG_HIGH_LOW", label: "High or low blood sugar" },
  { key: "MISSED_MED_OR_MEAL", label: "Missed a medication or meal" },
  { key: "WORK_SCHOOL_STRESS", label: "Stress at work or school" },
  { key: "CONFLICT", label: "Conflict or tension with someone" },
  { key: "SUPPORTED", label: "Felt supported by someone" },
  { key: "UNWELL_TIRED", label: "Felt physically unwell or tired" },
] as const;

type TagKey = (typeof TAGS)[number]["key"];

type CheckInData = {
  id: string;
  distress: number;
  mood: number;
  energy: number;
  tags: string[];
  reflection: string | null;
  coping: string | null;
  createdAt: string;
};

function isToday(date: Date | string): boolean {
  const d = typeof date === "string" ? new Date(date) : date;
  const today = new Date();
  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  );
}

function LabelRow({
  label,
  value,
  hint,
}: {
  label: string;
  value?: number;
  hint?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <span className="text-sm font-semibold text-slate-900">{label}</span>
        {hint ? <p className="mt-0.5 text-xs text-slate-600">{hint}</p> : null}
      </div>
      {typeof value === "number" ? (
        <span className="text-sm font-semibold text-slate-900">{value}/10</span>
      ) : null}
    </div>
  );
}

export default function CheckInCard() {
  // Core sliders
  const [distress, setDistress] = useState<number>(5);

  // Mood: pleasant ↔ unpleasant, UI is 10 -> 0. We'll store 0..10 in state as "mood"
  // but render slider reversed so that left shows 10 (pleasant) and right shows 0 (unpleasant).
  const [mood, setMood] = useState<number>(7);

  // Energy: energized ↔ drained, 0 -> 10
  const [energy, setEnergy] = useState<number>(4);

  // Context tags
  const [tags, setTags] = useState<TagKey[]>([]);

  // Open responses (required)
  const [reflection, setReflection] = useState<string>("");
  const [coping, setCoping] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [todayCheckIn, setTodayCheckIn] = useState<CheckInData | null>(null);
  const [loadingCheckIn, setLoadingCheckIn] = useState(true);

  const canSubmit = useMemo(() => {
    if (loading || done || todayCheckIn) return false;
    if (reflection.trim().length === 0) return false;
    if (coping.trim().length === 0) return false;
    return true;
  }, [loading, done, reflection, coping, todayCheckIn]);

  // Check if user already submitted today
  useEffect(() => {
    async function loadTodayCheckIn() {
      try {
        const res = await fetch("/api/checkins");
        const data: unknown = await res.json().catch(() => ({} as unknown));

        if (
          typeof data === "object" &&
          data !== null &&
          "ok" in data &&
          (data as { ok?: unknown }).ok === true &&
          "last" in data
        ) {
          const last = (data as { last?: CheckInData | null }).last;
          if (last && isToday(last.createdAt)) {
            setTodayCheckIn(last);
            setDone(true);
          }
        }
      } catch (e) {
        console.error("Failed to load check-in:", e);
      } finally {
        setLoadingCheckIn(false);
      }
    }

    loadTodayCheckIn();
  }, []);

  function toggleTag(k: TagKey) {
    setTags((prev) => (prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k]));
  }

  async function submit() {
    if (!canSubmit) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/checkins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          distress,
          mood,
          energy,
          tags,
          reflection: reflection.trim(),
          coping: coping.trim(),
        }),
      });

      const data: unknown = await res.json().catch(() => ({} as unknown));

      const ok =
        typeof data === "object" &&
        data !== null &&
        "ok" in data &&
        (data as { ok?: unknown }).ok === true;

      if (!res.ok || !ok) {
        const msg =
          typeof data === "object" &&
          data !== null &&
          "error" in data &&
          typeof (data as { error?: unknown }).error === "string"
            ? (data as { error: string }).error
            : `Could not submit check-in. (${res.status})`;
        setError(msg);
        return;
      }

      setDone(true);
      const checkInData = (data as { checkIn?: CheckInData }).checkIn;
      if (checkInData) {
        setTodayCheckIn(checkInData);
      }
    } catch (e: unknown) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (loadingCheckIn) {
    return (
      <section className="mt-6 rounded-2xl border bg-slate-50 p-6 shadow-sm">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      </section>
    );
  }

  return (
    <section className="mt-6 rounded-2xl border bg-slate-50 p-6 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Daily Check-In</h2>
          <p className="mt-1 text-sm text-slate-600">
            The daily structure stays the same; Stampley's support adapts to your weekly focus domain.
          </p>
        </div>
        <div className="h-1 w-16 rounded-full bg-[#f2b01e]" />
      </div>

      {done || todayCheckIn ? (
        <div className="space-y-4">
          <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-slate-800">
            <div className="flex items-center gap-2 font-semibold text-green-800">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              Check-in submitted
            </div>
            <p className="mt-1 text-slate-600">Thanks — see you tomorrow.</p>
          </div>

          {todayCheckIn && (
            <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
              <h3 className="text-sm font-semibold text-slate-900">Today's Check-In</h3>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-slate-600">Distress:</span>{" "}
                  <span className="font-semibold text-slate-900">{todayCheckIn.distress}/10</span>
                </div>
                <div>
                  <span className="text-slate-600">Mood:</span>{" "}
                  <span className="font-semibold text-slate-900">{todayCheckIn.mood}/10</span>
                </div>
                <div>
                  <span className="text-slate-600">Energy:</span>{" "}
                  <span className="font-semibold text-slate-900">{todayCheckIn.energy}/10</span>
                </div>
              </div>
              {todayCheckIn.tags.length > 0 && (
                <div>
                  <span className="text-sm text-slate-600">Tags: </span>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {todayCheckIn.tags.map((tag) => {
                      const tagInfo = TAGS.find((t) => t.key === tag);
                      return (
                        <span
                          key={tag}
                          className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-700"
                        >
                          {tagInfo?.label || tag}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
              {todayCheckIn.reflection && (
                <div>
                  <span className="text-sm font-medium text-slate-700">Reflection:</span>
                  <p className="mt-1 text-sm text-slate-600">{todayCheckIn.reflection}</p>
                </div>
              )}
              {todayCheckIn.coping && (
                <div>
                  <span className="text-sm font-medium text-slate-700">Coping:</span>
                  <p className="mt-1 text-sm text-slate-600">{todayCheckIn.coping}</p>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-5">
          {/* Distress */}
          <div className="space-y-2">
            <LabelRow
              label="Distress"
              value={distress}
              hint="How stressful did diabetes feel today?"
            />
            <input
              type="range"
              min={0}
              max={10}
              value={distress}
              onChange={(e) => setDistress(Number(e.target.value))}
              className="w-full accent-[#f2b01e]"
            />
            <div className="flex justify-between text-xs text-slate-500">
              <span>0</span>
              <span>10</span>
            </div>
          </div>

          {/* Mood (pleasant -> unpleasant; UI 10 -> 0) */}
          <div className="space-y-2">
            <LabelRow label="Mood" value={mood} hint="How are you feeling overall right now?" />
            <div className="flex justify-between text-xs text-slate-500">
              <span>😊 Very pleasant (10)</span>
              <span>😞 Very unpleasant (0)</span>
            </div>
            <input
              type="range"
              min={0}
              max={10}
              // reverse rendering so the left is 10 and right is 0
              value={10 - mood}
              onChange={(e) => setMood(10 - Number(e.target.value))}
              className="w-full accent-[#f2b01e]"
            />
            <div className="flex justify-between text-xs text-slate-500">
              <span>10</span>
              <span>0</span>
            </div>
          </div>

          {/* Energy (0 -> 10) */}
          <div className="space-y-2">
            <LabelRow label="Energy" value={energy} hint="How energized or drained do you feel?" />
            <div className="flex justify-between text-xs text-slate-500">
              <span>⚡ Energized (0)</span>
              <span>💤 Drained (10)</span>
            </div>
            <input
              type="range"
              min={0}
              max={10}
              value={energy}
              onChange={(e) => setEnergy(Number(e.target.value))}
              className="w-full accent-[#f2b01e]"
            />
            <div className="flex justify-between text-xs text-slate-500">
              <span>0</span>
              <span>10</span>
            </div>
          </div>

          {/* Context tags */}
          <div>
            <LabelRow label="Context tags" hint="Which of these applied to your day? (Tap all that fit)" />
            <div className="mt-3 flex flex-wrap gap-2">
              {TAGS.map((t) => {
                const active = tags.includes(t.key);
                return (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => toggleTag(t.key)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-sm transition",
                      active
                        ? "border-[#f2b01e] bg-[#f2b01e]/15 text-slate-900"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                    )}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Reflection (required) */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-900">
              What most shaped your day with diabetes?
            </label>
            <textarea
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              rows={3}
              placeholder="Write a short response…"
              className={cn(
                "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400",
                "outline-none focus:ring-2 focus:ring-[#f2b01e]/60 focus:border-[#f2b01e]"
              )}
            />
            {reflection.trim().length === 0 ? (
              <p className="mt-1 text-xs text-slate-500">Required.</p>
            ) : null}
          </div>

          {/* Coping (required) */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-900">
              What helped you get through the day?
            </label>
            <textarea
              value={coping}
              onChange={(e) => setCoping(e.target.value)}
              rows={3}
              placeholder="What helped today? (e.g., routine, support, small action)…"
              className={cn(
                "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400",
                "outline-none focus:ring-2 focus:ring-[#f2b01e]/60 focus:border-[#f2b01e]"
              )}
            />
            {coping.trim().length === 0 ? (
              <p className="mt-1 text-xs text-slate-500">Required.</p>
            ) : null}
          </div>

          {error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              <div className="flex items-center gap-2 font-semibold">
                <AlertTriangle className="h-4 w-4" />
                {error}
              </div>
            </div>
          ) : null}

          <button
            onClick={submit}
            disabled={!canSubmit}
            className={cn(
              "inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold",
              "bg-[#f2b01e] text-[#071a3a]",
              "shadow-sm transition hover:brightness-[1.03]",
              "disabled:cursor-not-allowed disabled:opacity-60"
            )}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Submitting…
              </>
            ) : (
              "Submit check-in"
            )}
          </button>

          <p className="text-center text-xs text-slate-500">
            One check-in per day. If you need help, email{" "}
            <a className="underline hover:text-slate-700" href="mailto:pcrg@umb.edu">
              pcrg@umb.edu
            </a>
            .
          </p>
        </div>
      )}
    </section>
  );
}
