import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs";

export async function POST(req: NextRequest) {
  try {
    const { userId: targetUserId, isAdmin } = await req.json();
    const { userId: currentUserId } = auth();

    if (!currentUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin by metadata
    try {
      const currentUser = await clerkClient.users.getUser(currentUserId);
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

    if (!targetUserId || typeof isAdmin !== 'boolean') {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }

    const targetUser = await clerkClient.users.getUser(targetUserId);
    
    if (isAdmin) {
      await clerkClient.users.updateUserMetadata(targetUserId, {
        publicMetadata: {
          role: 'admin'
        }
      });
    } else {
      await clerkClient.users.updateUserMetadata(targetUserId, {
        publicMetadata: {
          role: 'user'
        }
      });
    }

    console.log(`Admin rights ${isAdmin ? 'granted to' : 'revoked from'} user: ${targetUser.primaryEmailAddress?.emailAddress}`);

    return NextResponse.json({ 
      success: true, 
      message: `Admin rights ${isAdmin ? 'granted' : 'revoked'} successfully` 
    });

  } catch (error) {
    console.error('Error updating admin rights:', error);
    return NextResponse.json({ error: 'Failed to update admin rights' }, { status: 500 });
  }
}