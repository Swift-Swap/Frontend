import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs";
import { redis, KEYS } from "@/lib/redis";
import { ListingResponse } from "@/lib/utils";

/**
 * Backup all Upstash data (listings) and Clerk users to CSV
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

    console.log('💾 Upstash database backup initiated');
    
    // Get all listings from Upstash
    const allListingIds = await redis.smembers(KEYS.LISTINGS_ALL) as string[];
    console.log(`📊 Backing up ${allListingIds?.length || 0} listings`);

    const listings: ListingResponse[] = [];
    
    if (allListingIds && allListingIds.length > 0) {
      const listingDataArray = await Promise.all(
        allListingIds.map(id => redis.get(KEYS.LISTING(id)))
      );

      listingDataArray.forEach((data) => {
        if (data) {
          const listing = typeof data === 'string' ? JSON.parse(data) : data;
          listings.push(listing);
        }
      });
    }

    // Create CSV
    const headers = [
      'Listing ID', 'Owner ID', 'Spot Number', 'Lot', 'From Date', 'To Date',
      'Days', 'Price', 'Views', 'Sold', 'Buyer ID', 'Date Bought'
    ];

    const rows = listings.map(listing => [
      listing.listing_id,
      listing.owner_id,
      listing.spot_number,
      listing.lot,
      listing.fromdate,
      listing.todate,
      listing.days,
      listing.price,
      listing.views,
      listing.sold ? 'Yes' : 'No',
      listing.buyer_id || '',
      listing.date_bought || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(field => `"${field}"`).join(','))
    ].join('\n');

    const date = new Date().toISOString().split('T')[0];
    const filename = `swiftswap-listings-backup-${date}.csv`;

    console.log(`✅ Backup created: ${listings.length} listings`);

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });

  } catch (error) {
    console.error('Error during database backup:', error);
    return NextResponse.json({ error: 'Database backup failed' }, { status: 500 });
  }
}