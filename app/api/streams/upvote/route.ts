
import { prismaClient } from "@/app/lib/db";
import UpVoteSchema from "@/app/schemas/upVoteSchema";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    const user = await prismaClient.user.findFirst({
      where: {
        email: session?.user?.email ?? "",
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Unauthenticated" },
        { status: 403 }
      );
    }

    const data = UpVoteSchema.parse(await req.json());

    await prismaClient.upvote.create({
      data: {
        userId: user.id,
        streamId: data.streamId,
      },
    });

    return NextResponse.json(
      { message: "Upvoted successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error upvoting:", error);
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
