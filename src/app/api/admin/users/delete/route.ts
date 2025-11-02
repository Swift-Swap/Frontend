import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs";
import { redis, KEYS } from "@/lib/redis";

/**
 * Delete a user and all their data
 * WARNING: This is a destructive operation
 */
export async function DELETE(req: NextRequest) {
  try {
    const { userId: targetUserId } = await req.json();
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

    if (!targetUserId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Prevent deleting yourself
    if (targetUserId === currentUserId) {
      return NextResponse.json({ error: 'Cannot delete yourself' }, { status: 400 });
    }

    // Get user's listing IDs
    const userListingIds = await redis.smembers(KEYS.USER_LISTINGS(targetUserId)) as string[];
    
    // Delete all user's listings
    if (userListingIds && userListingIds.length > 0) {
      for (const listingId of userListingIds) {
        // Delete listing data
        await redis.del(KEYS.LISTING(listingId));
        // Remove from global listings set
        await redis.srem(KEYS.LISTINGS_ALL, listingId);
      }
    }

    // Delete user's listing set
    await redis.del(KEYS.USER_LISTINGS(targetUserId));

    // Delete user's purchased set
    await redis.del(KEYS.USER_PURCHASED(targetUserId));

    // Delete user from Clerk
    try {
      await clerkClient.users.deleteUser(targetUserId);
      console.log(`Deleted user: ${targetUserId}`);
    } catch (error) {
      console.error('Error deleting user from Clerk:', error);
      return NextResponse.json({ 
        error: 'Failed to delete user from Clerk' 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: `User and ${userListingIds.length} listings deleted successfully`,
      deletedListings: userListingIds.length
    });

  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}

