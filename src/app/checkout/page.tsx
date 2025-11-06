'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCart } from '@/lib/cart-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import Image from 'next/image';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email.' }),
  address: z.string().min(5, { message: 'Address is too short.' }),
  city: z.string().min(2, { message: 'City is required.' }),
  zip: z.string().min(5, { message: 'ZIP code must be 5 digits.' }).max(5),
  card: z.string().length(16, { message: 'Card number must be 16 digits.' }),
  expiry: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, { message: 'Use MM/YY format.' }),
  cvc: z.string().length(3, { message: 'CVC must be 3 digits.' }),
});

export default function CheckoutPage() {
  const router = useRouter();
  const { state, getCartTotal, clearCart } = useCart();
  const total = getCartTotal();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '', email: '', address: '', city: '', zip: '', card: '', expiry: '', cvc: '' },
  });

  if (state.items.length === 0) {
    if (typeof window !== 'undefined') {
        router.push('/');
    }
    return null;
  }

  function onSubmit(values: z.infer<typeof formSchema>) {
    const orderId = Math.random().toString(36).substr(2, 9);
    
    const itemsSummary = state.items.map(item => 
      `- ${item.name} (Size: ${item.size || 'N/A'}) - Qty: ${item.quantity} - $${(item.price * item.quantity).toFixed(2)}`
    ).join('\\n');

    const message = `
*New Order Received!* (ID: ${orderId})\\n
\\n
*Customer Details:*\\n
Name: ${values.name}\\n
Email: ${values.email}\\n
Address: ${values.address}, ${values.city}, ${values.zip}\\n
\\n
*Order Items:*\\n
${itemsSummary}\\n
\\n
*Total Amount: $${total.toFixed(2)}*
    `;

    const whatsappNumber = '9332307996'; // Primary number
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

    // Update purchase history in localStorage
    const purchasedIds = state.items.map(item => item.id.split('-')[0]); // get original product id
    const purchaseHistory = JSON.parse(localStorage.getItem('purchaseHistory') || '[]');
    const updatedHistory = [...new Set([...purchasedIds, ...purchaseHistory])];
    localStorage.setItem('purchaseHistory', JSON.stringify(updatedHistory));

    clearCart();
    
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
              <CardTitle>Shipping & Payment</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField control={form.control} name="name" render={({ field }) => ( <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                  <FormField control={form.control} name="email" render={({ field }) => ( <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem> )} />
                  <FormField control={form.control} name="address" render={({ field }) => ( <FormItem><FormLabel>Address</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="city" render={({ field }) => ( <FormItem><FormLabel>City</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={form.control} name="zip" render={({ field }) => ( <FormItem><FormLabel>ZIP Code</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                  </div>
                  <FormField control={form.control} name="card" render={({ field }) => ( <FormItem><FormLabel>Card Number</FormLabel><FormControl><Input placeholder="XXXX XXXX XXXX XXXX" {...field} /></FormControl><FormMessage /></FormItem> )} />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="expiry" render={({ field }) => ( <FormItem><FormLabel>Expiry (MM/YY)</FormLabel><FormControl><Input placeholder="MM/YY" {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={form.control} name="cvc" render={({ field }) => ( <FormItem><FormLabel>CVC</FormLabel><FormControl><Input placeholder="XXX" {...field} /></FormControl><FormMessage /></FormItem> )} />
                  </div>
                  <Button type="submit" className="w-full" size="lg" style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-foreground)' }}>
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
              {state.items.map(item => (
                <div key={item.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Image src={item.image} alt={item.name} width={64} height={64} className="rounded-md object-cover" data-ai-hint={item.imageHint}/>
                    <div>
                      <p className="font-medium">{item.name}</p>
                       <p className="text-sm text-muted-foreground">
                        {item.size ? `Size: ${item.size} | ` : ''}Qty: {item.quantity}
                       </p>
                    </div>
                  </div>
                  <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
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
