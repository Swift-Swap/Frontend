import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs";
import { redis, KEYS } from "@/lib/redis";
import { ListingResponse } from "@/lib/utils";

/**
 * Export all users data as JSON or CSV
 */
export async function GET(req: Request) {
  try {
    const { userId: currentUserId } = auth();
    
    if (!currentUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if current user is admin
    const currentUser = await clerkClient.users.getUser(currentUserId);
    const userEmail = currentUser.emailAddresses?.[0]?.emailAddress;
    const userRole = currentUser.publicMetadata?.role;
    
    const isAdmin = userRole === 'admin' || userEmail === 'rd92052@eanesisd.net';
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get format from query params
    const { searchParams } = new URL(req.url);
    const format = searchParams.get('format') || 'json';

    // Fetch all users
    const users = await clerkClient.users.getUserList({ limit: 500 });

    // Enrich user data with stats from Upstash
    const enrichedUsers = await Promise.all(
      users.map(async (user) => {
        const userId = user.id;
        let totalListings = 0;
        let soldListings = 0;
        let totalRevenue = 0;
        let totalPurchases = 0;
        let totalSpent = 0;

        try {
          // Get user's listings
          const userListingIds = await redis.smembers(KEYS.USER_LISTINGS(userId)) as string[];
          
          if (userListingIds && userListingIds.length > 0) {
            const userListingsData = await Promise.all(
              userListingIds.map(id => redis.get(KEYS.LISTING(id)))
            );

            const userListings: ListingResponse[] = userListingsData
              .filter(data => data !== null)
              .map(data => typeof data === 'string' ? JSON.parse(data) : data);

            totalListings = userListings.length;
            soldListings = userListings.filter(l => l.sold).length;
            totalRevenue = userListings
              .filter(l => l.sold)
              .reduce((sum, l) => sum + (l.price || 0), 0);
          }

          // Get user's purchases
          const userPurchaseIds = await redis.smembers(KEYS.USER_PURCHASED(userId)) as string[];
          
          if (userPurchaseIds && userPurchaseIds.length > 0) {
            const userPurchasesData = await Promise.all(
              userPurchaseIds.map(id => redis.get(KEYS.LISTING(id)))
            );

            const userPurchases: ListingResponse[] = userPurchasesData
              .filter(data => data !== null)
              .map(data => typeof data === 'string' ? JSON.parse(data) : data);

            totalPurchases = userPurchases.length;
            totalSpent = userPurchases.reduce((sum, l) => sum + (l.price || 0), 0);
          }
        } catch (error) {
          console.error(`Error fetching stats for user ${userId}:`, error);
        }

        return {
          id: user.id,
          email: user.emailAddresses?.[0]?.emailAddress || 'No email',
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          isAdmin: user.publicMetadata?.role === 'admin',
          isSuspended: user.publicMetadata?.suspended === true || user.banned === true,
          createdAt: user.createdAt.toISOString(),
          lastActive: user.updatedAt.toISOString(),
          totalListings,
          soldListings,
          totalRevenue: parseFloat(totalRevenue.toFixed(2)),
          totalPurchases,
          totalSpent: parseFloat(totalSpent.toFixed(2)),
          netBalance: parseFloat((totalRevenue - totalSpent).toFixed(2)),
        };
      })
    );

    if (format === 'csv') {
      // Generate CSV
      const headers = [
        'ID', 'Email', 'First Name', 'Last Name', 'Admin', 'Suspended',
        'Created At', 'Last Active', 'Total Listings', 'Sold Listings',
        'Total Revenue', 'Total Purchases', 'Total Spent', 'Net Balance'
      ];

      const rows = enrichedUsers.map(user => [
        user.id,
        user.email,
        user.firstName,
        user.lastName,
        user.isAdmin ? 'Yes' : 'No',
        user.isSuspended ? 'Yes' : 'No',
        user.createdAt,
        user.lastActive,
        user.totalListings,
        user.soldListings,
        user.totalRevenue,
        user.totalPurchases,
        user.totalSpent,
        user.netBalance,
      ]);

      const csv = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="users-export-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }

    // Return JSON
    return NextResponse.json(enrichedUsers, {
      headers: {
        'Content-Disposition': `attachment; filename="users-export-${new Date().toISOString().split('T')[0]}.json"`,
      },
    });

  } catch (error) {
    console.error('Error exporting users:', error);
    return NextResponse.json({ error: 'Failed to export users' }, { status: 500 });
  }
}

