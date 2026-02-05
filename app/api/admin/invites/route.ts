import { NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

const CreateBody = z.object({
  studyCode: z.string().trim().min(3).optional(),
  emailAllowed: z.string().email().optional().nullable(),
});

function genCode() {
  const suffix = crypto.randomBytes(3).toString("hex").toUpperCase(); // 6 chars
  return `AIDES-${suffix}`;
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });

  const invites = await prisma.inviteKey.findMany({
    orderBy: { createdAt: "desc" },
    take: 300,
  });

  return NextResponse.json({ ok: true, invites });
}

export async function POST(req: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });

  const json = await req.json();
  const { studyCode, emailAllowed } = CreateBody.parse(json);

  // if no studyCode provided, generate one and retry on collision
  for (let i = 0; i < 5; i++) {
    const code = studyCode ?? genCode();
    try {
      const invite = await prisma.inviteKey.create({
        data: { studyCode: code, emailAllowed: emailAllowed ?? null },
      });
      return NextResponse.json({ ok: true, invite });
    } catch (e: any) {
      // unique collision; retry only if we generated
      if (studyCode) throw e;
    }
  }

  return NextResponse.json({ ok: false, error: "Could not generate unique code." }, { status: 500 });
}
