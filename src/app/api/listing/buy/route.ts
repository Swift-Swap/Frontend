import { auth } from "@clerk/nextjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const param = searchParams.get("listing_id");
  const { userId } = auth();
  const res = await fetch(
    `https://3amveqyakasyxybj746b3itahe0ofpzi.lambda-url.us-east-2.on.aws/api/v1/buy/listing/${param}?buyer_id=${userId}`,
    {
      method: "POST",
      headers: {
        "X-API-KEY": process.env.API_KEY!,
      },
    },
  );
  return NextResponse.json({}, { status: res.status });
}
