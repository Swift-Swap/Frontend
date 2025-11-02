const { clerkClient } = require('@clerk/nextjs');

async function grantAdminRights() {
  try {
    // Get all users
    const users = await clerkClient.users.getUserList({ limit: 100 });
    
    // Find the user with email rd92052@eanesisd.net
    const targetUser = users.find(user => 
      user.primaryEmailAddress?.emailAddress === 'rd92052@eanesisd.net'
    );
    
    if (!targetUser) {
      console.log('User rd92052@eanesisd.net not found in Clerk database');
      return;
    }
    
    console.log('Found user:', targetUser.id, targetUser.primaryEmailAddress?.emailAddress);
    
    // Grant admin rights by updating metadata
    await clerkClient.users.updateUserMetadata(targetUser.id, {
      publicMetadata: {
        role: 'admin'
      }
    });
    
    console.log('Admin rights granted successfully to rd92052@eanesisd.net');
    
  } catch (error) {
    console.error('Error granting admin rights:', error);
  }
}

grantAdminRights();


