import { auth } from "@clerk/nextjs"
import { NextResponse } from "next/server"

export async function GET() {
    const {userId} = auth()
    const res = await fetch(`https://j3gfpbq4yhtbodbp7ubmesodkq0mntqd.lambda-url.us-east-2.on.aws/api/v1/purchased/listings/${userId}`, {
        method: "GET",
        headers: {
            "X-API-KEY": process.env.API_KEY!,
        }
    })
    const json = await res.json()
    return NextResponse.json(json, {status: res.status})
}
