import { prismaClient } from "@/app/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";


export async function GET(){
    const session = await getServerSession();
    const user = await prismaClient.user.findFirst({
        where: {
            email: session?.user?.email ?? ""
        }
    });

    if(!user){
        return NextResponse.json({
            message: "Unauthorized"
        },{
            status: 403
        })
    }

    const mostUpVotedStream = await prismaClient.stream.findFirst({
        where: {
            userId: user.id,
            active: true,
            played: false,
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
        ]
    });

    await Promise.all([prismaClient.currentStream.upsert({
        where: {
            userId:  user.id
        },
        update: {
            streamId: mostUpVotedStream?.id
        },
        create: {
            userId: user.id,
            streamId: mostUpVotedStream?.id
        }
    }), prismaClient.stream.update({
        where: {
            id: mostUpVotedStream?.id ?? ""
        },
        data: {
            played: true,
            playedTs: new Date()
        }
    })])

    return NextResponse.json({
        stream : mostUpVotedStream
    })
}
