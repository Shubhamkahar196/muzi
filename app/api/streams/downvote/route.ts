
import { prismaClient } from "@/app/lib/db";
import UpVoteSchema from "@/app/schemas/upVoteSchema";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const data = UpVoteSchema.parse(await req.json());

    let userId: string;

    if (session?.user?.email) {
      // Authenticated user
      const user = await prismaClient.user.findFirst({
        where: {
          email: session.user.email,
        },
      });

      if (!user) {
        return NextResponse.json(
          { message: "User not found" },
          { status: 404 }
        );
      }

      userId = user.id;
    } else {
      // Anonymous user - get or create user record
      const forwarded = req.headers.get("x-forwarded-for");
      const ip = forwarded ? forwarded.split(",")[0] : req.headers.get("x-real-ip") || "anonymous";
      const anonymousUserId = `anon_${ip}`;

      // Check if anonymous user already exists
      let anonymousUser = await prismaClient.user.findUnique({
        where: { id: anonymousUserId },
      });

      if (!anonymousUser) {
        // Create anonymous user
        anonymousUser = await prismaClient.user.create({
          data: {
            id: anonymousUserId,
            email: undefined,
            provider: undefined,
            isAnonymous: true,
          },
        });
      }

      userId = anonymousUser.id;
    }

    // Check if upvote exists
    const existingUpvote = await prismaClient.upvote.findUnique({
      where: {
        userId_streamId: {
          userId: userId,
          streamId: data.streamId,
        },
      },
    });

    if (!existingUpvote) {
      return NextResponse.json(
        { message: "No upvote to remove" },
        { status: 400 }
      );
    }

    await prismaClient.upvote.delete({
      where: {
        userId_streamId: {
          userId: userId,
          streamId: data.streamId,
        },
      },
    });

    return NextResponse.json(
      { message: "Upvote removed successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error downvoting:", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Something went wrong",
      },
      { status: 500 }
    );
  }
}
