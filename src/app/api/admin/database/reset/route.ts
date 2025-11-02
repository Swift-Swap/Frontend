import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs";
import { redis, KEYS } from "@/lib/redis";

/**
 * Reset Upstash database - DELETES ALL LISTINGS!
 * WARNING: This is a destructive operation
 */
export async function POST() {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const currentUser = await clerkClient.users.getUser(userId);
    const userEmail = currentUser.emailAddresses?.[0]?.emailAddress;
    const userRole = currentUser.publicMetadata?.role;
    
    const isAdmin = userRole === 'admin' || userEmail === 'rd92052@eanesisd.net';
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    console.log('⚠️ UPSTASH DATABASE RESET INITIATED - This is a DANGEROUS operation!');

    // Get all listing IDs
    const allListingIds = await redis.smembers(KEYS.LISTINGS_ALL) as string[];
    const totalListings = allListingIds?.length || 0;

    console.log(`🗑️ Deleting ${totalListings} listings from Upstash...`);

    let deletedListings = 0;
    let deletedUserSets = 0;

    // Delete all listing data
    if (allListingIds && allListingIds.length > 0) {
      for (const listingId of allListingIds) {
        await redis.del(KEYS.LISTING(listingId));
        deletedListings++;
      }
      
      // Delete the main set
      await redis.del(KEYS.LISTINGS_ALL);
    }

    // Delete all user listing and purchase sets
    const users = await clerkClient.users.getUserList({ limit: 500 });
    
    for (const user of users) {
      const userId = user.id;
      
      // Delete user's listing set
      const deletedListingsSet = await redis.del(KEYS.USER_LISTINGS(userId));
      if (deletedListingsSet) deletedUserSets++;
      
      // Delete user's purchased set
      const deletedPurchasedSet = await redis.del(KEYS.USER_PURCHASED(userId));
      if (deletedPurchasedSet) deletedUserSets++;
    }

    const resetResults = {
      deletedListings,
      deletedUserSets,
      totalUsersProcessed: users.length,
      warning: 'All parking spot listings have been permanently deleted from Upstash'
    };

    console.log('✅ Database reset complete:', resetResults);

    return NextResponse.json({
      success: true,
      message: `Database reset complete: Deleted ${deletedListings} listings and ${deletedUserSets} user sets`,
      results: resetResults
    });

  } catch (error) {
    console.error('Error during database reset:', error);
    return NextResponse.json({ error: 'Database reset failed' }, { status: 500 });
  }
}