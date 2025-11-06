'use client';

import Link from 'next/link';
import { ShoppingBag, User, Shirt, Instagram } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import { useCart } from '@/lib/cart-context';
import { CartSheet } from './cart-sheet';
import { useState } from 'react';
import { FacebookIcon } from './icons/facebook';
import { WhatsAppIcon } from './icons/whatsapp';

export function Header() {
  const { isAuthenticated } = useAuth();
  const { getCartItemCount } = useCart();
  const [isCartOpen, setCartOpen] = useState(false);
  const itemCount = getCartItemCount();

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b bg-background">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg font-headline">
            <Shirt className="h-6 w-6 text-primary" />
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
              <Button variant="ghost" size="icon" className="relative" onClick={() => setCartOpen(true)}>
                <ShoppingBag className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-accent-foreground text-xs font-bold">
                    {itemCount}
                  </span>
                )}
                <span className="sr-only">Shopping Cart</span>
              </Button>
            </div>
          </div>
        </div>
      </header>
      <CartSheet open={isCartOpen} onOpenChange={setCartOpen} />
    </>
  );
}
