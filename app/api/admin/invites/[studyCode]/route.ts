import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

type Ctx = { params: Promise<{ studyCode: string }> };

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { studyCode } = await params;

  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  const invite = await prisma.inviteKey.findUnique({ where: { studyCode } });
  if (!invite) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }

  if (invite.redeemedAt) {
    return NextResponse.json(
      { ok: false, error: "Cannot delete a redeemed Study ID." },
      { status: 400 }
    );
  }

  await prisma.inviteKey.delete({ where: { studyCode } });
  return NextResponse.json({ ok: true });
}
