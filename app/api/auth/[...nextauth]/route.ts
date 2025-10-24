import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password)
          throw new Error("Missing email or password");

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        if (!user) throw new Error("User not found");

        const isValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );
        if (!isValid) throw new Error("Invalid password");

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
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = user.role;
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) session.user.role = token.role;
      return session;
    },
    async redirect({ baseUrl }) {
      return `${baseUrl}/editor`;
    },
  },
  pages: { signIn: "/signin" },
};

// ✅ Ensure bcrypt works (Node.js runtime, not Edge)
export const runtime = "nodejs";

// ✅ Proper export format for Next.js App Router
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
