import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs";

export async function POST() {
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
      
      // Check if user is admin by role or by specific email
      const isAdmin = userRole === 'admin' || userEmail === 'rd92052@eanesisd.net';
      
      if (!isAdmin) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    } catch (error) {
      console.error('Error fetching user from Clerk:', error);
      return NextResponse.json({ error: 'Failed to verify admin status' }, { status: 500 });
    }

    // Get all users
    const users = await clerkClient.users.getUserList({ limit: 100 });
    
    // Find the user with email rd92052@eanesisd.net
    const targetUser = users.find(user => 
      user.emailAddresses?.[0]?.emailAddress === 'rd92052@eanesisd.net'
    );
    
    if (!targetUser) {
      return NextResponse.json({ error: 'User rd92052@eanesisd.net not found' }, { status: 404 });
    }
    
    // Grant admin rights by updating metadata
    await clerkClient.users.updateUserMetadata(targetUser.id, {
      publicMetadata: {
        role: 'admin'
      }
    });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Admin rights granted successfully to rd92052@eanesisd.net' 
    });
    
  } catch (error) {
    console.error('Error granting admin rights:', error);
    return NextResponse.json({ error: 'Failed to grant admin rights' }, { status: 500 });
  }
}
