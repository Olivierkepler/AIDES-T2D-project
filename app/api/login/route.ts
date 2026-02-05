// app/api/login/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  newSessionToken,
  sessionExpiresAt,
  verifyPassword,
  SESSION_COOKIE,
  SESSION_DAYS,
} from "@/lib/auth";

const Body = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const { email, password } = Body.parse(json);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.status !== "active") {
      return NextResponse.json({ ok: false, error: "Invalid credentials." }, { status: 401 });
    }

    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) {
      return NextResponse.json({ ok: false, error: "Invalid credentials." }, { status: 401 });
    }

    const token = newSessionToken();
    const expiresAt = sessionExpiresAt(SESSION_DAYS);

    await prisma.session.create({
      data: { userId: user.id, token, expiresAt },
    });

    const res = NextResponse.json({ ok: true });
    res.cookies.set({
      name: SESSION_COOKIE,
      value: token,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      expires: expiresAt,
    });
    return res;
  } catch {
    return NextResponse.json({ ok: false, error: "Login failed." }, { status: 400 });
  }
}
