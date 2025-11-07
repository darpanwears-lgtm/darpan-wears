
'use client';

import { useUserContext } from '@/lib/user-context';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from 'lucide-react';

export function Footer() {
  const { instagramUser: featuredUser } = useUserContext();

  if (!featuredUser) {
    return null;
  }

  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto flex h-16 items-center justify-center px-4">
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
        </div>
      </div>
    </footer>
  );
}
