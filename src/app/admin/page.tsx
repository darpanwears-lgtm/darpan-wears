
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { ProductForm } from './product-form';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { useUser, useFirestore } from '@/firebase';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProductList } from './product-list';
import { OrderList } from './order-list';
import { useToast } from '@/hooks/use-toast';

export default function AdminPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { isAdmin, isAuthLoading, logout } = useAuth();
  const { isUserLoading: isFirebaseUserLoading } = useUser();
  const firestore = useFirestore(); // Get firestore instance

  useEffect(() => {
    // Wait until all loading is complete before checking auth status
    if (isAuthLoading || isFirebaseUserLoading) return;
    
    // If auth is not loading and user is not an admin, redirect.
    if (!isAdmin) {
      toast({
        title: 'Access Denied',
        description: 'You must be an admin to view this page.',
        variant: 'destructive',
      });
      router.push('/');
    }
  }, [isAdmin, isAuthLoading, isFirebaseUserLoading, router, toast]);

  // Render loading state if any of the dependencies are not ready
  if (isAuthLoading || isFirebaseUserLoading || !isAdmin || !firestore) {
    return (
        <div className="container mx-auto flex items-center justify-center min-h-[calc(100vh-8rem)]">
            <p>Verifying admin access...</p>
        </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold font-headline">Admin Panel</h1>
        <Button variant="ghost" onClick={logout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
        </Button>
      </div>
      
       <Tabs defaultValue="manage-orders">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="manage-orders">Manage Orders</TabsTrigger>
          <TabsTrigger value="manage-products">Manage Products</TabsTrigger>
          <TabsTrigger value="add-product">Add Product</TabsTrigger>
        </TabsList>
        <TabsContent value="manage-orders" className="mt-6">
            <OrderList />
        </TabsContent>
        <TabsContent value="manage-products" className="mt-6">
            <ProductList />
        </TabsContent>
        <TabsContent value="add-product" className="mt-6">
          <ProductForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}
