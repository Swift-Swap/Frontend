import { auth } from "@clerk/nextjs";
import { NextRequest, NextResponse } from "next/server";
import { redis, KEYS } from "@/lib/redis";
import { ListingResponse } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const listingId = searchParams.get("listing_id");
    const { userId } = auth();

    if (!listingId) {
      return NextResponse.json({ error: "Listing ID required" }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the listing
    const existingData = await redis.get(KEYS.LISTING(listingId));
    if (!existingData) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    const listing = typeof existingData === 'string' 
      ? JSON.parse(existingData) 
      : existingData as ListingResponse;

    // Check if already sold
    if (listing.sold) {
      return NextResponse.json({ error: "Listing already sold" }, { status: 400 });
    }

    // Check if user is trying to buy their own listing
    if (listing.owner_id === userId) {
      return NextResponse.json({ error: "Cannot buy your own listing" }, { status: 400 });
    }

    // Update the listing as sold
    const updatedListing: ListingResponse = {
      ...listing,
      sold: true,
      buyer_id: userId,
      bought: true,
      date_bought: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
    };

    // Save the updated listing
    await redis.set(KEYS.LISTING(listingId), JSON.stringify(updatedListing));

    // Add to buyer's purchased listings
    await redis.sadd(KEYS.USER_PURCHASED(userId), listingId);

    return NextResponse.json({ success: true, listing: updatedListing }, { status: 200 });
  } catch (error) {
    console.error("Error buying listing:", error);
    return NextResponse.json({ error: "Failed to purchase listing" }, { status: 500 });
  }
}
