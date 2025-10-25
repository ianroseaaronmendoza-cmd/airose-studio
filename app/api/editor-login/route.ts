import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { password } = await req.json();

    const user = await prisma.user.findUnique({
      where: { email: "admin@airose.studio" },
    });

    if (!user) {
      return new Response(JSON.stringify({ error: "No admin user found" }), {
        status: 404,
      });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash); // ✅ fixed here
    if (!isValid) {
      return new Response(JSON.stringify({ error: "Invalid password" }), {
        status: 401,
      });
    }

    // ✅ generate a long-lived JWT (never expires)
    const token = jwt.sign(
      { email: user.email, role: user.role },
      process.env.NEXTAUTH_SECRET!,
      { expiresIn: "365d" }
    );

    return new Response(JSON.stringify({ token }), {
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
    });
  }
}
