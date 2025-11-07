'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useUser, useAuth as useFirebaseAuth } from '@/firebase';
import { signInAnonymously } from 'firebase/auth';


const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }),
  name: z.string().min(2, { message: "Name is required."}),
  address: z.string().min(5, { message: "Address is required."}),
  phone: z.string().min(10, { message: "Phone number is required."}),
});

export default function LoginPage() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const auth = useFirebaseAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '', name: '', address: '', phone: '' },
  });
  
  useEffect(() => {
    // If user is already logged in (not anonymous), redirect to account
    if (!isUserLoading && user && !user.isAnonymous) {
      router.push('/account');
    }
  }, [user, isUserLoading, router]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
        let currentUser = auth.currentUser;
        if (!currentUser) {
            const userCredential = await signInAnonymously(auth);
            currentUser = userCredential.user;
        }
        
        // Here you would typically link the anonymous account with an email/password
        // or other provider, and save the user profile.
        // For this simple case, we'll just save the data to localStorage and navigate.
        
        const userProfile = {
            uid: currentUser.uid,
            ...values
        };

        // In a real app, you'd save this to Firestore
        // For now, we'll simulate it.
        console.log("User profile to save:", userProfile);
        
        toast({
            title: "Login Successful",
            description: "Your information has been saved.",
        });
        
        router.push('/account');

    } catch (error) {
        console.error("Login failed:", error);
        toast({
            variant: "destructive",
            title: "Login Failed",
            description: "Could not sign you in. Please try again.",
        });
    } finally {
        setIsSubmitting(false);
    }
  }

  if (isUserLoading) {
     return (
      <div className="container mx-auto flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold font-headline">Welcome</CardTitle>
          <CardDescription>Sign in or create an account to continue.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
               <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="you@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
               <FormField control={form.control} name="address" render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input placeholder="123 Main St" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
               <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input type="tel" placeholder="123-456-7890" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <Button type="submit" className="w-full" style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-foreground)' }} disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? 'Saving...' : 'Save & Continue'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
