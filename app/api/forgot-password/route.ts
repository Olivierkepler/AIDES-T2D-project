import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

function sha256(input: string) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

export async function POST(req: NextRequest) {
  const { email } = (await req.json().catch(() => ({}))) as { email?: string };

  // Always return ok to avoid leaking whether an email exists
  if (!email || typeof email !== "string") {
    return NextResponse.json({ ok: true });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ ok: true });
  }

  // Generate raw token (sent to user) + store hash in DB
  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = sha256(rawToken);

  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  // Delete existing password reset tokens for this user (only allow one active token)
  await (prisma as any).passwordResetToken.deleteMany({ where: { userId: user.id } });

  // Create new password reset token
  await (prisma as any).passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt,
    },
  });

  // Build reset URL
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "") ||
    "http://localhost:3000";

  const resetUrl = `${baseUrl}/reset-password?token=${rawToken}`;

  // TODO: Send email here
  // For now: log it (works for development)
  console.log("Password reset URL:", resetUrl);

  return NextResponse.json({ ok: true });
}
