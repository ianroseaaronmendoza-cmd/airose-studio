import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  try {
    const { password } = await req.json();
    const adminPassword = process.env.ADMIN_PASSWORD;
    const secret = process.env.JWT_SECRET;

    if (!adminPassword || !secret) {
      console.error("Missing ADMIN_PASSWORD or JWT_SECRET in environment");
      return NextResponse.json(
        { error: "Server misconfiguration" },
        { status: 500 }
      );
    }

    if (password !== adminPassword) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    const token = jwt.sign({ role: "admin" }, secret, { expiresIn: "999y" });

    const response = NextResponse.json({ success: true });

    // Set HttpOnly cookie with token
    response.cookies.set("editor_token", token, {
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 365 * 10, // 10 years
      sameSite: "lax",
    });

    return response;
  } catch (err) {
    console.error("Editor login failed:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}


