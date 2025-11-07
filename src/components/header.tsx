'use client';

import Link from 'next/link';
import { User, Instagram, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FacebookIcon } from './icons/facebook';
import { WhatsAppIcon } from './icons/whatsapp';
import Image from 'next/image';
import { useUser } from '@/firebase';
import { useFirestore, useMemoFirebase } from '@/firebase/provider';
import { useDoc } from '@/firebase/firestore/use-doc';
import type { UserProfile } from '@/lib/types';
import { doc } from 'firebase/firestore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AccountDialog } from './account-dialog';
import { useState } from 'react';
import { LoginDialog } from './login-dialog';
import { generateColorFromString } from '@/lib/utils';
import { AdminLoginDialog } from './admin-login-dialog';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';


export function Header() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { isAdmin } = useAuth();
  const [isAccountDialogOpen, setIsAccountDialogOpen] = useState(false);
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const [isAdminLoginDialogOpen, setIsAdminLoginDialogOpen] = useState(false);
  const router = useRouter();

  const userProfileRef = useMemoFirebase(
    () => (user && firestore ? doc(firestore, 'users', user.uid) : null),
    [user, firestore]
  );
  const { data: userProfile } = useDoc<UserProfile>(userProfileRef);
  
  const getInitials = (name: string | undefined | null) => {
    if (!name) return '';
    const names = name.split(' ');
    return names
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const handleAccountClick = () => {
    if (user) {
      setIsAccountDialogOpen(true);
    } else {
      setIsLoginDialogOpen(true);
    }
  };

  const handleAdminClick = () => {
    if (isAdmin) {
      router.push('/admin');
    } else {
      setIsAdminLoginDialogOpen(true);
    }
  };

  const userInitial = getInitials(userProfile?.name);
  const avatarColor = userProfile?.name ? generateColorFromString(userProfile.name) : undefined;


  return (
    <>
      <header className="w-full border-b bg-background">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          {userProfile && userProfile.name ? (
              <Link href="/" className="flex items-center gap-2 font-bold text-lg font-headline">
                  <Avatar className="h-8 w-8">
                      <AvatarImage src={userProfile.photoURL ?? undefined} alt={userProfile.name} />
                      <AvatarFallback style={{ backgroundColor: avatarColor, color: 'white' }}>{userInitial}</AvatarFallback>
                  </Avatar>
                  <span>{userProfile.name}</span>
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
              <Button variant="ghost" size="sm" onClick={handleAccountClick}>
                {userProfile ? (
                   <Avatar className="h-8 w-8">
                      <AvatarImage src={userProfile.photoURL ?? undefined} alt={userProfile.name} />
                      <AvatarFallback style={{ backgroundColor: avatarColor, color: 'white' }}>{userInitial}</AvatarFallback>
                  </Avatar>
                ) : (
                  <User className="h-5 w-5" />
                )}
                <span className="sr-only">Account</span>
              </Button>
              
              <Button variant="ghost" size="sm" onClick={handleAdminClick}>
                <KeyRound className="h-5 w-5" />
                <span className="sr-only">Admin</span>
              </Button>
            </div>
          </div>
        </div>
      </header>
      {user && <AccountDialog open={isAccountDialogOpen} onOpenChange={setIsAccountDialogOpen} />}
      {!user && <LoginDialog open={isLoginDialogOpen} onOpenChange={setIsLoginDialogOpen} />}
      
      {!isAdmin && (
        <AdminLoginDialog 
          open={isAdminLoginDialogOpen} 
          onOpenChange={setIsAdminLoginDialogOpen} 
          onLoginSuccess={() => {
            setIsAdminLoginDialogOpen(false);
            router.push('/admin');
          }} 
        />
      )}
    </>
  );
}
