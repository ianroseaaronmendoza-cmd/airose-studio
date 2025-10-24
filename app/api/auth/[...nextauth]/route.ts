/**
 * app/api/auth/[...nextauth]/route.ts
 * Adjust prisma import path if needed (this assumes lib/prisma.ts at project root).
 */
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "../../../../lib/prisma"; // adjust if your lib/prisma is elsewhere

export const runtime = "nodejs";

let handler;
try {
  handler = NextAuth({
    providers: [
      Credentials({
        name: "Credentials",
        credentials: {
          email: { label: "Email", type: "email" },
          password: { label: "Password", type: "password" },
        },
        async authorize(credentials) {
          try {
            if (!credentials?.email || !credentials?.password) return null;

            const user = await prisma.user.findUnique({
              where: { email: credentials.email },
            });
            if (!user || !user.passwordHash) return null;

            const valid = await bcrypt.compare(
              credentials.password,
              user.passwordHash
            );
            if (!valid) return null;

            return {
              id: user.id,
              name: user.name ?? "User",
              email: user.email,
              role: user.role ?? "user",
            };
          } catch (err) {
            console.error("authorize() error:", err);
            return null;
          }
        },
      }),
    ],
    secret: process.env.NEXTAUTH_SECRET,
    session: { strategy: "jwt" },
    pages: { signIn: "/signin" },
    callbacks: {
      async jwt({ token, user }) {
        if (user) (token as any).role = (user as any).role;
        return token;
      },
      async session({ session, token }) {
        if (token && session.user) (session.user as any).role = (token as any).role;
        return session;
      },
      async redirect({ url, baseUrl }) {
        if (url.startsWith("/")) return `${baseUrl}/editor`;
        return baseUrl;
      },
    },
  });
} catch (err) {
  console.error("NextAuth initialization error:", err);
  throw err;
}

export { handler as GET, handler as POST };
