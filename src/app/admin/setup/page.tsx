'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle } from 'lucide-react';

export default function AdminSetup() {
  const { user, isLoaded } = useUser();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const setupAdmin = async () => {
    try {
      setLoading(true);
      setMessage('');
      
      const response = await fetch('/api/admin/setup-admin', {
        method: 'POST',
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessage(data.message);
        setIsSuccess(true);
      } else {
        setMessage(data.error);
        setIsSuccess(false);
      }
    } catch (error) {
      setMessage('Failed to setup admin');
      setIsSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>Please sign in to access this page.</div>;
  }

  const userEmail = user.emailAddresses?.[0]?.emailAddress;
  const isAuthorized = userEmail === 'rd92052@eanesisd.net';

  if (!isAuthorized) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              This setup page is only available for rd92052@eanesisd.net
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Admin Setup</CardTitle>
          <CardDescription>
            Grant admin rights to your account ({userEmail})
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {message && (
            <Alert className={isSuccess ? 'border-green-500' : 'border-red-500'}>
              {isSuccess ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-500" />
              )}
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}
          
          <Button 
            onClick={setupAdmin} 
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Setting up...' : 'Grant Admin Rights'}
          </Button>
          
          <p className="text-sm text-gray-600">
            This will grant you admin access to the Swift-Swap admin panel.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}


