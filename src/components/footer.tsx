'use client';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';


export function Footer() {
  const currentYear = new Date().getFullYear();
  const { isAdmin } = useAuth();
  return (
    <footer className="border-t bg-secondary">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {currentYear} Darpan Wears. All rights reserved.
          </p>
          <nav className="flex gap-4">
            {isAdmin && (
              <Link href="/admin" className="text-sm text-muted-foreground hover:text-foreground">
                Admin
              </Link>
            )}
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
              Terms of Service
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
              Privacy Policy
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
