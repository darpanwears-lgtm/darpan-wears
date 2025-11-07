
'use client';
import { Suspense } from 'react';
import { CheckCircle, Mail } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

function OrderConfirmation() {
  const orderId = typeof window !== 'undefined' ? window.location.pathname.split('/').pop() : '';

  const handleSendEmail = () => {
    const emailAddress = 'darpanwears@gmail.com';
    const emailSubject = `Order Confirmation: ${orderId}`;
    const emailBody = `My order ID is ${orderId}.`;
    const emailUrl = `mailto:${emailAddress}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    window.location.href = emailUrl;
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto bg-green-100 rounded-full h-16 w-16 flex items-center justify-center mb-4">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold font-headline">आपका ऑर्डर हमें मिल गया है!</CardTitle>
          <p className="text-muted-foreground">आपका ऑर्डर सफलतापूर्वक प्लेस हो गया है।</p>
           <p className="text-sm text-muted-foreground mt-2">
                आपको अपने ऑर्डर का विवरण ईमेल के माध्यम से भेजने के लिए कहा गया होगा।
           </p>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div>
            <p className="font-medium">ऑर्डर आईडी</p>
            <p className="text-lg font-mono bg-muted rounded-md px-2 py-1 inline-block">{orderId}</p>
          </div>
          <p className="text-muted-foreground text-sm">
            यदि आपको ईमेल भेजने का विकल्प नहीं मिला, तो कृपया अपनी ऑर्डर आईडी के साथ हमें ईमेल करें।
          </p>
          
          <Button onClick={handleSendEmail}>
              <Mail className="mr-2 h-4 w-4" /> ईमेल खोलें
          </Button>

          <div className="flex gap-4 justify-center pt-4 border-t">
            <Button variant="outline" asChild>
              <Link href="/">खरीदारी जारी रखें</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/account">मेरे ऑर्डर देखें</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function OrderPage() {
    return (
        <Suspense fallback={<div>कंफर्मेशन लोड हो रहा है...</div>}>
            <OrderConfirmation />
        </Suspense>
    )
}
