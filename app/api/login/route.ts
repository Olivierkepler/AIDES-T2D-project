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
    // Use secure cookies in production (HTTPS) or when explicitly set
    const isSecure = process.env.NODE_ENV === "production" || process.env.FORCE_SECURE_COOKIES === "true";
    res.cookies.set({
      name: SESSION_COOKIE,
      value: token,
      httpOnly: true,
      sameSite: "lax",
      secure: isSecure,
      path: "/",
      expires: expiresAt,
    });
    return res;
  } catch (error: any) {
    // Log error for debugging (remove in production if sensitive)
    console.error("Login error:", error?.message || error);
    
    // Check if it's a database connection error
    if (error?.code === "P1001" || error?.message?.includes("Can't reach database")) {
      return NextResponse.json(
        { ok: false, error: "Database connection failed. Please try again later." },
        { status: 503 }
      );
    }
    
    return NextResponse.json({ ok: false, error: "Login failed." }, { status: 400 });
  }
}
