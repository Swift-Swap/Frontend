import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const param = searchParams.get("listing_id");
  await fetch(
    `https://nxme3koijrbrzgi6tir66oszky0oywwi.lambda-url.us-east-2.on.aws/api/v1/view/${param}`,
    {
      method: "POST",
      headers: {
        "X-API-KEY": process.env.API_KEY!,
      },
    },
  );
  return NextResponse.json({}, { status: 200 });
}
