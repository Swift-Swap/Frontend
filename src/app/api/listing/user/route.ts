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

    // Get user's listing IDs
    const listingIds = await redis.smembers(KEYS.USER_LISTINGS(userId)) as string[];

    if (!listingIds || listingIds.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    // Fetch all user's listings
    const listings: ListingResponse[] = [];
    for (const id of listingIds) {
      const listingData = await redis.get(KEYS.LISTING(id));
      if (listingData) {
        const listing = typeof listingData === 'string' 
          ? JSON.parse(listingData) 
          : listingData as ListingResponse;
        
        // Double check ownership
        if (listing.owner_id === userId) {
          listings.push(listing);
        }
      }
    }

    return NextResponse.json(listings, { status: 200 });
  } catch (error) {
    console.error("Error fetching user listings:", error);
    return NextResponse.json({ error: "Failed to fetch user listings" }, { status: 500 });
  }
}
