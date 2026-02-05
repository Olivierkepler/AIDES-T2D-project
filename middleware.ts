// middleware.ts
import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE = "aides_session";

// Pages that should stay public
const PUBLIC_PATHS = new Set(["/", "/login", "/activate"]);

// API routes that should stay public
const PUBLIC_API_PREFIXES = [
  "/api/login",
  "/api/activate",
  "/api/logout",
  "/api/db-ping",
];

function isPublic(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (PUBLIC_PATHS.has(pathname)) return true;

  if (pathname.startsWith("/api")) {
    return PUBLIC_API_PREFIXES.some((p) => pathname.startsWith(p));
  }

  return false;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip checks for public routes
  if (isPublic(req)) return NextResponse.next();

  // Require session cookie for everything else
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (token) return NextResponse.next();

  // If it's an API call, return 401 JSON instead of redirect
  if (pathname.startsWith("/api")) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  // Otherwise redirect to login and preserve the intended path
  const loginUrl = req.nextUrl.clone();
  loginUrl.pathname = "/login";
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

// Apply middleware to all routes except Next internals/static assets
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
