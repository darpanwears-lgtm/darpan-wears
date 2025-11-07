
'use client';

import Link from 'next/link';
import { Instagram, KeyRound, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FacebookIcon } from './icons/facebook';
import { WhatsAppIcon } from './icons/whatsapp';
import Image from 'next/image';
import { useUserContext } from '@/lib/user-context';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';


export function Header() {
  const { instagramUser } = useUserContext();

  return (
    <>
      <header className="w-full border-b bg-background">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
            {instagramUser ? (
                 <Link href="/" className="flex items-center gap-2 font-bold text-lg font-headline">
                    <Avatar className="h-8 w-8">
                         <AvatarImage src={`https://www.instagram.com/${instagramUser.replace('@','')}/?__a=1&__d=dis`} style={{ display: 'none' }} />
                         <AvatarFallback>
                             <User className="h-4 w-4" />
                         </AvatarFallback>
                    </Avatar>
                    {instagramUser}
                 </Link>
            ) : (
                <Link href="/" className="flex items-center gap-2 font-bold text-lg font-headline">
                    <Image src="https://i.postimg.cc/3wJPYWH2/20251106-223219.png" alt="Darpan Wears Logo" width={32} height={32} className="rounded-full" />
                    Darpan Wears
                </Link>
            )}

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
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
