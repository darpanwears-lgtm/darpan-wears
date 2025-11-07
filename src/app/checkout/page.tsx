
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import Image from 'next/image';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Suspense, useState, useEffect } from 'react';
import { useDoc, useUser } from '@/firebase';
import { doc, addDoc, collection } from 'firebase/firestore';
import { useFirestore, useMemoFirebase } from '@/firebase/provider';
import type { Product } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter, FirestorePermissionError } from '@/firebase';
import { Loader2 } from 'lucide-react';
import type { UserProfile } from '@/lib/types';


const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  address: z.string().min(5, { message: 'Address is too short.' }),
  phone: z.string().min(10, { message: 'Please enter a valid phone number.' }),
  paymentMethod: z.enum(['COD', 'Online'], {
    required_error: 'You need to select a payment method.',
  }),
});

function CheckoutForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get('productId');
  const size = searchParams.get('size');
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const firestore = useFirestore();
  const { user } = useUser();
  
  const userProfileRef = useMemoFirebase(
    () => (firestore && user ? doc(firestore, 'users', user.uid) : null),
    [firestore, user]
  );
  const { data: userProfile } = useDoc<UserProfile>(userProfileRef);

  const productRef = useMemoFirebase(
    () => (firestore && productId ? doc(firestore, 'products', productId) : null),
    [firestore, productId]
  );
  const { data: product, isLoading } = useDoc<Product>(productRef);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '', address: '', phone: '', paymentMethod: 'COD' },
  });

  useEffect(() => {
    if (userProfile) {
        form.reset({
            name: userProfile.name || '',
            address: userProfile.address || '',
            phone: userProfile.phone || '',
            paymentMethod: 'COD',
        })
    }
  }, [userProfile, form]);
  
  if (isLoading) {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid md:grid-cols-2 gap-12">
                <Card>
                    <CardHeader><Skeleton className="h-8 w-1/2" /></CardHeader>
                    <CardContent className="space-y-6">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </CardContent>
                </Card>
                 <div className="space-y-4">
                    <Skeleton className="h-8 w-1/3" />
                    <Card>
                        <CardContent className="p-4 space-y-4">
                            <div className="flex items-center gap-4">
                                <Skeleton className="h-16 w-16 rounded-md" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-48" />
                                    <Skeleton className="h-4 w-24" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
  }

  if (!product) {
    if (typeof window !== 'undefined') {
        router.push('/');
    }
    return null;
  }
  
  const total = product.price;
  const primaryImageUrl = product.imageUrls && product.imageUrls.length > 0 ? product.imageUrls[0] : '/placeholder.png';


  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    if (!user || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You must be logged in to place an order.',
      });
      setIsSubmitting(false);
      return;
    }
    
    const orderData = {
      userId: user.uid,
      items: [{
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        imageUrl: primaryImageUrl,
        size: size || 'N/A'
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

    try {
        const docRef = await addDoc(ordersCollection, orderData);
        
        const itemsSummary = `- ${product.name} (Size: ${size || 'N/A'}) - $${total.toFixed(2)}`;
        const message = `
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
  
        const purchaseHistory = JSON.parse(localStorage.getItem('purchaseHistory') || '[]');
        const updatedHistory = [...new Set([product.id, ...purchaseHistory])];
        localStorage.setItem('purchaseHistory', JSON.stringify(updatedHistory));
        
        const whatsappNumber = '919332307996';
        const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
        
        toast({
            title: "Order Placed!",
            description: "Redirecting to WhatsApp to confirm your order.",
        });
        
        // This will navigate the current browser window to WhatsApp.
        window.location.href = whatsappUrl;

    } catch (error) {
        console.error("Error placing order:", error);
        // This emits a detailed error for debugging but doesn't throw,
        // so we add a user-facing toast as well.
        const permissionError = new FirestorePermissionError({
            path: `users/${user.uid}/orders`,
            operation: 'create',
            requestResourceData: orderData,
        });
        errorEmitter.emit('permission-error', permissionError);

        toast({
            variant: 'destructive',
            title: 'Order Failed',
            description: 'Could not place your order. Please check your details and try again.',
        });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8 font-headline">Checkout</h1>
      <div className="grid md:grid-cols-2 gap-12">
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Shipping Details & Payment</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField control={form.control} name="name" render={({ field }) => ( <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                  <FormField control={form.control} name="address" render={({ field }) => ( <FormItem><FormLabel>Full Address</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                  <FormField control={form.control} name="phone" render={({ field }) => ( <FormItem><FormLabel>WhatsApp Number</FormLabel><FormControl><Input type="tel" {...field} /></FormControl><FormMessage /></FormItem> )} />
                  
                  <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Payment Method</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-1"
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

                  <Button type="submit" className="w-full" size="lg" style={{ backgroundColor: 'orange', color: 'black', border: '2px solid black' }} disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {isSubmitting ? 'Placing Order...' : `Place Order - $${total.toFixed(2)}`}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Order Summary</h2>
          <Card>
            <CardContent className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Image src={primaryImageUrl} alt={product.name} width={64} height={64} className="rounded-md object-cover" data-ai-hint={product.imageHint}/>
                    <div>
                      <p className="font-medium">{product.name}</p>
                       <p className="text-sm text-muted-foreground">
                        {size ? `Size: ${size}` : ''}
                       </p>
                    </div>
                  </div>
                  <p className="font-medium">${total.toFixed(2)}</p>
                </div>
              <div className="border-t pt-4 mt-4 flex items-center justify-between font-bold text-lg">
                <p>Total</p>
                <p>${total.toFixed(2)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CheckoutForm />
    </Suspense>
  )
}

    