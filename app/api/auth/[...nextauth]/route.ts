import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs"; // ✅ use bcryptjs for Vercel (no native build)
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "you@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials): Promise<any> {
        try {
          if (!credentials?.email || !credentials?.password) {
            console.warn("⚠ Missing credentials");
            return null;
          }

          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          if (!user || !user.passwordHash) {
            console.warn("⚠ User not found or missing password hash");
            return null;
          }

          const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
          if (!isValid) {
            console.warn("⚠ Invalid password");
            return null;
          }

          // ✅ Return user info compatible with NextAuth session
          return {
            id: user.id,
            name: user.name ?? "",
            email: user.email ?? "",
            role: user.role ?? "user",
          };
        } catch (error) {
          console.error("🔥 Error in authorize():", error);
          return null;
        }
      },
    }),
  ],

  secret: process.env.NEXTAUTH_SECRET,

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  pages: {
    signIn: "/auth/signin",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
};

// ✅ Enable Node.js runtime for bcryptjs (Vercel compatible)
export const runtime = "nodejs";

// ✅ Add better logging and fail-safe error output
const handler = async (req: Request, res: any) => {
  try {
    console.log("🔐 NextAuth invoked:", req.method, req.url);
    const nextHandler = NextAuth(authOptions);
    return await nextHandler(req, res);
  } catch (error) {
    console.error("🔥 NextAuth internal error:", error);
    return NextResponse.json(
      { error: (error as any).message || "Unknown error" },
      { status: 500 }
    );
  }
};

export { handler as GET, handler as POST };
