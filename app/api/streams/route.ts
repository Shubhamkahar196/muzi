
import { NextRequest, NextResponse } from "next/server";
import CreateStreamSchema from "@/app/schemas/createStreamSchema";
import { prismaClient } from "@/app/lib/db";
import youtubesearchapi from "youtube-search-api";
import { YT_REGEX } from "@/app/lib/utils";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

function extractYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([\w-]{11})/
  );
  return match ? match[1] : null;
}

export async function POST(req: NextRequest) {
  try {
    const data = CreateStreamSchema.parse(await req.json());

    const isYT = YT_REGEX.test(data.url);
    if (!isYT) {
      return NextResponse.json(
        { message: "Wrong URL Format" },
        { status: 400 }
      );
    }

    const extractedId = extractYouTubeId(data.url);


    if (!extractedId) {
      return NextResponse.json(
        { message: "Invalid YouTube URL" },
        { status: 400 }
      );
    }

    const res = await youtubesearchapi.GetVideoDetails(extractedId)
    console.log(res.title)
    console.log(res.thumbnail.thumbnails)
    const thumbnails = res.thumbnail.thumbnails
    thumbnails.sort((a: {width:number}, b:{width:number}) => a.width < b.width ? -1 : 1);
    const newStream = await prismaClient.stream.create({
      data: {
        userId: data.creatorId,
        url: data.url,
        extractedId,
        type: "YouTube",
        title: res.title ?? "can't find title",
        smallImg: (thumbnails.length > 1 ? thumbnails[thumbnails.length -2].url: thumbnails[thumbnails.length -1].url) ??
        "https://unsplash.com/s/photos/cat",
        bigImg: thumbnails[thumbnails.length -1].url ?? "https://unsplash.com/s/photos/cat"
      },
    });

    // Get the stream with upvotes count
    const streamWithUpvotes = await prismaClient.stream.findUnique({
      where: { id: newStream.id },
      include: {
        _count: {
          select: {
            upvotes: true,
          },
        },
        upvotes: {
          where: {
            userId: data.creatorId,
          },
        },
      },
    });

    return NextResponse.json({
      message: "Stream added successfully",
      stream: streamWithUpvotes ? {
        ...streamWithUpvotes,
        upvotes: streamWithUpvotes._count.upvotes,
        haveUpVoted: streamWithUpvotes.upvotes.length > 0,
      } : null
    }, { status: 201 });
  } catch (e) {
    console.log(e)
    return NextResponse.json(
      { message: "Error while adding a stream" },
      { status: 500 }
    );
  }
}


export async function DELETE(req: NextRequest) {
  try {
    const { streamId } = await req.json();

    if (!streamId) {
      return NextResponse.json(
        { message: "Stream ID is required" },
        { status: 400 }
      );
    }

    // Verify ownership
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

    const stream = await prismaClient.stream.findFirst({
      where: {
        id: streamId,
        userId: user.id,
      },
    });

    if (!stream) {
      return NextResponse.json(
        { message: "Stream not found or not owned by user" },
        { status: 404 }
      );
    }

    await prismaClient.stream.update({
      where: {
        id: streamId,
      },
      data: {
        active: false,
      },
    });

    return NextResponse.json(
      { message: "Stream deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting stream:", error);
    return NextResponse.json(
      { message: "Error while deleting stream" },
      { status: 500 }
    );
  }
}

export async function GET(req:NextRequest){
  try {
    const creatorId = req.nextUrl.searchParams.get("creatorId");
    if(!creatorId){
      return NextResponse.json({
        message: "Creator ID is required"
      },{
        status: 400
      })
    }
    const [streams, currentStreamData] = await Promise.all([
      prismaClient.stream.findMany({
        where: {
          userId: creatorId,
          active: true,
          played: false,
        },
        include: {
          _count: {
            select: {
              upvotes: true,
            },
          },
          upvotes: true, // Include all upvotes for counting
        },
        orderBy: {
          createAt: 'asc',
        },
      }),
      prismaClient.currentStream.findUnique({
        where: {
          userId: creatorId,
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
      streams: streams.map((stream: any) => ({
        id: stream.id,
        title: stream.title,
        upvotes: stream._count.upvotes,
        extractedId: stream.extractedId,
        type: stream.type,
        url: stream.url,
        smallImg: stream.smallImg,
        bigImg: stream.bigImg,
        userId: stream.userId,
        haveUpVoted: false, // For public view, maybe not check per user
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
