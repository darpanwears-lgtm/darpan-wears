
'use client';
import { Suspense, useEffect } from 'react';
import { CheckCircle, Instagram } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';


function OrderConfirmation() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const instagramUrl = searchParams.get('instagramUrl');

  useEffect(() => {
    if (instagramUrl) {
      // Redirect to Instagram after a short delay
      const timer = setTimeout(() => {
        window.open(instagramUrl, '_blank');
      }, 3000); // 3-second delay
      return () => clearTimeout(timer);
    }
  }, [instagramUrl]);

  const orderId = window.location.pathname.split('/').pop();

  return (
    <div className="container mx-auto px-4 py-12">
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto bg-green-100 rounded-full h-16 w-16 flex items-center justify-center mb-4">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold font-headline">Thank you for your order!</CardTitle>
          <p className="text-muted-foreground">Your order details have been copied to your clipboard.</p>
           {instagramUrl && (
             <p className="text-sm text-muted-foreground mt-2">
                You will be redirected to Instagram. Please paste the copied message in a DM to complete your order.
             </p>
           )}
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div>
            <p className="font-medium">Order ID</p>
            <p className="text-lg font-mono bg-muted rounded-md px-2 py-1 inline-block">{orderId}</p>
          </div>
          <p className="text-muted-foreground text-sm">
            If you are not redirected, click the button below to open Instagram.
          </p>
           {instagramUrl && (
             <Button asChild>
                <Link href={instagramUrl} target="_blank" rel="noopener noreferrer">
                    <Instagram className="mr-2 h-4 w-4" /> Open Instagram
                </Link>
             </Button>
           )}
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
