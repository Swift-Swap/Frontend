import { ListingResponse } from "@/lib/utils";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { redis, KEYS } from "@/lib/redis";

export async function GET() {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user is admin
    const currentUser = await clerkClient.users.getUser(userId);
    const userEmail = currentUser.emailAddresses?.[0]?.emailAddress;
    const userRole = currentUser.publicMetadata?.role;
    
    const isAdmin = userRole === 'admin' || userEmail === 'rd92052@eanesisd.net';
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get all listing IDs
    const listingIds = await redis.smembers(KEYS.LISTINGS_ALL) as string[];

    if (!listingIds || listingIds.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    // Fetch all listings (including sold ones for admin view)
    const listings: ListingResponse[] = [];
    for (const id of listingIds) {
      const listingData = await redis.get(KEYS.LISTING(id));
      if (listingData) {
        const listing = typeof listingData === 'string' 
          ? JSON.parse(listingData) 
          : listingData as ListingResponse;
        listings.push(listing);
      }
    }

    return NextResponse.json(listings, { status: 200 });
  } catch (error) {
    console.error("Error fetching admin listings:", error);
    return NextResponse.json({ error: "Failed to fetch admin listings" }, { status: 500 });
  }
}
