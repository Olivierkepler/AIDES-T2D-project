import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      id: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
      participantId: true,
      participant: { select: { studyCode: true } },
    } as any,
  });

  return NextResponse.json({ ok: true, users });
}
