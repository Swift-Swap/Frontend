import {NextRequest, NextResponse} from "next/server";
import {auth} from "@clerk/nextjs";
import {ListingResponse} from "@/lib/utils";

export async function POST(req: NextRequest) {
    const json = await req.json();
    console.log(json)
    const {userId} = auth();
    const res = await fetch(
        `https://yitqriagsazb2fo4rvtndcovk40hfdwm.lambda-url.us-east-2.on.aws/api/v1/create/listing?owner_id=${userId}`,
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
    return NextResponse.json(jsonRes, {status: res.status});
}

export async function GET() {
    const {userId} = auth();
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
    const rawJson = await res.json();
    const json = rawJson as ListingResponse[];
    let filtered = json.filter((l) => !l.sold && l.owner_id != userId);
    const status = res.status;
    return NextResponse.json(filtered, {status});
}

export async function PUT(req: NextRequest) {
    const json = await req.json();
    const {searchParams} = new URL(req.url);
    const param = searchParams.get("listing_id");
    const res = await fetch(
        `https://tx2wqhq77mdfggm7htspikdvqa0uddrs.lambda-url.us-east-2.on.aws/api/v1/edit/${param}`,
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
    return NextResponse.json(jsonRes, {status: res.status});
}

export async function DELETE(req: NextRequest) {
    const {searchParams} = new URL(req.url);
    const param = searchParams.get("listing_id");
    console.log(param)
    const res = await fetch(
        `https://kygvbcwywbowduvn6e5jhf32uy0nrfzy.lambda-url.us-east-2.on.aws/api/v1/delete/listing/${param}`,
        {
            method: "DELETE",
            headers: {
                "X-API-KEY": process.env.API_KEY!,
            },
        },
    );
    const text = await res.text()
    return NextResponse.json({}, {status: res.status})
}
