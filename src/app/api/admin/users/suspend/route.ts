import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs";

/**
 * Suspend or unsuspend a user account
 */
export async function POST(req: NextRequest) {
  try {
    const { userId: targetUserId, suspend } = await req.json();
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

    if (!targetUserId || typeof suspend !== 'boolean') {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }

    // Prevent suspending yourself
    if (targetUserId === currentUserId) {
      return NextResponse.json({ error: 'Cannot suspend yourself' }, { status: 400 });
    }

    // Update user metadata with suspended status
    await clerkClient.users.updateUserMetadata(targetUserId, {
      publicMetadata: {
        suspended: suspend,
        suspendedAt: suspend ? new Date().toISOString() : null,
        suspendedBy: suspend ? currentUserId : null,
      }
    });

    // Optionally ban the user from Clerk (prevents login)
    if (suspend) {
      await clerkClient.users.banUser(targetUserId);
    } else {
      await clerkClient.users.unbanUser(targetUserId);
    }

    console.log(`User ${suspend ? 'suspended' : 'unsuspended'}: ${targetUserId}`);

    return NextResponse.json({ 
      success: true, 
      message: `User ${suspend ? 'suspended' : 'unsuspended'} successfully` 
    });

  } catch (error) {
    console.error('Error suspending user:', error);
    return NextResponse.json({ error: 'Failed to suspend user' }, { status: 500 });
  }
}

