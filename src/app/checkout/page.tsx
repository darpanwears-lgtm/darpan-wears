'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCart } from '@/lib/cart-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import Image from 'next/image';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  address: z.string().min(5, { message: 'Address is too short.' }),
  phone: z.string().min(10, { message: 'Please enter a valid phone number.' }),
  paymentMethod: z.enum(['COD', 'Online'], {
    required_error: 'You need to select a payment method.',
  }),
});

export default function CheckoutPage() {
  const router = useRouter();
  const { state, getCartTotal, clearCart } = useCart();
  const total = getCartTotal();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '', address: '', phone: '' },
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
Address: ${values.address}\\n
Phone: ${values.phone}\\n
Payment: ${values.paymentMethod}\\n
\\n
*Order Items:*\\n
${itemsSummary}\\n
\\n
*Total Amount: $${total.toFixed(2)}*
    `;

    const whatsappNumber = '7497810643'; // New primary number
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
