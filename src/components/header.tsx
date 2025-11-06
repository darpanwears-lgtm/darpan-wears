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
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg font-headline">
            <Image src="https://i.postimg.cc/3wJPYWH2/20251106-223219.png" alt="Darpan Wears Logo" width={32} height={32} className="rounded-full" />
            Darpan Wears
          </Link>
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="flex items-center">
              <Link href="https://www.instagram.com/darpan_wears?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="sm">
                  <Instagram className="h-5 w-5" />
                  <span className="sr-only">Instagram</span>
                </Button>
              </Link>
              <Link href="https://www.facebook.com/people/Darpan-Wears/61582792832110/?ref=fb_bidir_ig_profile_ac" target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="sm">
                  <FacebookIcon className="h-5 w-5" />
                  <span className="sr-only">Facebook</span>
                </Button>
              </Link>
              <Link href="https://wa.me/9332307996" target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="sm">
                  <WhatsAppIcon className="h-5 w-5" />
                  <span className="sr-only">WhatsApp</span>
                </Button>
              </Link>
              <Link href={isAuthenticated ? '/account' : '/login'}>
                <Button variant="ghost" size="sm">
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
