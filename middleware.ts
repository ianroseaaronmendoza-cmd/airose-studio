import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("editor_token")?.value;
  const path = req.nextUrl.pathname;

  if (path.startsWith("/editor") || path.startsWith("/dashboard")) {
    try {
      jwt.verify(token || "", process.env.JWT_SECRET!);
      return NextResponse.next();
    } catch {
      return NextResponse.redirect(new URL("/editor-login", req.url));
    }
  }

  return NextResponse.next();
}
