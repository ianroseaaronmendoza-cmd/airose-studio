import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // Public routes that don't require auth
  const publicPaths = new Set([
    "/",
    "/editor-login",
    "/api/editor-login",
    "/api/auth",
    "/favicon.ico",
  ]);

  // Allow Next.js internals and static files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.startsWith("/images") ||
    publicPaths.has(pathname)
  ) {
    return NextResponse.next();
  }

  // Protect editor and dashboard routes
  const needsAuth =
    pathname.startsWith("/editor") || pathname.startsWith("/dashboard");

  if (!needsAuth) {
    return NextResponse.next();
  }

  const token = req.cookies.get("editor_token")?.value;

  try {
    if (!token) throw new Error("Missing token");
    jwt.verify(token, process.env.JWT_SECRET!);
    return NextResponse.next();
  } catch {
    const url = req.nextUrl.clone();
    url.pathname = "/editor-login";
    url.search = "";
    url.searchParams.set("from", pathname + (search || ""));
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: [
    // Run middleware on all except static assets
    "/((?!_next/static|_next/image|favicon.ico|images|static).*)",
  ],
};