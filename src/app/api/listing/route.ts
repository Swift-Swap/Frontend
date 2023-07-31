import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";

export async function POST(req: NextRequest) {
  const json = await req.json();
  const { userId } = auth();
  console.log(json, process.env.API_KEY);
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
  console.log(jsonRes);
  return NextResponse.json(jsonRes);
}
