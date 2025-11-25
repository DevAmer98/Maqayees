import NextAuthImport from "next-auth/next";
import CredentialsProviderImport from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";

const NextAuth = NextAuthImport?.default ?? NextAuthImport;
const CredentialsProvider =
  CredentialsProviderImport?.default ?? CredentialsProviderImport;

// ✅ Exported separately so it can be imported in other files (e.g. /dashboard/page.jsx)
export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Find the user in DB
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) throw new Error("User not found");

        // Compare password
        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) throw new Error("Invalid password");

        // Return safe user object
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],

  pages: {
    signIn: "/login",
  },

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = user.role;
      return token;
    },
    async session({ session, token }) {
      if (token) session.user.role = token.role;
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};

// ✅ Create the handler
const handler = NextAuth(authOptions);

// ✅ Export both GET and POST for Next.js route handling
export { handler as GET, handler as POST };
