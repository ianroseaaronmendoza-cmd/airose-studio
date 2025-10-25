import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  try {
    const { token } = await req.json();
    const secret = process.env.JWT_SECRET;

    if (!token || !secret) {
      return NextResponse.json({ valid: false });
    }

    const decoded = jwt.verify(token, secret) as { role?: string };
    const valid = decoded.role === "admin";

    return NextResponse.json({ valid });
  } catch {
    return NextResponse.json({ valid: false });
  }
}
