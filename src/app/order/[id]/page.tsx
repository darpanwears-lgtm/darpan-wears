
'use client';
import { Suspense } from 'react';
import { CheckCircle, MessageSquareText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

function OrderConfirmation() {
  const orderId = typeof window !== 'undefined' ? window.location.pathname.split('/').pop() : '';

  const handleOpenWhatsApp = () => {
    const whatsappNumber = '919332307996';
    const message = `I have a question about my order: ${orderId}.`;
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.location.href = whatsappUrl;
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
                आपको अपने ऑर्डर की पुष्टि करने के लिए व्हाट्सएप पर भेजा गया होगा।
           </p>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div>
            <p className="font-medium">ऑर्डर आईडी</p>
            <p className="text-lg font-mono bg-muted rounded-md px-2 py-1 inline-block">{orderId}</p>
          </div>
          <p className="text-muted-foreground text-sm">
            यदि आपको कोई प्रश्न पूछना है, तो कृपया व्हाट्सएप पर अपनी ऑर्डर आईडी के साथ हमें संदेश भेजें।
          </p>
          
          <Button onClick={handleOpenWhatsApp}>
              <MessageSquareText className="mr-2 h-4 w-4" /> व्हाट्सएप खोलें
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
