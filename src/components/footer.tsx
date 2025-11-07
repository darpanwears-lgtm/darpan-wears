
'use client';

import { useUserContext } from '@/lib/user-context';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from 'lucide-react';
import { HowToOrderDialog } from './how-to-order-dialog';
import Image from 'next/image';

export function Footer() {
  const { instagramUser: featuredUser } = useUserContext();

  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto flex h-20 items-center justify-between px-4 flex-wrap gap-4">
        <div className="flex-shrink-0">
           <HowToOrderDialog />
        </div>

        {featuredUser && (
          <div className="flex items-center gap-3">
              <p className="text-sm text-muted-foreground">Personalized for:</p>
              <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                      <AvatarImage src={`https://www.instagram.com/${featuredUser.replace('@','')}/?__a=1&__d=dis`} style={{ display: 'none' }} />
                      <AvatarFallback>
                          <User className="h-4 w-4" />
                      </AvatarFallback>
                  </Avatar>
                  <span className="font-semibold text-sm">{featuredUser}</span>
              </div>
               <Image src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR5UFub5fjlTyQcL5KCD389Obnh6L-LDoBiWA&s" alt="Personalized Logo" width={32} height={32} className="rounded-full" />
          </div>
        )}
      </div>
    </footer>
  );
}
