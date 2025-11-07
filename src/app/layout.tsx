
'use client';

import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import { Header } from '@/components/header';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { Footer } from '@/components/footer';
import { InstagramPopup } from '@/components/instagram-popup';
import { useEffect, useState } from 'react';
import { UserProvider } from '@/lib/user-context';

// export const metadata: Metadata = {
//   title: 'Darpan Wears Mobile Shop',
//   description: 'Your one-stop shop for the latest fashion trends.',
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [showInstagramPopup, setShowInstagramPopup] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // This effect runs only on the client, after the component has mounted.
    setIsClient(true);
    const hasSeenPopup = localStorage.getItem('hasSeenInstagramPopup');
    if (!hasSeenPopup) {
      setShowInstagramPopup(true);
    }
  }, []);

  const handlePopupClose = () => {
    localStorage.setItem('hasSeenInstagramPopup', 'true');
    setShowInstagramPopup(false);
  };
  
  return (
    <html lang="en">
      <head>
        <title>Darpan Wears Mobile Shop</title>
        <meta name="description" content="Your one-stop shop for the latest fashion trends." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <FirebaseClientProvider>
          <AuthProvider>
            <UserProvider>
              {isClient && <InstagramPopup open={showInstagramPopup} onOpenChange={setShowInstagramPopup} onFollow={handlePopupClose} />}
              <div className="flex min-h-screen flex-col">
                <Header />
                <main className="flex-grow">{children}</main>
                <Footer />
              </div>
              <Toaster />
            </UserProvider>
          </AuthProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
