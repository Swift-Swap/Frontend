import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs";
import { redis, KEYS } from "@/lib/redis";
import { ListingResponse } from "@/lib/utils";

/**
 * Get statistics for a specific user
 * Includes listings created, purchases made, revenue earned, etc.
 */
export async function GET(req: NextRequest) {
  try {
    const { userId: currentUserId } = auth();
    
    if (!currentUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const currentUser = await clerkClient.users.getUser(currentUserId);
    const userEmail = currentUser.emailAddresses?.[0]?.emailAddress;
    const userRole = currentUser.publicMetadata?.role;
    
    const isAdmin = userRole === 'admin' || userEmail === 'rd92052@eanesisd.net';
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get target user ID from query params
    const { searchParams } = new URL(req.url);
    const targetUserId = searchParams.get('userId');

    if (!targetUserId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Initialize stats
    const stats = {
      userId: targetUserId,
      totalListings: 0,
      activeListings: 0,
      soldListings: 0,
      totalRevenue: 0,
      totalPurchases: 0,
      totalSpent: 0,
      totalViews: 0,
      avgPrice: 0,
      mostPopularLot: '',
      joinDate: '',
      lastActive: '',
    };

    // Get user's listings
    const userListingIds = await redis.smembers(KEYS.USER_LISTINGS(targetUserId)) as string[];
    
    if (userListingIds && userListingIds.length > 0) {
      const userListingsData = await Promise.all(
        userListingIds.map(id => redis.get(KEYS.LISTING(id)))
      );

      const userListings: ListingResponse[] = userListingsData
        .filter(data => data !== null)
        .map(data => typeof data === 'string' ? JSON.parse(data) : data);

      stats.totalListings = userListings.length;
      
      let totalPrice = 0;
      const lotCounts: Record<string, number> = {};

      userListings.forEach((listing) => {
        stats.totalViews += listing.views || 0;
        totalPrice += listing.price || 0;
        
        lotCounts[listing.lot] = (lotCounts[listing.lot] || 0) + 1;

        if (listing.sold) {
          stats.soldListings++;
          stats.totalRevenue += listing.price || 0;
        } else {
          stats.activeListings++;
        }
      });

      stats.avgPrice = userListings.length > 0 ? totalPrice / userListings.length : 0;
      
      // Find most popular lot
      const sortedLots = Object.entries(lotCounts).sort((a, b) => b[1] - a[1]);
      stats.mostPopularLot = sortedLots.length > 0 ? sortedLots[0][0] : '';
    }

    // Get user's purchases
    const userPurchaseIds = await redis.smembers(KEYS.USER_PURCHASED(targetUserId)) as string[];
    
    if (userPurchaseIds && userPurchaseIds.length > 0) {
      const userPurchasesData = await Promise.all(
        userPurchaseIds.map(id => redis.get(KEYS.LISTING(id)))
      );

      const userPurchases: ListingResponse[] = userPurchasesData
        .filter(data => data !== null)
        .map(data => typeof data === 'string' ? JSON.parse(data) : data);

      stats.totalPurchases = userPurchases.length;
      stats.totalSpent = userPurchases.reduce((sum, listing) => sum + (listing.price || 0), 0);
    }

    // Get user info from Clerk
    try {
      const targetUser = await clerkClient.users.getUser(targetUserId);
      stats.joinDate = targetUser.createdAt.toISOString();
      stats.lastActive = targetUser.updatedAt.toISOString();
    } catch (error) {
      console.log('User not found in Clerk:', targetUserId);
    }

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json({ error: 'Failed to fetch user stats' }, { status: 500 });
  }
}

