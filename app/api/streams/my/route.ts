import { prismaClient } from "@/app/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    const user = await prismaClient.user.findFirst({
      where: {
        email: session?.user?.email ?? "",
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          message: "Unauthenticated",
        },
        {
          status: 403,
        }
      );
    }

    const [streams, currentStreamData] = await Promise.all([
      prismaClient.stream.findMany({
        where: {
          userId: user.id,
          active: true,
          played: false,
        },
        include: {
          _count: {
            select: {
              upvotes: true,
            },
          },
          upvotes: {
            where: {
              userId: user.id,
            },
          },
        },
        orderBy: [
          {
            upvotes: {
              _count: 'desc'
            }
          },
          {
            createAt: 'asc'
          }
        ],
      }),
      prismaClient.currentStream.findUnique({
        where: {
          userId: user.id,
        },
        include: {
          stream: {
            include: {
              _count: {
                select: {
                  upvotes: true,
                },
              },
            },
          },
        },
      })
    ]);

    return NextResponse.json({
      streams: streams.map(({ _count, upvotes, ...rest }) => ({
        ...rest,
        upvotes: _count.upvotes,
        haveUpVoted: upvotes.length > 0,
      })),
      currentStream: currentStreamData?.stream ? {
        id: currentStreamData.stream.id,
        title: currentStreamData.stream.title,
        upvotes: currentStreamData.stream._count.upvotes,
        extractedId: currentStreamData.stream.extractedId,
        type: currentStreamData.stream.type,
        url: currentStreamData.stream.url,
        smallImg: currentStreamData.stream.smallImg,
        bigImg: currentStreamData.stream.bigImg,
        userId: currentStreamData.stream.userId,
      } : null,
    });
  } catch (error) {
    console.error("Error fetching streams:", error);
    return NextResponse.json(
      {
        message: "Internal server error",
      },
      {
        status: 500,
      }
    );
  }
}
