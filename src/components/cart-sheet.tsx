'use client';

import Image from 'next/image';
import Link from 'next/link';
import { X, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetClose } from '@/components/ui/sheet';
import { useCart } from '@/lib/cart-context';
import { ScrollArea } from './ui/scroll-area';

interface CartSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CartSheet({ open, onOpenChange }: CartSheetProps) {
  const { state, removeItem, updateQuantity, getCartTotal, getCartItemCount } = useCart();
  const total = getCartTotal();
  const itemCount = getCartItemCount();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col pr-0 sm:max-w-lg">
        <SheetHeader className="px-6">
          <SheetTitle>Shopping Cart ({itemCount})</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto">
          {state.items.length > 0 ? (
            <ScrollArea className="h-full pr-6">
              <ul className="divide-y divide-border">
                {state.items.map((item) => (
                  <li key={item.id} className="flex py-6">
                    <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border">
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={96}
                        height={96}
                        className="h-full w-full object-cover object-center"
                        data-ai-hint={item.imageHint}
                      />
                    </div>
                    <div className="ml-4 flex flex-1 flex-col">
                      <div>
                        <div className="flex justify-between text-base font-medium">
                          <h3>
                            <Link href={`/products/${item.id}`}>{item.name}</Link>
                          </h3>
                          <p className="ml-4">${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      </div>
                      <div className="flex flex-1 items-end justify-between text-sm">
                        <div className="flex items-center gap-2">
                           <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                               <Minus className="h-4 w-4" />
                           </Button>
                           <p className="w-6 text-center">{item.quantity}</p>
                           <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                               <Plus className="h-4 w-4" />
                           </Button>
                        </div>
                        <div className="flex">
                          <Button variant="ghost" type="button" onClick={() => removeItem(item.id)}>
                            <X className="h-4 w-4 mr-1" /> Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          ) : (
            <div className="flex h-full flex-col items-center justify-center space-y-4 px-6">
              <p className="text-center text-muted-foreground">Your cart is empty.</p>
              <SheetClose asChild>
                <Button asChild variant="outline">
                    <Link href="/">Continue Shopping</Link>
                </Button>
              </SheetClose>
            </div>
          )}
        </div>
        {state.items.length > 0 && (
          <SheetFooter className="px-6 py-4 border-t">
            <div className="w-full space-y-4">
                <div className="flex justify-between text-base font-medium">
                <p>Subtotal</p>
                <p>${total.toFixed(2)}</p>
                </div>
                <p className="mt-0.5 text-sm text-muted-foreground">Shipping and taxes calculated at checkout.</p>
                <SheetClose asChild>
                    <Button asChild className="w-full" style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-foreground)' }}>
                        <Link href="/checkout">Checkout</Link>
                    </Button>
                </SheetClose>
            </div>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
