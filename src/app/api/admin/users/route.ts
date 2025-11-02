import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isAdmin: boolean;
  createdAt: string;
  lastActive: string;
}

export async function GET() {
  try {
    console.log('🔵 API: GET /api/admin/users called');
    const { userId } = auth();
    
    if (!userId) {
      console.log('❌ API: No userId found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('✅ API: User ID:', userId);

    // Check if user is admin by metadata
    try {
      const currentUser = await clerkClient.users.getUser(userId);
      const userEmail = currentUser.emailAddresses?.[0]?.emailAddress;
      const userRole = currentUser.publicMetadata?.role;
      
      console.log('📧 API: User email:', userEmail);
      console.log('👤 API: User role:', userRole);
      
      // Check if user is admin by role or by specific email
      const isAdmin = userRole === 'admin' || userEmail === 'rd92052@eanesisd.net';
      
      console.log('🔐 API: Is admin?', isAdmin);
      
      if (!isAdmin) {
        console.log('❌ API: Access forbidden for user:', userEmail);
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    } catch (error) {
      console.error('❌ API: Error fetching user from Clerk:', error);
      return NextResponse.json({ error: 'Failed to verify admin status' }, { status: 500 });
    }

    console.log('📋 API: Fetching users from Clerk...');
    const users = await clerkClient.users.getUserList({ limit: 100 });
    console.log('✅ API: Fetched', users.length, 'users from Clerk');
    
    const formattedUsers: User[] = users.map(user => {
      // Handle createdAt - could be timestamp or Date
      const createdAt = typeof user.createdAt === 'number' 
        ? new Date(user.createdAt).toISOString()
        : user.createdAt instanceof Date
        ? user.createdAt.toISOString()
        : new Date(user.createdAt).toISOString();
      
      // Handle updatedAt - could be timestamp or Date
      const lastActive = typeof user.updatedAt === 'number'
        ? new Date(user.updatedAt).toISOString()
        : user.updatedAt instanceof Date
        ? user.updatedAt.toISOString()
        : new Date(user.updatedAt).toISOString();

      return {
        id: user.id,
        email: user.emailAddresses?.[0]?.emailAddress || 'No email',
        firstName: user.firstName || 'Unknown',
        lastName: user.lastName || '',
        isAdmin: user.publicMetadata?.role === 'admin' || user.emailAddresses?.[0]?.emailAddress === 'rd92052@eanesisd.net',
        createdAt,
        lastActive
      };
    });

    console.log('✅ API: Returning', formattedUsers.length, 'formatted users');
    return NextResponse.json(formattedUsers);
  } catch (error) {
    console.error('❌ API: Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}