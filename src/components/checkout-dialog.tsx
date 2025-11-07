'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useState, useEffect } from 'react';
import { useDoc, useUser, FirestorePermissionError, errorEmitter } from '@/firebase';
import { doc, addDoc, collection, setDoc } from 'firebase/firestore';
import { useFirestore, useMemoFirebase } from '@/firebase/provider';
import type { Product, UserProfile } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
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
  const { user, isUserLoading } = useUser();
  const { signInWithGoogle } = useAuth();
  
  const userProfileRef = useMemoFirebase(
    () => (firestore && user ? doc(firestore, 'users', user.uid) : null),
    [firestore, user]
  );
  const { data: userProfile } = useDoc<UserProfile>(userProfileRef);


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '', address: '', phone: '', paymentMethod: undefined },
  });

  useEffect(() => {
    if (userProfile) {
        form.reset({
            name: userProfile.name || '',
            address: userProfile.address || '',
            phone: userProfile.phone || '',
            paymentMethod: undefined,
        });
    }
  }, [userProfile, form]);
  
  const handleGoogleSignIn = async () => {
    const success = await signInWithGoogle();
    if (!success) {
      toast({
        variant: 'destructive',
        title: 'Sign-in Failed',
        description: 'Could not sign you in with Google. Please try again.',
      });
    }
  };


  if (!product) {
    return null;
  }
  
  const total = product.price;
  const primaryImageUrl = product.imageUrls && product.imageUrls.length > 0 ? product.imageUrls[0] : '/placeholder.png';

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    if (!firestore || !user) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You must be logged in to place an order.',
      });
      setIsSubmitting(false);
      return;
    }

    try {
        const userProfileData = {
            uid: user.uid,
            name: values.name,
            address: values.address,
            phone: values.phone,
            email: user.email,
            photoURL: user.photoURL,
        };
        setDoc(doc(firestore, 'users', user.uid), userProfileData, { merge: true }).catch(err => {
            console.error("Error saving user profile:", err);
            const permissionError = new FirestorePermissionError({
                path: `users/${user.uid}`,
                operation: 'write',
                requestResourceData: userProfileData
            });
            errorEmitter.emit('permission-error', permissionError);
        });

        const orderData = {
          userId: user.uid,
          items: [{
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
            imageUrl: primaryImageUrl,
            size: selectedSize || 'N/A'
          }],
          totalAmount: total,
          status: 'Processing' as const,
          orderDate: Date.now(),
          shippingAddress: {
            name: values.name,
            address: values.address,
            phone: values.phone,
          }
        };
        
        const ordersCollection = collection(firestore, 'users', user.uid, 'orders');
        const docRef = await addDoc(ordersCollection, orderData);
        
        const itemsSummary = `- ${product.name} (Size: ${selectedSize || 'N/A'}) - $${total.toFixed(2)}`;
        
        const emailMessageBody = `
New Order Received!
Order ID: ${docRef.id}
Customer ID: ${user.uid}
Product ID: ${product.id}

Customer Details:
Name: ${values.name}
Address: ${values.address}
Phone: ${values.phone}
Payment: ${values.paymentMethod}

Order Item:
${itemsSummary}

Total Amount: $${total.toFixed(2)}
        `.trim().replace(/^\s+/gm, '');

        const emailAddress = 'darpanwears@gmail.com';
        const emailSubject = `New Order: ${docRef.id}`;
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
        
        const permissionError = new FirestorePermissionError({
            path: `users/${user.uid}/orders`,
            operation: 'create',
        });
        errorEmitter.emit('permission-error', permissionError);

        toast({
            variant: 'destructive',
            title: 'Order Failed',
            description: 'Could not save your order. Please check your details and try again.',
        });
    } finally {
      setIsSubmitting(false);
    }
  }
  
    const GoogleIcon = () => (
    <svg className="mr-2 h-4 w-4" viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
      <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
      <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.657-3.356-11.303-7.962l-6.571,4.819C9.656,39.663,16.318,44,24,44z"></path>
      <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C42.022,35.372,44,30.038,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
    </svg>
  );

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
                        
                        {!user && !isUserLoading && (
                             <div className="flex flex-col items-center justify-center p-8 border rounded-md bg-muted/50 space-y-4 text-center">
                                <p className="text-muted-foreground">Sign in to pre-fill your details and place an order.</p>
                                <Button onClick={handleGoogleSignIn} variant="outline">
                                    <GoogleIcon /> Sign in with Google
                                </Button>
                            </div>
                        )}
                        
                        {(isUserLoading) && (
                            <div className="space-y-4">
                                <div className="space-y-2"><label className="text-sm font-medium leading-none">Full Name</label><div className="h-10 w-full rounded-md bg-muted animate-pulse"></div></div>
                                <div className="space-y-2"><label className="text-sm font-medium leading-none">Full Address</label><div className="h-10 w-full rounded-md bg-muted animate-pulse"></div></div>
                                <div className="space-y-2"><label className="text-sm font-medium leading-none">Phone Number</label><div className="h-10 w-full rounded-md bg-muted animate-pulse"></div></div>
                            </div>
                        )}
                        
                        {user && (
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
                                    <Button type="submit" className="w-full sm:w-auto" style={{ backgroundColor: 'orange', color: 'black', border: '2px solid black' }} disabled={isSubmitting || !user}>
                                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                        {isSubmitting ? 'Placing Order...' : `Place Order`}
                                    </Button>
                                </DialogFooter>
                                </form>
                            </Form>
                        )}
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
                            <p className="font-medium">${total.toFixed(2)}</p>
                        </div>
                        <div className="border-t pt-4 mt-4 flex items-center justify-between font-bold text-lg">
                            <p>Total</p>
                            <p>${total.toFixed(2)}</p>
                        </div>
                    </div>
                </div>
            </div>
          </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
