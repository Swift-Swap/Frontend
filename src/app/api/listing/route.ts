import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { ListingResponse } from "@/lib/utils";

export async function POST(req: NextRequest) {
  const json = await req.json();
  const { userId } = auth();
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
  return NextResponse.json(jsonRes, { status: res.status });
}

export async function GET() {
  const res = await fetch(
    `https://qht4r4mdj7qvem5vmmhhwsbd7m0znfem.lambda-url.us-east-2.on.aws/api/v1/listings`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": process.env.API_KEY!,
      },
    },
  );
  const rawJson = await res.json();
  const json = rawJson as ListingResponse[];
  const status = res.status;
  return NextResponse.json(json, { status });
}

export async function PUT(req: NextRequest) {
  const json = await req.json();
  const { searchParams } = new URL(req.url);
  const param = searchParams.get("listing_id");
  const res = await fetch(
    `https://4uinr4ae3cg3wigkjjl4zqihsu0ggtgw.lambda-url.us-east-2.on.aws/api/v1/edit/${param}`,
    {
      method: "PUT",
      body: JSON.stringify(json),
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        "X-API-KEY": process.env.API_KEY!,
      },
    },
  );
  const jsonRes = await res.json();
  return NextResponse.json(jsonRes, { status: res.status });
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const param = searchParams.get("listing_id");
  const res = await fetch(
    `https://spallk23ymaljjgfqmbs5wnsxe0tsicq.lambda-url.us-east-2.on.aws/api/v1/delete/listing/${param}`,
    {
      method: "DELETE",
      headers: {
        "X-API-KEY": process.env.API_KEY!,
      },
    },
  );
  return NextResponse.json({}, { status: res.status });
}
