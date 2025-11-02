import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs";

export async function POST() {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current user to check email
    const currentUser = await clerkClient.users.getUser(userId);
    const userEmail = currentUser.emailAddresses?.[0]?.emailAddress;
    
    // Only allow setup for specific email (rd92052@eanesisd.net)
    if (userEmail !== 'rd92052@eanesisd.net') {
      return NextResponse.json({ error: 'Forbidden - Setup only allowed for rd92052@eanesisd.net' }, { status: 403 });
    }

    // Grant admin rights by updating metadata
    await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: {
        role: 'admin'
      }
    });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Admin rights granted successfully' 
    });
    
  } catch (error) {
    console.error('Error setting up admin:', error);
    return NextResponse.json({ error: 'Failed to setup admin' }, { status: 500 });
  }
}


