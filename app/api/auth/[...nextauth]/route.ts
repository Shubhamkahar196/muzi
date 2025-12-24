import { prismaClient } from "@/app/lib/db";

import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google";
import type { User } from "next-auth";


export const authOptions = {
  providers: [
  GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID || "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || ""
  })
],
secret: process.env.NEXTAUTH_SECRET ?? "secret",
callbacks: {
  async signIn({ user }: { user: User }) {
    if (!user.email) {
      return false
    }
    try {
      await prismaClient.user.create({
        data: {
          email: user.email,
          provider: "Google"
        }
      })
    } catch (error) {
      console.error("Error creating user:", error);
      return false;
    }
    return true;
  }
}
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
