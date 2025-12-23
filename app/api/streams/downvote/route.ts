
import { prismaClient } from "@/app/lib/db";
import UpVoteSchema from "@/app/schemas/upVoteSchema";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await getServerSession();

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

  try {
    const data = UpVoteSchema.parse(await req.json());

    await prismaClient.upvote.delete({
      where: {
        userId_streamId: {
          userId: user.id,
          streamId: data.streamId,
        },
      },
    });

    return NextResponse.json(
      { message: "Upvote removed successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Something went wrong",
      },
      { status: 411 }
    );
  }
}
