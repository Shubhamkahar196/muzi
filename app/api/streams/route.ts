import { NextRequest, NextResponse } from "next/server";
import CreateStreamSchema from "../../schemas/CreateSchema";
import { prismaClient } from "../../lib/db";

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
    
}