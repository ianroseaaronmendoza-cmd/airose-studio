// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma"; // <-- If you don't have "@/" aliases, use a relative path like "../../../../lib/prisma"

export const runtime = "nodejs";

/**
 * NOTE: Keep initialization in a try/catch so initialization errors appear clearly in logs.
 * NextAuth returns a handler which we export as GET and POST for the App Router.
 */
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
            // Defensive checks: return null for invalid input (NextAuth handles auth failure)
            if (!credentials?.email || !credentials?.password) {
              return null;
            }

            // Find user by email
            const user = await prisma.user.findUnique({
              where: { email: credentials.email },
            });

            // Guard: user must exist and have a password hash stored
            if (!user || !user.passwordHash) {
              return null;
            }

            // Compare password
            const valid = await bcrypt.compare(
              credentials.password,
              user.passwordHash
            );
            if (!valid) return null;

            // Return the user object to be included in the JWT
            return {
              id: user.id,
              name: user.name ?? "User",
              email: user.email,
              role: user.role ?? "user",
            };
          } catch (err) {
            // Log inner authorize errors to server logs and return null to avoid 500s
            console.error("authorize() error:", err);
            return null;
          }
        },
      }),
    ],

    // Ensure you have NEXTAUTH_SECRET set in production
    secret: process.env.NEXTAUTH_SECRET,

    // Using JWT sessions
    session: {
      strategy: "jwt",
    },

    // Custom sign-in page (App Router route)
    pages: {
      signIn: "/signin",
    },

    callbacks: {
      async jwt({ token, user }) {
        if (user) {
          (token as any).role = (user as any).role;
        }
        return token;
      },
      async session({ session, token }) {
        if (token && session.user) {
          (session.user as any).role = (token as any).role;
        }
        return session;
      },
      async redirect({ url, baseUrl }) {
        // Always redirect to /editor on relative URLs
        if (url.startsWith("/")) return `${baseUrl}/editor`;
        return baseUrl;
      },
    },

    // Optional: debug logging (enable via NEXTAUTH_DEBUG=true in env)
    // debug: !!process.env.NEXTAUTH_DEBUG,
  });
} catch (err) {
  // Initialization error — rethrow so the platform logs the failure
  console.error("NextAuth initialization error:", err);
  throw err;
}

export { handler as GET, handler as POST };