// import { prismaClient } from "@/app/lib/db";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/app/api/auth/[...nextauth]/route";
// import { NextResponse } from "next/server";


// export async function GET(){
//     try {
//         const session = await getServerSession(authOptions);
//         const user = await prismaClient.user.findFirst({
//             where: {
//                 email: session?.user?.email ?? ""
//             }
//         });

//         if(!user){
//             return NextResponse.json({
//                 message: "Unauthorized"
//             },{
//                 status: 403
//             })
//         }

//         const mostUpVotedStream = await prismaClient.stream.findFirst({
//             where: {
//                 userId: user.id,
//                 active: true,
//                 played: false,
//             },
//             orderBy: [
//                 {
//                     upvotes: {
//                         _count: 'desc'
//                     }
//                 },
//                 {
//                     createAt: 'asc'
//                 }
//             ]
//         });

//         if (!mostUpVotedStream) {
//             return NextResponse.json({
//                 message: "No streams available to play"
//             }, {
//                 status: 404
//             })
//         }

//         await Promise.all([
//             prismaClient.currentStream.upsert({
//                 where: {
//                     userId: user.id
//                 },
//                 update: {
//                     streamId: mostUpVotedStream.id
//                 },
//                 create: {
//                     userId: user.id,
//                     streamId: mostUpVotedStream.id
//                 }
//             }),
//             prismaClient.stream.update({
//                 where: {
//                     id: mostUpVotedStream.id
//                 },
//                 data: {
//                     played: true,
//                     playedTs: new Date()
//                 }
//             })
//         ]);

//         return NextResponse.json({
//             stream: mostUpVotedStream
//         });
//     } catch (error) {
//         console.error("Error in next API:", error);
//         return NextResponse.json({
//             message: "Internal server error"
//         }, {
//             status: 500
//         });
//     }
// }


import { prismaClient } from "@/app/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const creatorId = searchParams.get("creatorId");

    if (!creatorId) {
      return NextResponse.json(
        { message: "creatorId is required" },
        { status: 400 }
      );
    }

    // Find highest voted unplayed stream
    const mostUpVotedStream = await prismaClient.stream.findFirst({
      where: {
        userId: creatorId,
        active: true,
        played: false,
      },
      orderBy: [
        {
          upvotes: {
            _count: "desc",
          },
        },
        {
          createAt: "asc",
        },
      ],
    });

    if (!mostUpVotedStream) {
      return NextResponse.json(
        { message: "No streams available" },
        { status: 404 }
      );
    }

    // Mark as played
    await prismaClient.stream.update({
      where: { id: mostUpVotedStream.id },
      data: {
        played: true,
        playedTs: new Date(),
      },
    });

    return NextResponse.json({
      stream: mostUpVotedStream,
    });
  } catch (error) {
    console.error("Error in next API:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
