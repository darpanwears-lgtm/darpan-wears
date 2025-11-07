
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from './ui/button';
import { Separator } from './ui/separator';

export function HowToOrderDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="lg">How to Order</Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-headline">How to Order / ऑर्डर कैसे करें</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          
          {/* English Instructions */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-center">English</h3>
            <Separator />
            <ol className="list-decimal list-inside space-y-3 text-muted-foreground">
              <li>
                <span className="font-semibold text-foreground">Select a Product:</span><br />
                Browse our collection and click on any product you like to see more details.
              </li>
              <li>
                <span className="font-semibold text-foreground">Choose Size & Buy:</span><br />
                Select your desired size (if applicable) and click the "Buy Now" button.
              </li>
              <li>
                <span className="font-semibold text-foreground">Enter Your Details:</span><br />
                A popup will appear. Fill in your name, full shipping address, and phone number.
              </li>
              <li>
                <span className="font-semibold text-foreground">Confirm on WhatsApp:</span><br />
                Click the "Order via WhatsApp" button. You will be redirected to WhatsApp to confirm your order with us.
              </li>
            </ol>
          </div>

          {/* Hindi Instructions */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-center">हिन्दी</h3>
            <Separator />
            <ol className="list-decimal list-inside space-y-3 text-muted-foreground">
              <li>
                <span className="font-semibold text-foreground">प्रोडक्ट चुनें:</span><br />
                हमारे कलेक्शन को ब्राउज़ करें और अपनी पसंद के किसी भी प्रोडक्ट पर क्लिक करके अधिक जानकारी देखें।
              </li>
              <li>
                <span className="font-semibold text-foreground">साइज़ चुनें और खरीदें:</span><br />
                अपना पसंदीदा साइज़ (यदि लागू हो) चुनें और "Buy Now" बटन पर क्लिक करें।
              </li>
              <li>
                <span className="font-semibold text-foreground">अपनी जानकारी भरें:</span><br />
                एक पॉपअप दिखाई देगा। इसमें अपना नाम, पूरा शिपिंग पता और फ़ोन नंबर भरें।
              </li>
              <li>
                <span className="font-semibold text-foreground">WhatsApp पर पुष्टि करें:</span><br />
                "Order via WhatsApp" बटन पर क्लिक करें। आपको अपने ऑर्डर की पुष्टि करने के लिए WhatsApp पर रीडायरेक्ट कर दिया जाएगा।
              </li>
            </ol>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
