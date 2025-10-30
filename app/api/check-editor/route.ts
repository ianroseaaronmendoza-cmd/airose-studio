// app/api/check-editor/route.ts
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const token = cookies().get("editor_token")?.value;
    if (!token) return NextResponse.json({ ok: false });

    jwt.verify(token, process.env.JWT_SECRET!);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ ok: false });
  }
}
