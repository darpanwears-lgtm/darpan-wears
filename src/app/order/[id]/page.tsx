import { CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function OrderPage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto px-4 py-12">
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto bg-green-100 rounded-full h-16 w-16 flex items-center justify-center mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold font-headline">Thank you for your order!</CardTitle>
          <p className="text-muted-foreground">Your order has been placed successfully.</p>
        </CardHeader>
        <CardContent className="text-center space-y-6">
            <div>
                <p className="font-medium">Order ID</p>
                <p className="text-lg font-mono bg-muted rounded-md px-2 py-1 inline-block">{params.id}</p>
            </div>
            <div>
                <p className="font-medium">Order Status</p>
                <p className="text-lg text-blue-600 font-semibold">Processing</p>
            </div>
            <p className="text-muted-foreground text-sm">You will receive an email confirmation shortly. You can also track your order in your account.</p>
            <div className="flex gap-4 justify-center">
                <Button asChild>
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
