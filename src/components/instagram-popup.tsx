
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

interface InstagramPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFollow: () => void;
}

export function InstagramPopup({ open, onOpenChange, onFollow }: InstagramPopupProps) {
  const [username, setUsername] = useState('');

  const handleFeatureClick = () => {
    if (username) {
        localStorage.setItem('featuredInstagramUser', username);
    }
    onFollow(); // This will set the cookie and close the popup
    if (typeof window !== 'undefined') {
        window.location.reload(); // Reload to show the footer
    }
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
            Get Featured!
          </DialogTitle>
          <DialogDescription>
            Enter your Instagram username to be featured on our site footer.
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
           <Button type="button" onClick={handleFeatureClick} style={{ backgroundColor: 'orange', color: 'black', border: '2px solid black' }}>
            Feature Me
          </Button>
          <Button type="button" variant="secondary" onClick={handleSkip}>
            Skip for now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
