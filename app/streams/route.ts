import { NextRequest, NextResponse } from "next/server";
import CreateStreamSchema from "../schemas/CreateSchema";
import { prismaClient } from "../lib/db";


export async function POST(req:NextRequest){
    try {
        const data = CreateStreamSchema.parse(await req.json());
        prismaClient.stream.create({
           userId: data.creatorId, 
        })
    } catch (e) {
        return NextResponse.json({
            message: "Error while adding a stream"
        },{
            status: 411
        })
    }
}