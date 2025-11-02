import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs";
import { redis, KEYS } from "@/lib/redis";
import { ListingResponse } from "@/lib/utils";

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
      
      console.log('Admin check - User ID:', userId);
      console.log('Admin check - User email:', userEmail);
      console.log('Admin check - User role:', userRole);
      
      // Check if user is admin by role or by specific email
      const isAdmin = userRole === 'admin' || userEmail === 'rd92052@eanesisd.net';
      
      if (!isAdmin) {
        console.log('Access denied - user is not admin. Email:', userEmail, 'Role:', userRole);
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    } catch (error) {
      console.error('Error fetching user from Clerk:', error);
      return NextResponse.json({ error: 'Failed to verify admin status' }, { status: 500 });
    }

    // Get user count from Clerk
    const users = await clerkClient.users.getUserList({ limit: 100 });
    
    // Get all listing IDs from Upstash - OPERATION 1
    const listingIds = await redis.smembers(KEYS.LISTINGS_ALL) as string[];
    
    console.log(`📊 Found ${listingIds?.length || 0} listing IDs in Redis`);
    
    // Initialize stats
    let totalListings = 0;
    let activeListings = 0;
    let soldListings = 0;
    let totalViews = 0;
    let totalRevenue = 0;
    let totalDaysOfParking = 0;

    // Fetch all listings in parallel using Promise.all - OPERATION 2 (batched)
    if (listingIds && listingIds.length > 0) {
      // Build array of listing keys
      const listingKeys = listingIds.map(id => KEYS.LISTING(id));
      
      console.log(`🔄 Fetching ${listingKeys.length} listings in parallel...`);
      
      // Fetch all listings at once in parallel
      const listingDataArray = await Promise.all(
        listingIds.map(id => redis.get(KEYS.LISTING(id)))
      );
      
      console.log(`✅ Retrieved ${listingDataArray.length} listings from Redis`);
      
      // Loop through the results to calculate stats
      listingDataArray.forEach((listingData) => {
        if (listingData) {
          const listing = typeof listingData === 'string' 
            ? JSON.parse(listingData) 
            : listingData as ListingResponse;
          
          totalListings++;
          totalViews += listing.views || 0;
          
          if (listing.sold) {
            soldListings++;
            totalRevenue += listing.price || 0;
            totalDaysOfParking += listing.days || 0;
          } else {
            activeListings++;
          }
        }
      });
    }

    const stats = {
      totalUsers: users.length,
      activeListings: activeListings,
      totalListings: totalListings,
      totalViews: totalViews,
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      soldListings: soldListings,
      totalDaysOfParking: totalDaysOfParking,
      recentActivity: soldListings, // Using sold listings as activity indicator
      systemStatus: "Online",
      databaseKeys: listingIds.length
    };

    console.log('Admin stats calculated:', stats);

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}