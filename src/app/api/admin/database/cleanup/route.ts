import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs";
import { redis, KEYS } from "@/lib/redis";
import { ListingResponse } from "@/lib/utils";

/**
 * Clean up orphaned Upstash keys and fix data inconsistencies
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

    console.log('🧹 Upstash database cleanup initiated');
    
    let orphanedListings = 0;
    let orphanedUserSets = 0;
    let fixedReferences = 0;

    // Get all listing IDs from the main set
    const allListingIds = await redis.smembers(KEYS.LISTINGS_ALL) as string[];
    console.log(`📊 Found ${allListingIds?.length || 0} listing IDs in main set`);

    // Check each listing for orphaned data
    if (allListingIds && allListingIds.length > 0) {
      for (const listingId of allListingIds) {
        const listingData = await redis.get(KEYS.LISTING(listingId));
        
        if (!listingData) {
          // Orphaned listing ID - remove from set
          await redis.srem(KEYS.LISTINGS_ALL, listingId);
          orphanedListings++;
          console.log(`  ✓ Removed orphaned listing ID: ${listingId}`);
        } else {
          // Verify listing is in user's set
          const listing = typeof listingData === 'string' 
            ? JSON.parse(listingData) 
            : listingData as ListingResponse;
          
          if (listing.owner_id) {
            const userHasListing = await redis.sismember(
              KEYS.USER_LISTINGS(listing.owner_id), 
              listingId
            );
            
            if (!userHasListing) {
              await redis.sadd(KEYS.USER_LISTINGS(listing.owner_id), listingId);
              fixedReferences++;
              console.log(`  ✓ Fixed: Added listing ${listingId} to user ${listing.owner_id}`);
            }
          }

          // Verify sold listings are in buyer's purchased set
          if (listing.sold && listing.buyer_id) {
            const buyerHasPurchase = await redis.sismember(
              KEYS.USER_PURCHASED(listing.buyer_id),
              listingId
            );
            
            if (!buyerHasPurchase) {
              await redis.sadd(KEYS.USER_PURCHASED(listing.buyer_id), listingId);
              fixedReferences++;
              console.log(`  ✓ Fixed: Added purchase ${listingId} to buyer ${listing.buyer_id}`);
            }
          }
        }
      }
    }

    const cleanupResults = {
      totalListingsChecked: allListingIds?.length || 0,
      orphanedListingsRemoved: orphanedListings,
      referencesFixed: fixedReferences,
      databaseOptimized: true,
    };

    console.log('✅ Cleanup complete:', cleanupResults);

    return NextResponse.json({
      success: true,
      message: `Cleanup completed: Removed ${orphanedListings} orphaned listings, fixed ${fixedReferences} references`,
      results: cleanupResults
    });

  } catch (error) {
    console.error('Error during database cleanup:', error);
    return NextResponse.json({ error: 'Database cleanup failed' }, { status: 500 });
  }
}