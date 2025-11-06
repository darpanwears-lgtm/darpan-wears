'use client';

import Link from 'next/link';
import { User, Instagram } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import { FacebookIcon } from './icons/facebook';
import { WhatsAppIcon } from './icons/whatsapp';
import Image from 'next/image';

export function Header() {
  const { isAuthenticated } = useAuth();

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b bg-background">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg font-headline">
            <Image src="https://i.postimg.cc/3wJPYWH2/20251106-223219.png" alt="Darpan Wears Logo" width={40} height={40} className="rounded-full" />
            Darpan Wears
          </Link>
          <div className="flex items-center gap-2 sm:gap-4">
            <nav className="hidden sm:flex items-center gap-4 text-sm font-medium">
              <Link href="/" className="text-muted-foreground transition-colors hover:text-foreground">
                Home
              </Link>
              <Link href="/#all-products" className="text-muted-foreground transition-colors hover:text-foreground">
                Products
              </Link>
            </nav>
            <div className="flex items-center gap-2">
              <Link href="https://www.instagram.com/darpan_wears?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="icon">
                  <Instagram className="h-5 w-5" />
                  <span className="sr-only">Instagram</span>
                </Button>
              </Link>
              <Link href="https://www.facebook.com/people/Darpan-Wears/61582792832110/?ref=fb_bidir_ig_profile_ac" target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="icon">
                  <FacebookIcon className="h-5 w-5" />
                  <span className="sr-only">Facebook</span>
                </Button>
              </Link>
              <Link href="https://wa.me/9332307996" target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="icon">
                  <WhatsAppIcon className="h-5 w-5" />
                  <span className="sr-only">WhatsApp</span>
                </Button>
              </Link>
              <Link href={isAuthenticated ? '/account' : '/login'}>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                  <span className="sr-only">Account</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
