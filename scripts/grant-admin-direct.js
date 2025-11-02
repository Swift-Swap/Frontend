const { clerkClient } = require('@clerk/nextjs/server');

async function grantAdminRights() {
  try {
    // Find the user by email
    const users = await clerkClient.users.getUserList({ limit: 100 });
    const targetUser = users.find(user => 
      user.emailAddresses?.[0]?.emailAddress === 'rd92052@eanesisd.net'
    );

    if (!targetUser) {
      console.error('User with email rd92052@eanesisd.net not found.');
      return;
    }

    console.log('Found user:', targetUser.id);

    // Grant admin rights by updating metadata
    await clerkClient.users.updateUserMetadata(targetUser.id, {
      publicMetadata: {
        role: 'admin'
      }
    });

    console.log('✅ Admin rights granted to rd92052@eanesisd.net');
    console.log('You can now access the admin panel at http://localhost:3000/admin');
  } catch (error) {
    console.error('❌ Error granting admin rights:', error);
  }
}

grantAdminRights();


