import { ListingResponse } from "@/lib/utils";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
    const {userId} = auth();
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
    const rawJson = await res.json();
    console.log(res.status);
    const json = rawJson as ListingResponse[];
    const status = res.status;
    return NextResponse.json(json, {status});
}
