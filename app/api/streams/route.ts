
import { NextRequest, NextResponse } from "next/server";
import CreateStreamSchema from "@/app/schemas/createStreamSchema";
import { prismaClient } from "@/app/lib/db";
import youtubesearchapi from "youtube-search-api";
import { YT_REGEX } from "@/app/lib/utils"; 

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
    await prismaClient.stream.create({
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

    return NextResponse.json(
      { message: "Stream added successfully" },
      { status: 201 }
    );
  } catch (e) {
    console.log(e)
    return NextResponse.json(
      { message: "Error while adding a stream" },
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
    const streams = await prismaClient.stream.findMany({
      where: {
        userId: creatorId,
      },
      include: {
        _count: {
          select: {
            upvotes: true,
          },
        },
        upvotes: true, // Include all upvotes for haveUpVoted check
      },
    });
    return NextResponse.json({
      streams: streams.map(({ _count, upvotes, ...rest }) => ({
        ...rest,
        upvotes: _count.upvotes,
        haveUpVoted: false, // For public view, maybe not check per user
      })),
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
