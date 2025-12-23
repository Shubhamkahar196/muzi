
import { NextRequest, NextResponse } from "next/server";
import CreateStreamSchema from "@/app/schemas/createStreamSchema";
import { prismaClient } from "@/app/lib/db";
import youtubesearchapi from "youtube-search-api";
 
const YT_REGEX =
  /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;

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
        { status: 411 }
      );
    }

    const extractedId = extractYouTubeId(data.url);
   

    if (!extractedId) {
      return NextResponse.json(
        { message: "Invalid YouTube URL" },
        { status: 411 }
      );
    }

     const res = await youtubesearchapi.GetVideoDetails(extractedId)
    console.log(res.title)
    console.log(res.thumbnail.thumbnails)
    console.log(JSON.stringify(res.thumbnail.thumbnails))

    await prismaClient.stream.create({
      data: {
        userId: data.creatorId,
        url: data.url,
        extractedId,
        type: "YouTube",
      },
    });

    return NextResponse.json(
      { message: "Stream added successfully" },
      { status: 201 }
    );
  } catch (e) {
    return NextResponse.json(
      { message: "Error while adding a stream" },
      { status: 411 }
    );
  }
}


export async function GET(req:NextRequest){
    const creatorId = req.nextUrl.searchParams.get("creatorId");
    const streams = await prismaClient.stream.findMany({
      where: {
        userId: creatorId ?? ""
      }
    })
    return NextResponse.json({
      streams
    })
}



