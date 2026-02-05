// app/api/activate/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

const Body = z.object({
  studyCode: z.string().trim().min(3),
  email: z.string().trim().email(),
  password: z.string().min(8),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const { studyCode, email, password } = Body.parse(json);

    const invite = await prisma.inviteKey.findUnique({ where: { studyCode } });
    if (!invite) {
      return NextResponse.json({ ok: false, error: "Invalid Study ID." }, { status: 400 });
    }
    if (invite.redeemedAt) {
      return NextResponse.json({ ok: false, error: "Study ID already used." }, { status: 400 });
    }
    if (invite.emailAllowed && invite.emailAllowed.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json({ ok: false, error: "Email not allowed for this Study ID." }, { status: 403 });
    }

    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) {
      return NextResponse.json({ ok: false, error: "Email already registered. Please log in." }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);

    // Atomic activation
    await prisma.$transaction(async (tx) => {
      const participant = await tx.participant.upsert({
        where: { studyCode },
        update: {},
        create: { studyCode, status: "active" },
      });

      const existingUserForParticipant = await tx.user.findUnique({
        where: { participantId: participant.id },
      });
      if (existingUserForParticipant) {
        throw new Error("Participant already has an account.");
      }

      const user = await tx.user.create({
        data: {
          participantId: participant.id,
          email,
          passwordHash,
          status: "active",
        },
      });

      await tx.inviteKey.update({
        where: { studyCode },
        data: { redeemedAt: new Date(), redeemedBy: user.id },
      });
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    const message =
      typeof err?.message === "string" ? err.message : "Activation failed.";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
