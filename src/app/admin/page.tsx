'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { AdminProductForm } from './add-product-form';

export default function AdminPage() {
  const router = useRouter();
  const { isAdmin, isUserLoading } = useAuth();

  useEffect(() => {
    if (!isUserLoading && !isAdmin) {
      router.push('/login');
    }
  }, [isAdmin, isUserLoading, router]);

  if (isUserLoading) {
    return (
        <div className="container mx-auto flex items-center justify-center min-h-[calc(100vh-8rem)]">
            <p>Loading...</p>
        </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 font-headline">Admin Panel</h1>
      <AdminProductForm />
    </div>
  );
}
