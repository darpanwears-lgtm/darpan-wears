
'use client';
import { Suspense, useEffect } from 'react';
import { CheckCircle, MessageSquareText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { WhatsAppIcon } from '@/components/icons/whatsapp';


function OrderConfirmation() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = typeof window !== 'undefined' ? window.location.pathname.split('/').pop() : '';

  return (
    <div className="container mx-auto px-4 py-12">
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto bg-green-100 rounded-full h-16 w-16 flex items-center justify-center mb-4">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold font-headline">Thank you for your order!</CardTitle>
          <p className="text-muted-foreground">Your order has been placed successfully.</p>
           <p className="text-sm text-muted-foreground mt-2">
                You should have been redirected to WhatsApp to send your order details.
           </p>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div>
            <p className="font-medium">Order ID</p>
            <p className="text-lg font-mono bg-muted rounded-md px-2 py-1 inline-block">{orderId}</p>
          </div>
          <p className="text-muted-foreground text-sm">
            If you were not redirected, please contact us on WhatsApp with your order ID.
          </p>
          
          <Button asChild>
            <Link href={`https://wa.me/919332307996`} target="_blank" rel="noopener noreferrer">
                <WhatsAppIcon className="mr-2 h-4 w-4" /> Open WhatsApp
            </Link>
          </Button>

          <div className="flex gap-4 justify-center pt-4 border-t">
            <Button variant="outline" asChild>
              <Link href="/">Continue Shopping</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/account">View My Orders</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function OrderPage() {
    return (
        <Suspense fallback={<div>Loading confirmation...</div>}>
            <OrderConfirmation />
        </Suspense>
    )
}

    