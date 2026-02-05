import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

const PatchBody = z.object({
  email: z.string().email().optional(),
  status: z.enum(["active", "inactive"]).optional(),
  role: z.enum(["ADMIN", "PARTICIPANT"]).optional(),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const adminSession = await requireAdmin();
  if (!adminSession) return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });

  const json = await req.json();
  const body = PatchBody.parse(json);

  // prevent admin from demoting themselves accidentally
  if (params.id === adminSession.user.id && body.role && body.role !== "ADMIN") {
    return NextResponse.json({ ok: false, error: "You cannot remove your own admin role." }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id: params.id },
    data: body,
    select: { id: true, email: true, role: true, status: true } as any,
  });

  return NextResponse.json({ ok: true, user });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const adminSession = await requireAdmin();
  if (!adminSession) return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });

  if (params.id === adminSession.user.id) {
    return NextResponse.json({ ok: false, error: "You cannot delete your own account." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: params.id } });
  if (!user) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });

  // If this user has a participant, delete the participant (cascades user + sessions)
  if (user.participantId) {
    await prisma.participant.delete({ where: { id: user.participantId } });
  } else {
    await prisma.user.delete({ where: { id: params.id } });
  }

  return NextResponse.json({ ok: true });
}
