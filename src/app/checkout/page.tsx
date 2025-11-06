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
import { products } from '@/lib/products';
import { Suspense } from 'react';

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
  
  const product = products.find(p => p.id === productId);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '', address: '', phone: '' },
  });

  if (!product) {
    if (typeof window !== 'undefined') {
        router.push('/');
    }
    return null;
  }
  
  const total = product.price;

  function onSubmit(values: z.infer<typeof formSchema>) {
    const orderId = Math.random().toString(36).substr(2, 9);
    
    const itemsSummary = `- ${product.name} (Size: ${size || 'N/A'}) - $${total.toFixed(2)}`;

    const message = `
*New Order Received!* (ID: ${orderId})\\n
\\n
*Customer Details:*\\n
Name: ${values.name}\\n
Address: ${values.address}\\n
Phone: ${values.phone}\\n
Payment: ${values.paymentMethod}\\n
\\n
*Order Item:*\\n
${itemsSummary}\\n
\\n
*Total Amount: $${total.toFixed(2)}*
    `;

    const whatsappNumber = '7497810643';
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

    // Update purchase history in localStorage
    const purchaseHistory = JSON.parse(localStorage.getItem('purchaseHistory') || '[]');
    const updatedHistory = [...new Set([product.id, ...purchaseHistory])];
    localStorage.setItem('purchaseHistory', JSON.stringify(updatedHistory));
    
    // Redirect to WhatsApp
    window.location.href = whatsappUrl;
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

                  <Button type="submit" className="w-full" size="lg" style={{ backgroundColor: 'yellow', color: 'black', border: '2px solid black' }}>
                    Place Order - ${total.toFixed(2)}
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
                    <Image src={product.image} alt={product.name} width={64} height={64} className="rounded-md object-cover" data-ai-hint={product.imageHint}/>
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
