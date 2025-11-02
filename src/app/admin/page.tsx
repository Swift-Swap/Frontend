"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Shield, Users, Database, TrendingUp, DollarSign, Download, Trash2, RefreshCw, Archive } from "lucide-react";

interface AdminStats {
  totalUsers: number;
  activeListings: number;
  totalListings: number;
  totalViews: number;
  totalRevenue: number;
  soldListings: number;
  recentActivity: number;
  systemStatus: string;
}

interface ActivityItem {
  id: string;
  type: string;
  message: string;
  timeAgo: string;
  price: number;
  lot: string;
  spotNumber: number;
}

export default function AdminPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded && !user) {
      router.push("/sign-in");
      return;
    }
    
    if (isLoaded && user) {
      fetchAdminData();
    }
  }, [user, isLoaded, router]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      
      const minLoadingTime = new Promise(resolve => setTimeout(resolve, 1000));
      
      const [statsRes, activityRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/activity')
      ]);

      if (statsRes.status === 403 || activityRes.status === 403) {
        router.push("/perm-denied");
        return;
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      if (activityRes.ok) {
        const activityData = await activityRes.json();
        setActivities(activityData);
      }

      await minLoadingTime;
    } catch (error) {
      console.error('Error fetching admin data:', error);
      router.push("/perm-denied");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCSV = async () => {
    try {
      console.log('📥 Exporting users to CSV...');
      const response = await fetch('/api/admin/export');
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `swiftswap-users-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        console.log('✅ CSV downloaded successfully');
      } else {
        console.error('❌ Export failed:', response.status);
        alert('Failed to export CSV');
      }
    } catch (error) {
      console.error('❌ Error downloading CSV:', error);
      alert('Failed to download CSV');
    }
  };

  const handleDatabaseCleanup = async () => {
    if (!confirm('🧹 Clean up orphaned Upstash keys and fix data inconsistencies?\n\nThis is safe and recommended to run periodically.')) {
      return;
    }
    
    try {
      console.log('🧹 Running database cleanup...');
      const response = await fetch('/api/admin/database/cleanup', {
        method: 'POST'
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Cleanup result:', result);
        alert(result.message);
        fetchAdminData(); // Refresh stats
      } else {
        alert('Cleanup failed');
      }
    } catch (error) {
      console.error('Error during cleanup:', error);
      alert('Cleanup failed. Please try again.');
    }
  };

  const handleDatabaseBackup = async () => {
    try {
      console.log('💾 Backing up Upstash listings...');
      const response = await fetch('/api/admin/database/backup', {
        method: 'POST'
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `swiftswap-listings-backup-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        console.log('✅ Backup downloaded successfully');
      } else {
        alert('Backup failed');
      }
    } catch (error) {
      console.error('Error during backup:', error);
      alert('Backup failed. Please try again.');
    }
  };

  const handleDatabaseReset = async () => {
    if (!confirm('⚠️ WARNING: DELETE ALL PARKING SPOT LISTINGS?\n\nThis will permanently delete:\n- All listings from Upstash\n- All user listing data\n- All purchase records\n\nThis CANNOT be undone!\n\nType YES in the next dialog to confirm.')) {
      return;
    }

    const confirmation = prompt('Type "DELETE ALL DATA" to confirm:');
    if (confirmation !== 'DELETE ALL DATA') {
      alert('Reset cancelled. No data was deleted.');
      return;
    }
    
    try {
      console.log('⚠️ Resetting Upstash database...');
      const response = await fetch('/api/admin/database/reset', {
        method: 'POST'
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Reset complete:', result);
        alert(result.message);
        fetchAdminData(); // Refresh stats
      } else {
        alert('Reset failed');
      }
    } catch (error) {
      console.error('Error during reset:', error);
      alert('Reset failed. Please try again.');
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Welcome, {user.firstName || "Admin"}</p>
        </div>
        <Button onClick={fetchAdminData} variant="outline" className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Refresh Data
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16 mb-2" />
            ) : (
              <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
            )}
            <p className="text-xs text-muted-foreground">Registered users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16 mb-2" />
            ) : (
              <div className="text-2xl font-bold">{stats?.activeListings || 0}</div>
            )}
            <p className="text-xs text-muted-foreground">Currently available</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-20 mb-2" />
            ) : (
              <div className="text-2xl font-bold">${stats?.totalRevenue || 0}</div>
            )}
            <p className="text-xs text-muted-foreground">From all sales</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16 mb-2" />
            ) : (
              <div className="text-2xl font-bold text-green-600">{stats?.systemStatus || "Online"}</div>
            )}
            <p className="text-xs text-muted-foreground">All systems operational</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button onClick={handleDownloadCSV} className="w-full flex items-center gap-2">
              <Download className="h-4 w-4" />
              Download CSV
            </Button>
            <Link href="/admin/users">
              <Button variant="outline" className="w-full flex items-center gap-2">
                <Users className="h-4 w-4" />
                User Management
              </Button>
            </Link>
            <Button 
              onClick={handleDatabaseCleanup} 
              variant="outline" 
              className="w-full flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Cleanup Database
            </Button>
            <Button 
              onClick={handleDatabaseBackup} 
              variant="outline" 
              className="w-full flex items-center gap-2"
            >
              <Archive className="h-4 w-4" />
              Backup Listings
            </Button>
            <Button 
              onClick={handleDatabaseReset} 
              variant="destructive" 
              className="w-full flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Reset Database
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest system events and transactions</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <Skeleton className="w-2 h-2 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-48 mb-1" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {activities.length > 0 ? (
                  activities.map((activity) => (
                    <div key={activity.id} className="flex items-center space-x-4">
                      <div className={`w-2 h-2 rounded-full ${
                        activity.type === 'sale' ? 'bg-green-500' : 
                        activity.type === 'listing' ? 'bg-blue-500' : 'bg-gray-500'
                      }`} />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.message}</p>
                        <p className="text-xs text-muted-foreground">{activity.timeAgo}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No recent activity</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          This admin panel is restricted to authorized personnel only. 
          All actions are logged and monitored.
        </AlertDescription>
      </Alert>
    </div>
  );
}