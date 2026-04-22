// src/auth.js
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import authConfig from "./auth.config";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  callbacks: {
    async jwt({ token, user }) {
      if (user){ 
        token.role = user.role;
        token.id = user.id;
        token.first_name = user.first_name;
        token.last_name = user.last_name;
        token.email = user.email;
      }

      return token;
    },
    async session({ session, token }) {
      if(session.user) {
        session.user.role = token.role;
        session.user.id = token.id;
        session.user.first_name = token.first_name;
        session.user.last_name = token.last_name;
        session.user.email = token.email;
      }
      return session;
    },
  },
  
  // Move your authorize logic here
  providers: [
    Credentials({
      async authorize(credentials) {
        const user = await prisma.users.findUnique({
          where: { email: credentials.email },
        });

        if ( user && (await bcrypt.compare(credentials.password, user.password))) {
          if (user.is_blocked) {
            throw new Error("Your account is blocked. Please contact support.");
          }
          return user;
        }
        return null;
      },
    }),
  ],
  session: { strategy: "jwt" },
});
