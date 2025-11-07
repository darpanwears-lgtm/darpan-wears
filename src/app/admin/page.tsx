'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { ProductForm } from './product-form';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { useUser } from '@/firebase';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProductList } from './product-list';

export default function AdminPage() {
  const router = useRouter();
  const { isAdmin, isAuthLoading, logout } = useAuth();
  const { user, isUserLoading: isFirebaseUserLoading } = useUser();

  useEffect(() => {
    if (isAuthLoading || isFirebaseUserLoading) return;
    
    // If auth is not loading and user is not an admin, redirect.
    if (!isAdmin) {
      router.push('/admin/login');
    }
  }, [isAdmin, isAuthLoading, isFirebaseUserLoading, router]);

  if (isAuthLoading || isFirebaseUserLoading || !isAdmin) {
    return (
        <div className="container mx-auto flex items-center justify-center min-h-[calc(100vh-8rem)]">
            <p>Loading...</p>
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
      
       <Tabs defaultValue="manage-products">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manage-products">Manage Products</TabsTrigger>
          <TabsTrigger value="add-product">Add Product</TabsTrigger>
        </TabsList>
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
