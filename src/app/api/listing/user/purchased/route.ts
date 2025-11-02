import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { ListingResponse } from "@/lib/utils";
import { redis, KEYS } from "@/lib/redis";

export async function GET() {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's purchased listing IDs
    const listingIds = await redis.smembers(KEYS.USER_PURCHASED(userId)) as string[];

    if (!listingIds || listingIds.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    // Fetch all purchased listings
    const listings: ListingResponse[] = [];
    for (const id of listingIds) {
      const listingData = await redis.get(KEYS.LISTING(id));
      if (listingData) {
        const listing = typeof listingData === 'string' 
          ? JSON.parse(listingData) 
          : listingData as ListingResponse;
        
        // Double check buyer_id and sold status
        if (listing.buyer_id === userId && listing.sold) {
          listings.push(listing);
        }
      }
    }

    return NextResponse.json(listings, { status: 200 });
  } catch (error) {
    console.error("Error fetching purchased listings:", error);
    return NextResponse.json({ error: "Failed to fetch purchased listings" }, { status: 500 });
  }
}
