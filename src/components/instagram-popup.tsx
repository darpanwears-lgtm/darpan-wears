
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Instagram } from 'lucide-react';
import Link from 'next/link';

interface InstagramPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFollow: () => void;
}

export function InstagramPopup({ open, onOpenChange, onFollow }: InstagramPopupProps) {
  const [username, setUsername] = useState('');

  const handleFollowClick = () => {
    // Here you could save the username to your database if needed
    console.log('Instagram username:', username);
    onFollow();
    // Redirect to Instagram page
    window.open('https://www.instagram.com/darpan_wears?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==', '_blank');
  };

  const handleSkip = () => {
    onFollow(); // This will set localStorage and close the popup
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Instagram className="text-pink-500" />
            Follow us on Instagram!
          </DialogTitle>
          <DialogDescription>
            Enter your Instagram username and follow us for the latest updates and offers.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="instagram-username">Instagram Username</Label>
            <Input
              id="instagram-username"
              placeholder="@username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter className="sm:justify-between flex-col sm:flex-row-reverse gap-2">
           <Button type="button" onClick={handleFollowClick} style={{ backgroundColor: 'orange', color: 'black', border: '2px solid black' }}>
            Follow & Continue
          </Button>
          <Button type="button" variant="secondary" onClick={handleSkip}>
            Skip for now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
