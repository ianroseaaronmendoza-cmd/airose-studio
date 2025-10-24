import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          throw new Error("Missing email or password");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          throw new Error("User not found");
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (!isValid) {
          throw new Error("Invalid password");
        }

        // Return a minimal object (do not include passwordHash)
        return {
          id: user.id,
          name: user.name ?? "User",
          email: user.email,
          role: user.role ?? "user",
        };
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.role = token.role;
      }
      return session;
    },
    async redirect({ baseUrl }) {
      // 👇 Redirect user to /editor after successful login
      return `${baseUrl}/editor`;
    },
  },
  pages: {
    signIn: "/signin",
  },
};

// ✅ Ensure correct runtime (bcrypt needs Node.js)
export const runtime = "nodejs";

// ✅ Export correct handlers
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
