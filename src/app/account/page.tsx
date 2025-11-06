'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileTab } from './profile';
import { OrdersTab } from './orders';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AccountPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout, isUserLoading, makeAdmin } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!isUserLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isUserLoading, router]);

  if (isUserLoading || !user) {
    return (
      <div className="container mx-auto flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <p>Loading...</p>
      </div>
    );
  }
  
  const handleLogout = () => {
    logout();
    router.push('/');
  }

  const handleMakeAdmin = () => {
    makeAdmin();
    toast({
        title: "Admin Status Updated",
        description: "You are now an admin.",
    });
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold font-headline">My Account</h1>
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={handleMakeAdmin}>Make Admin</Button>
          <Button variant="ghost" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
      <Tabs defaultValue="orders" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
          <TabsTrigger value="orders">Order History</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>
        <TabsContent value="orders">
          <OrdersTab />
        </TabsContent>
        <TabsContent value="profile">
          <ProfileTab user={user} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
