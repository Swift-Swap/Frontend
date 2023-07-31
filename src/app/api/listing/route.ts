import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { ListingResponse } from "@/lib/utils";

export async function POST(req: NextRequest) {
    const json = await req.json();
    const { userId } = auth();
    if (!userId) {
        return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    }
    const res = await fetch(
        `https://jeqhrywz6udusjzryqr76kwoxa0dxlvv.lambda-url.us-east-2.on.aws/api/v1/create/listing?owner_id=${userId}`,
        {
            method: "POST",
            body: JSON.stringify(json),
            headers: {
                "Content-Type": "application/json",
                "X-API-KEY": process.env.API_KEY!,
            },
        },
    );
    const jsonRes = await res.json();
    return NextResponse.json(jsonRes);
}



export async function GET() {
    const { userId } = auth();
    if (!userId) {
        return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    }
    const res = await fetch(
        `https://qht4r4mdj7qvem5vmmhhwsbd7m0znfem.lambda-url.us-east-2.on.aws/api/v1/listings`,
        {
            method: "GET",
            headers: {
                "X-API-KEY": process.env.API_KEY!,
            }
        }
    )
    const json = await res.json() as ListingResponse[]
    const status = res.status;
    return NextResponse.json(json, { status });
}
