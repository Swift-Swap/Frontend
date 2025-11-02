import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
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

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    const users = await clerkClient.users.getUserList({ limit: 100 });
    const targetUser = users.find(user => user.emailAddresses?.[0]?.emailAddress === email);

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found with that email address' }, { status: 404 });
    }

    await clerkClient.users.updateUserMetadata(targetUser.id, {
      publicMetadata: {
        role: 'admin'
      }
    });

    console.log(`Admin rights granted to email: ${email}`);

    return NextResponse.json({ 
      success: true, 
      message: `Admin rights granted to ${email}` 
    });

  } catch (error) {
    console.error('Error adding admin:', error);
    return NextResponse.json({ error: 'Failed to add admin' }, { status: 500 });
  }
}