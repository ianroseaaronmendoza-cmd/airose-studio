import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  try {
    const { password } = await req.json();

    // Compare entered password with .env ADMIN_PASSWORD
    if (password !== process.env.ADMIN_PASSWORD) {
      return new Response(JSON.stringify({ error: "Invalid password" }), {
        status: 401,
      });
    }

    // Create a long-lived JWT token (never expires)
    const token = jwt.sign(
      { role: "admin" },
      process.env.JWT_SECRET!,
      { expiresIn: "365d" }
    );

    return new Response(JSON.stringify({ token }), {
      status: 200,
    });
  } catch (error) {
    console.error("Editor login error:", error);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
    });
  }
}
