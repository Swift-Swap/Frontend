import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import {ListingResponse} from "@/lib/utils";

export async function GET() {
    const { userId } = auth();
    const res = await fetch(
        `https://sppeb237h3wyc2s47q44lubmli0ijory.lambda-url.us-east-2.on.aws/api/v1/listings?user_id=${userId}`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "X-API-KEY": process.env.API_KEY!,
            },
        },
    );
    const json = await res.json() as ListingResponse[];
    const filtered = json.filter((l) => l.buyer_id === userId && userId != null && l.sold);
    return NextResponse.json(filtered, { status: res.status });

}
