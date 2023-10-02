import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import {ListingResponse} from "@/lib/utils";

export async function GET() {
  const { userId } = auth();
  const res = await fetch(
    `https://sppeb237h3wyc2s47q44lubmli0ijory.lambda-url.us-east-2.on.aws/api/v1/listings`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": process.env.API_KEY!,
      },
    },
  );
  const json = await res.json() as ListingResponse[];
  const filtered = json.filter((l) => l.owner_id === userId && userId != null);
  return NextResponse.json(filtered, { status: res.status });
}
