import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs";

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
      
      // Check if user is admin by role or by specific email
      const isAdmin = userRole === 'admin' || userEmail === 'rd92052@eanesisd.net';
      
      if (!isAdmin) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    } catch (error) {
      console.error('Error fetching user from Clerk:', error);
      return NextResponse.json({ error: 'Failed to verify admin status' }, { status: 500 });
    }

    const users = await clerkClient.users.getUserList({ limit: 100 });
    
    const csvHeaders = [
      'User ID',
      'Email',
      'First Name',
      'Last Name',
      'Created At',
      'Last Active',
      'Admin Status'
    ];

    const csvRows = users.map(user => {
      // Handle timestamps - could be number or Date
      const createdAt = typeof user.createdAt === 'number' 
        ? new Date(user.createdAt).toISOString()
        : user.createdAt instanceof Date
        ? user.createdAt.toISOString()
        : new Date(user.createdAt).toISOString();
      
      const updatedAt = typeof user.updatedAt === 'number'
        ? new Date(user.updatedAt).toISOString()
        : user.updatedAt instanceof Date
        ? user.updatedAt.toISOString()
        : new Date(user.updatedAt).toISOString();

      return [
        user.id,
        user.emailAddresses?.[0]?.emailAddress || 'No email',
        user.firstName || 'Unknown',
        user.lastName || '',
        createdAt,
        updatedAt,
        (user.publicMetadata?.role === 'admin' || user.emailAddresses?.[0]?.emailAddress === 'rd92052@eanesisd.net') ? 'Yes' : 'No'
      ];
    });

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.map(field => `"${field}"`).join(','))
    ].join('\n');

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const filename = `swiftswap-users-${dateStr}.csv`;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });

  } catch (error) {
    console.error('Error generating CSV:', error);
    return NextResponse.json({ error: 'Failed to generate CSV' }, { status: 500 });
  }
}