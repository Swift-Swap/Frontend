import { NextRequest, NextResponse } from "next/server";
import { redis, KEYS } from "@/lib/redis";
import { ListingResponse } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const listingId = searchParams.get("listing_id");

    if (!listingId) {
      return NextResponse.json({ error: "Listing ID required" }, { status: 400 });
    }

    // Get the listing
    const existingData = await redis.get(KEYS.LISTING(listingId));
    if (!existingData) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    const listing = typeof existingData === 'string' 
      ? JSON.parse(existingData) 
      : existingData as ListingResponse;

    // Increment view count
    const updatedListing: ListingResponse = {
      ...listing,
      views: listing.views + 1,
    };

    // Save the updated listing
    await redis.set(KEYS.LISTING(listingId), JSON.stringify(updatedListing));

    return NextResponse.json({ success: true, views: updatedListing.views }, { status: 200 });
  } catch (error) {
    console.error("Error incrementing view count:", error);
    return NextResponse.json({ error: "Failed to increment view count" }, { status: 500 });
  }
}
