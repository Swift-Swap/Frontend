import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function GET() {
  const { userId } = auth();
  const res = await fetch(
    `https://krxtewaouganxanmcmbx7o6bha0ygcmd.lambda-url.us-east-2.on.aws/api/v1/listings/${userId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": process.env.API_KEY!,
      },
    },
  );
  const json = await res.json();
  console.log(json);
  return NextResponse.json(json, { status: res.status });
}
