
'use client';

import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from 'lucide-react';

export function Footer() {
  const [featuredUser, setFeaturedUser] = useState<string | null>(null);

  useEffect(() => {
    const user = localStorage.getItem('featuredInstagramUser');
    setFeaturedUser(user);
  }, []);

  if (!featuredUser) {
    return null;
  }

  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto flex h-16 items-center justify-center px-4">
        <div className="flex items-center gap-3">
            <p className="text-sm text-muted-foreground">Featured Visitor:</p>
            <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                    {/* A real implementation would fetch the IG profile picture, but that requires an API. We'll use a fallback. */}
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
