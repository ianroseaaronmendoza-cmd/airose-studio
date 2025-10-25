import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function GET(req: Request) {
  const cookie = req.headers.get("cookie") || "";
  const match = cookie.match(/editor_token=([^;]+)/);
  if (!match) return NextResponse.json({ ok: false });

  try {
    jwt.verify(match[1], process.env.JWT_SECRET!);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false });
  }
}
