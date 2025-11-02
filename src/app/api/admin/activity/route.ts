import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs";
import { redis, KEYS } from "@/lib/redis";
import { ListingResponse } from "@/lib/utils";

interface Activity {
  id: string;
  type: "user_registration" | "listing_created" | "listing_sold";
  message: string;
  timeAgo: string;
  price: number;
  lot: string;
  spotNumber: number;
  timestamp: number;
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) {
    return 'Just now';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
  } else if (diffInMinutes < 1440) {
    const hours = Math.floor(diffInMinutes / 60);
    return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  } else {
    const days = Math.floor(diffInMinutes / 1440);
    return `${days} day${days === 1 ? '' : 's'} ago`;
  }
}

export async function GET() {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin by metadata
    try {
      const currentUser = await clerkClient.users.getUser(userId);
      const userEmail = currentUser.emailAddresses?.[0]?.emailAddress;
      const userRole = currentUser.publicMetadata?.role;
      
      // Check if user is admin by role or by specific email
      const isAdmin = userRole === 'admin' || userEmail === 'rd92052@eanesisd.net';
      
      if (!isAdmin) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    } catch (error) {
      console.error('Error fetching user from Clerk:', error);
      return NextResponse.json({ error: 'Failed to verify admin status' }, { status: 500 });
    }

    const activities: Activity[] = [];

    // Get user registration activities
    const users = await clerkClient.users.getUserList({ limit: 5 });
    
    users.forEach((user) => {
      const createdAt = new Date(user.createdAt);
      
      activities.push({
        id: `user-${user.id}`,
        type: "user_registration",
        message: `New user registered: ${user.firstName || 'Unknown'} ${user.lastName || ''}`.trim(),
        timeAgo: getTimeAgo(createdAt),
        price: 0,
        lot: "",
        spotNumber: 0,
        timestamp: createdAt.getTime()
      });
    });

    // Get all listing IDs from Upstash and loop through them
    const listingIds = await redis.smembers(KEYS.LISTINGS_ALL) as string[];
    
    if (listingIds && listingIds.length > 0) {
      // Fetch all listings
      const listingDataPromises = listingIds.map(id => redis.get(KEYS.LISTING(id)));
      const listingDataArray = await Promise.all(listingDataPromises);
      
      const listings: ListingResponse[] = listingDataArray
        .filter(data => data !== null)
        .map(data => typeof data === 'string' ? JSON.parse(data) : data as ListingResponse);

      // Add listing creation activities
      listings.forEach((listing) => {
        // Extract timestamp from listing_id (format: timestamp-randomstring)
        const timestampPart = listing.listing_id.split('-')[0];
        const createdTimestamp = parseInt(timestampPart);
        const createdDate = new Date(createdTimestamp);

        activities.push({
          id: `created-${listing.listing_id}`,
          type: "listing_created",
          message: `New listing created: ${listing.lot} Spot #${listing.spot_number}`,
          timeAgo: getTimeAgo(createdDate),
          price: listing.price,
          lot: listing.lot,
          spotNumber: listing.spot_number,
          timestamp: createdTimestamp
        });

        // Add sold activity if applicable
        if (listing.sold && listing.date_bought) {
          const soldDate = new Date(listing.date_bought);
          
          activities.push({
            id: `sold-${listing.listing_id}`,
            type: "listing_sold",
            message: `Listing sold: ${listing.lot} Spot #${listing.spot_number} for $${listing.price}`,
            timeAgo: getTimeAgo(soldDate),
            price: listing.price,
            lot: listing.lot,
            spotNumber: listing.spot_number,
            timestamp: soldDate.getTime()
          });
        }
      });
    }

    // Sort by timestamp (most recent first) and limit to 20 activities
    const sortedActivities = activities
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 20)
      .map(({ timestamp, ...activity }) => activity); // Remove timestamp from response

    return NextResponse.json(sortedActivities);
  } catch (error) {
    console.error("Error fetching admin activity:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}