import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const param = searchParams.get("listing_id");
    const res = await fetch(`https://bqg3arq4xd2oshbbrhc6e6aarq0qambb.lambda-url.us-east-2.on.aws/api/v1/add_view/${param}`, {
        method: "POST",
        headers: {
            "X-API-KEY": process.env.API_KEY!,
        }
    })
    return NextResponse.json({}, {status: 200});
}
