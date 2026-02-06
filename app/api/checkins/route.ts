import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z, ZodError } from "zod";
import { requireUser } from "@/lib/auth";

const TagEnum = z.enum([
  "DOCTOR_APPT",
  "BG_HIGH_LOW",
  "MISSED_MED_OR_MEAL",
  "WORK_SCHOOL_STRESS",
  "CONFLICT",
  "SUPPORTED",
  "UNWELL_TIRED",
]);

const Body = z.object({
  distress: z.number().int().min(0).max(10),
  mood: z.number().int().min(0).max(10),
  energy: z.number().int().min(0).max(10),

  // context tags (tap all that fit)
  tags: z.array(TagEnum).default([]),

  // open-ended (core questions)
  reflection: z.string().trim().min(1).max(2000),
  coping: z.string().trim().min(1).max(2000),
});

type CheckInCreateBody = z.infer<typeof Body>;

function startOfLocalDay(d: Date = new Date()): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function isDbUnreachable(err: unknown): boolean {
  if (typeof err !== "object" || err === null) return false;

  const e = err as { code?: unknown; message?: unknown };
  const code = typeof e.code === "string" ? e.code : "";
  const msg = typeof e.message === "string" ? e.message : "";

  return code === "P1001" || msg.includes("Can't reach database");
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireUser();
    if (!session) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const json: unknown = await req.json().catch(() => ({}));
    const body: CheckInCreateBody = Body.parse(json);

    const todayStart = startOfLocalDay(new Date());

    const existing = await (prisma as any).checkIn.findFirst({
      where: { userId: session.user.id, createdAt: { gte: todayStart } },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json(
        { ok: false, error: "You already submitted a check-in today." },
        { status: 409 }
      );
    }

    const checkIn = await (prisma as any).checkIn.create({
      data: {
        userId: session.user.id,
        distress: body.distress,
        mood: body.mood,
        energy: body.energy,
        tags: body.tags,
        reflection: body.reflection,
        coping: body.coping,
      },
      select: {
        id: true,
        distress: true,
        mood: true,
        energy: true,
        tags: true,
        reflection: true,
        coping: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ ok: true, checkIn });
  } catch (err: unknown) {
    console.error("Check-in POST error:", err);

    if (err instanceof ZodError) {
      return NextResponse.json(
        { ok: false, error: "Invalid input. Please check your values." },
        { status: 400 }
      );
    }

    if (isDbUnreachable(err)) {
      return NextResponse.json(
        { ok: false, error: "Database connection failed. Please try again later." },
        { status: 503 }
      );
    }

    const message =
      typeof (err as { message?: unknown })?.message === "string"
        ? (err as { message: string }).message
        : "Could not submit check-in.";

    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await requireUser();
    if (!session) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const last = await (prisma as any).checkIn.findFirst({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        distress: true,
        mood: true,
        energy: true,
        tags: true,
        reflection: true,
        coping: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ ok: true, last });
  } catch (err: unknown) {
    console.error("Check-in GET error:", err);

    if (isDbUnreachable(err)) {
      return NextResponse.json(
        { ok: false, error: "Database connection failed. Please try again later." },
        { status: 503 }
      );
    }

    const message =
      typeof (err as { message?: unknown })?.message === "string"
        ? (err as { message: string }).message
        : "Could not load check-ins.";

    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
