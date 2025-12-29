
import { prismaClient } from "@/app/lib/db";

import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google";
import type { User, Session } from "next-auth";
import { redirect } from "next/navigation";



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
      const existingUser = await prismaClient.user.findUnique({
        where: {
          email: user.email
        }
      });
      if (!existingUser) {
        await prismaClient.user.create({
          data: {
            email: user.email,
            provider: "Google"
          }
        });
      }
    } catch (error) {
      console.error("Error creating user:", error);
      return false;
    }
    return true;
  },
  async redirect({url, baseUrl}: {url: string; baseUrl: string}){
    if(url.startsWith(baseUrl)){
      return url
    }
    return `${baseUrl}/dashboard`;
  },
  async session({ session }: { session: Session }) {
    if (session.user?.email) {
      const dbUser = await prismaClient.user.findUnique({
        where: {
          email: session.user.email
        }
      });
      if (dbUser) {
        session.user.id = dbUser.id;
      }
    }
    return session;
  }
}
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }