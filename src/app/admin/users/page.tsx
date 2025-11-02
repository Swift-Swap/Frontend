"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Shield, Users, Search, UserPlus, UserMinus, ArrowLeft, Download, 
  Trash2, Ban, DollarSign, ShoppingCart, Package, Eye,
  TrendingUp, Calendar, Loader2
} from "lucide-react";
import Link from "next/link";

const ADMIN_EMAIL = "rd92052@eanesisd.net";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isAdmin: boolean;
  createdAt: string;
  lastActive: string;
}

interface UserStats {
  userId: string;
  totalListings: number;
  activeListings: number;
  soldListings: number;
  totalRevenue: number;
  totalPurchases: number;
  totalSpent: number;
  totalViews: number;
  avgPrice: number;
  mostPopularLot: string;
  joinDate: string;
  lastActive: string;
}

export default function UserManagementPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [filterRole, setFilterRole] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("createdAt");

  useEffect(() => {
    if (isLoaded && !user) {
      router.push("/sign-in");
      return;
    }
    
    if (isLoaded && user) {
      fetchUsers();
    }
  }, [user, isLoaded, router]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching users from API...');
      
      const response = await fetch('/api/admin/users');
      console.log('📡 API Response status:', response.status);
      
      if (response.status === 403) {
        console.error('❌ Access forbidden');
        router.push("/perm-denied");
        return;
      }
      
      if (response.ok) {
        const usersData = await response.json();
        console.log('✅ Users fetched:', usersData.length, 'users');
        console.log('👥 Users data:', usersData);
        setUsers(usersData);
      } else {
        console.error('❌ Failed to fetch users:', response.statusText);
        const errorData = await response.json().catch(() => ({}));
        console.error('Error details:', errorData);
      }
    } catch (error) {
      console.error('❌ Error fetching users:', error);
      alert('Failed to load users. Check console for details.');
    } finally {
      setLoading(false);
      console.log('✅ Loading complete');
    }
  };

  const fetchUserStats = async (userId: string) => {
    try {
      setStatsLoading(true);
      const response = await fetch(`/api/admin/users/stats?userId=${userId}`);
      
      if (response.ok) {
        const stats = await response.json();
        setUserStats(stats);
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  const toggleAdminRights = async (userId: string, currentStatus: boolean) => {
    if (!confirm(`${currentStatus ? 'Revoke' : 'Grant'} admin rights?`)) return;

    try {
      const response = await fetch('/api/admin/users/toggle-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, isAdmin: !currentStatus })
      });

      if (response.ok) {
        const result = await response.json();
        alert(result.message);
        fetchUsers();
      } else {
        alert('Failed to update admin rights');
      }
    } catch (error) {
      console.error('Error updating admin rights:', error);
      alert('Failed to update admin rights');
    }
  };

  const addAdminByEmail = async () => {
    if (!newAdminEmail.trim()) {
      alert('Please enter an email address');
      return;
    }

    try {
      const response = await fetch('/api/admin/users/add-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newAdminEmail.trim() })
      });

      if (response.ok) {
        const result = await response.json();
        alert(result.message);
        setNewAdminEmail("");
        fetchUsers();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to add admin');
      }
    } catch (error) {
      console.error('Error adding admin:', error);
      alert('Failed to add admin');
    }
  };

  const deleteUser = async (userId: string, userName: string) => {
    if (!confirm(`⚠️ Are you sure you want to DELETE ${userName}?\n\nThis will permanently delete:\n- User account\n- All their listings\n- All their data\n\nThis action CANNOT be undone!`)) {
      return;
    }

    try {
      const response = await fetch('/api/admin/users/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });

      if (response.ok) {
        const result = await response.json();
        alert(`✅ ${result.message}`);
        setSelectedUser(null);
        fetchUsers();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
    }
  };

  const suspendUser = async (userId: string, userName: string, suspend: boolean) => {
    if (!confirm(`${suspend ? 'Suspend' : 'Unsuspend'} ${userName}?`)) return;

    try {
      const response = await fetch('/api/admin/users/suspend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, suspend })
      });

      if (response.ok) {
        const result = await response.json();
        alert(result.message);
        fetchUsers();
      } else {
        alert('Failed to suspend user');
      }
    } catch (error) {
      console.error('Error suspending user:', error);
      alert('Failed to suspend user');
    }
  };

  const exportUsers = async () => {
    try {
      console.log('📥 Exporting users to CSV...');
      const response = await fetch('/api/admin/users/export?format=csv');
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        console.log('✅ CSV downloaded successfully');
      } else {
        console.error('❌ Export failed:', response.status);
        alert('Failed to export users');
      }
    } catch (error) {
      console.error('❌ Error exporting users:', error);
      alert('Failed to export users');
    }
  };

  const openUserDetails = (user: User) => {
    setSelectedUser(user);
    fetchUserStats(user.id);
  };

  // Filtering and sorting
  const filteredUsers = users
    .filter(user => {
      const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = filterRole === 'all' || 
        (filterRole === 'admin' && user.isAdmin) ||
        (filterRole === 'user' && !user.isAdmin);
      
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      if (sortBy === 'createdAt') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortBy === 'name') {
        return a.firstName.localeCompare(b.firstName);
      } else if (sortBy === 'email') {
        return a.email.localeCompare(b.email);
      }
      return 0;
    });

  if (!isLoaded || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-gray-600" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const userEmail = user.primaryEmailAddress?.emailAddress;
  const userRole = user.publicMetadata?.role;
  const isAdmin = userRole === 'admin' || userEmail === ADMIN_EMAIL;

  if (!isAdmin) {
    router.push("/perm-denied");
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
              <p className="text-gray-600">Manage user accounts, roles, and permissions</p>
            </div>
          </div>
          
          {/* Export button */}
          <Button onClick={exportUsers} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users?.length || 0}</div>
              <p className="text-xs text-gray-500 mt-1">Registered users</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Admin Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users?.filter(u => u.isAdmin).length || 0}</div>
              <p className="text-xs text-gray-500 mt-1">With admin rights</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Regular Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users?.filter(u => !u.isAdmin).length || 0}</div>
              <p className="text-xs text-gray-500 mt-1">Standard accounts</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Filtered</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredUsers?.length || 0}</div>
              <p className="text-xs text-gray-500 mt-1">Currently showing</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Label htmlFor="search">Search Users</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="search"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="filter">Filter by Role</Label>
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="admin">Admins Only</SelectItem>
                <SelectItem value="user">Users Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="sort">Sort By</Label>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">Newest First</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="email">Email</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <Label htmlFor="newAdmin">Add Admin by Email</Label>
              <Input
                id="newAdmin"
                placeholder="Email address"
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
                className="w-full"
              />
            </div>
            <Button onClick={addAdminByEmail} className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Add
            </Button>
          </div>
        </div>
      </div>

      {/* User List */}
      <div className="space-y-3">
        {filteredUsers.map((userItem) => {
          const initials = `${userItem.firstName?.[0] || ''}${userItem.lastName?.[0] || ''}`.toUpperCase() || '?';
          return (
            <Card key={userItem.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center space-x-4 flex-1 min-w-0">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-lg truncate">
                        {userItem.firstName} {userItem.lastName}
                      </h3>
                      <p className="text-sm text-gray-600 truncate">{userItem.email}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <Calendar className="h-3 w-3" />
                        Joined: {new Date(userItem.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                      userItem.isAdmin 
                        ? 'bg-green-100 text-green-800 border border-green-200' 
                        : 'bg-gray-100 text-gray-800 border border-gray-200'
                    }`}>
                      {userItem.isAdmin ? '👑 Admin' : '👤 User'}
                    </span>
                    
                    <Button
                      onClick={() => openUserDetails(userItem)}
                      variant="outline"
                      size="sm"
                      className="whitespace-nowrap"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Details
                    </Button>
                    
                    <Button
                      onClick={() => toggleAdminRights(userItem.id, userItem.isAdmin)}
                      variant={userItem.isAdmin ? "destructive" : "default"}
                      size="sm"
                      className="whitespace-nowrap"
                    >
                      {userItem.isAdmin ? (
                        <><UserMinus className="h-4 w-4 mr-2" />Revoke</>
                      ) : (
                        <><UserPlus className="h-4 w-4 mr-2" />Grant</>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredUsers.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No users found</h3>
              <p className="text-gray-600">
                {searchTerm ? "Try adjusting your search terms" : "No users match the current filters"}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* User Details Modal */}
      <Dialog open={selectedUser !== null} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              User Details: {selectedUser?.firstName} {selectedUser?.lastName}
            </DialogTitle>
            <DialogDescription>
              Comprehensive information and statistics for this user
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-6">
              {/* User Info */}
              <div>
                <h4 className="font-semibold mb-3 text-gray-900">Account Information</h4>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium">{selectedUser.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Role:</span>
                    <span className={`font-medium ${selectedUser.isAdmin ? 'text-green-600' : 'text-gray-900'}`}>
                      {selectedUser.isAdmin ? 'Administrator' : 'User'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Joined:</span>
                    <span className="font-medium">{new Date(selectedUser.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">User ID:</span>
                    <span className="font-mono text-xs">{selectedUser.id}</span>
                  </div>
                </div>
              </div>

              {/* User Statistics */}
              {statsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-12 w-12 animate-spin text-gray-600" />
                </div>
              ) : userStats ? (
                <div>
                  <h4 className="font-semibold mb-3 text-gray-900">Activity Statistics</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                          <Package className="h-4 w-4" />
                          Total Listings
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{userStats.totalListings}</div>
                        <p className="text-xs text-gray-500 mt-1">
                          {userStats.activeListings} active, {userStats.soldListings} sold
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          Total Revenue
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                          ${userStats.totalRevenue.toFixed(2)}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          From {userStats.soldListings} sales
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                          <ShoppingCart className="h-4 w-4" />
                          Purchases
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{userStats.totalPurchases}</div>
                        <p className="text-xs text-gray-500 mt-1">
                          ${userStats.totalSpent.toFixed(2)} spent
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                          <TrendingUp className="h-4 w-4" />
                          Total Views
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{userStats.totalViews}</div>
                        <p className="text-xs text-gray-500 mt-1">
                          {userStats.mostPopularLot && `Top: ${userStats.mostPopularLot}`}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ) : null}

              {/* Actions */}
              <div>
                <h4 className="font-semibold mb-3 text-gray-900">Actions</h4>
                <div className="flex gap-2 flex-wrap">
                  <Button
                    onClick={() => suspendUser(selectedUser.id, `${selectedUser.firstName} ${selectedUser.lastName}`, true)}
                    variant="outline"
                    size="sm"
                  >
                    <Ban className="h-4 w-4 mr-2" />
                    Suspend User
                  </Button>
                  
                  <Button
                    onClick={() => deleteUser(selectedUser.id, `${selectedUser.firstName} ${selectedUser.lastName}`)}
                    variant="destructive"
                    size="sm"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete User
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Alert className="mt-6">
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Admin rights allow users to access the admin dashboard and manage the platform. 
          Be careful when granting or removing admin privileges. Deleting users is permanent!
        </AlertDescription>
      </Alert>
    </div>
  );
}
