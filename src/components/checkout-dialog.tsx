
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useState } from 'react';
import { addDoc, collection } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import type { Product } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import Image from 'next/image';
import { ScrollArea } from './ui/scroll-area';
import { useRouter } from 'next/navigation';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  address: z.string().min(5, { message: 'Address is too short.' }),
  phone: z.string().min(10, { message: 'Please enter a valid phone number.' }),
  paymentMethod: z.enum(['COD', 'Online'], {
    required_error: 'You need to select a payment method.',
  }),
});

interface CheckoutDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    product: Product;
    selectedSize?: string;
}

export function CheckoutDialog({ open, onOpenChange, product, selectedSize }: CheckoutDialogProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const firestore = useFirestore();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '', address: '', phone: '', paymentMethod: 'COD' },
  });


  if (!product) {
    return null;
  }
  
  const total = product.price;
  const primaryImageUrl = product.imageUrls && product.imageUrls.length > 0 ? product.imageUrls[0] : '/placeholder.png';

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    if (!firestore) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not connect to the database. Please try again.',
      });
      setIsSubmitting(false);
      return;
    }

    try {
        const orderData = {
          items: [{
            id: product.id,
            productId: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
            imageUrl: primaryImageUrl,
            size: selectedSize || 'N/A'
          }],
          totalAmount: total,
          status: 'Processing' as const,
          orderDate: new Date().toISOString(),
          shippingAddress: {
            name: values.name,
            address: values.address,
            phone: values.phone,
          },
          orderStatus: 'Processing',
        };
        
        const guestOrdersCollection = collection(firestore, 'guestOrders');
        const docRef = await addDoc(guestOrdersCollection, orderData);
        
        const emailMessageBody = `
New Order Received!

Order ID: ${docRef.id}
Customer: ${values.name}

Shipping Address:
${values.address}
${values.phone}

Payment Method: ${values.paymentMethod}

Item:
- ${product.name}
- Size: ${selectedSize || 'N/A'}
- Price: ₹${total.toFixed(2)}

Total: ₹${total.toFixed(2)}
        `.trim().replace(/^\s+/gm, '');

        const emailAddress = 'darpanwears@gmail.com';
        const emailSubject = `New Order Confirmation: ${docRef.id}`;
        const emailUrl = `mailto:${emailAddress}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailMessageBody)}`;
        
        toast({
            title: "Order Placed!",
            description: "Please confirm your order via email.",
        });
        
        if (typeof window !== 'undefined') {
            window.location.href = emailUrl;
        }

        onOpenChange(false);
        setTimeout(() => {
            router.push(`/order/${docRef.id}`);
        }, 500);

    } catch (error) {
        console.error("Error placing order:", error);
        toast({
            variant: 'destructive',
            title: 'Order Failed',
            description: 'Could not save your order. Please check your details and try again.',
        });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0">
          <ScrollArea className="max-h-[85vh]">
            <div className="p-6">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-center mb-4 font-headline">Checkout</DialogTitle>
                </DialogHeader>
                <div className="grid md:grid-cols-2 gap-8 items-start">
                    <div>
                        <h2 className="text-xl font-semibold mb-4">Shipping Information</h2>
                        
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField control={form.control} name="name" render={({ field }) => ( <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                            <FormField control={form.control} name="address" render={({ field }) => ( <FormItem><FormLabel>Full Address</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                            <FormField control={form.control} name="phone" render={({ field }) => ( <FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input type="tel" {...field} /></FormControl><FormMessage /></FormItem> )} />
                            
                            <FormField
                                control={form.control}
                                name="paymentMethod"
                                render={({ field }) => (
                                <FormItem className="space-y-3 pt-4">
                                    <FormLabel>Payment Method</FormLabel>
                                    <FormControl>
                                    <RadioGroup
                                        onValueChange={field.onChange}
                                        value={field.value}
                                        className="flex pt-2 gap-4"
                                    >
                                        <FormItem className="flex items-center space-x-3 space-y-0">
                                        <FormControl>
                                            <RadioGroupItem value="COD" />
                                        </FormControl>
                                        <FormLabel className="font-normal">
                                            Cash on Delivery (COD)
                                        </FormLabel>
                                        </FormItem>
                                        <FormItem className="flex items-center space-x-3 space-y-0">
                                        <FormControl>
                                            <RadioGroupItem value="Online" />
                                        </FormControl>
                                        <FormLabel className="font-normal">
                                            Online Payment
                                        </FormLabel>
                                        </FormItem>
                                    </RadioGroup>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <DialogFooter className="pt-4">
                                <DialogClose asChild>
                                    <Button type="button" variant="ghost">Cancel</Button>
                                </DialogClose>
                                <Button type="submit" className="w-full sm:w-auto" style={{ backgroundColor: 'orange', color: 'black', border: '2px solid black' }} disabled={isSubmitting}>
                                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    {isSubmitting ? 'Placing Order...' : `Place Order`}
                                </Button>
                            </DialogFooter>
                            </form>
                        </Form>
                    </div>
                     <div className="space-y-4 rounded-lg bg-muted/50 p-6">
                        <h2 className="text-xl font-semibold">Order Summary</h2>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="relative h-16 w-16 rounded-md border overflow-hidden">
                                <Image src={primaryImageUrl} alt={product.name} fill className="object-cover" data-ai-hint={product.imageHint}/>
                                </div>
                                <div>
                                <p className="font-medium">{product.name}</p>
                                <p className="text-sm text-muted-foreground">
                                    {selectedSize ? `Size: ${selectedSize}` : ''}
                                </p>
                                </div>
                            </div>
                            <p className="font-medium">₹{total.toFixed(2)}</p>
                        </div>
                        <div className="border-t pt-4 mt-4 flex items-center justify-between font-bold text-lg">
                            <p>Total</p>
                            <p>₹{total.toFixed(2)}</p>
                        </div>
                    </div>
                </div>
            </div>
          </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
