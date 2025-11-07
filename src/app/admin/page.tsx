'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { AdminProductForm } from './add-product-form';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { useUser } from '@/firebase';

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
      <AdminProductForm />
    </div>
  );
}
