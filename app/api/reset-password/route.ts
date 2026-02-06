import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import bcrypt from "bcryptjs";

function sha256(input: string) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as { token?: string; password?: string };
  const token = body.token?.trim() ?? "";
  const password = body.password ?? "";

  if (!token || typeof token !== "string") {
    return NextResponse.json({ ok: false, error: "Invalid token." }, { status: 400 });
  }
  if (typeof password !== "string" || password.length < 8) {
    return NextResponse.json({ ok: false, error: "Password must be at least 8 characters." }, { status: 400 });
  }

  const tokenHash = sha256(token);

  const record = await (prisma as any).passwordResetToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!record) {
    return NextResponse.json({ ok: false, error: "Reset link is invalid or expired." }, { status: 400 });
  }

  if (record.expiresAt.getTime() < Date.now()) {
    await (prisma as any).passwordResetToken.delete({ where: { id: record.id } });
    return NextResponse.json({ ok: false, error: "Reset link is expired. Please request a new one." }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  // Update password + delete token (single-use)
  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { passwordHash },
    }),
    (prisma as any).passwordResetToken.delete({ where: { id: record.id } }),
  ]);

  return NextResponse.json({ ok: true });
}
