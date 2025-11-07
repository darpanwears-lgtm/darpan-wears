
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useUser, useAuth as useFirebaseAuth, useFirestore } from '@/firebase';
import { signInAnonymously } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"


const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }).or(z.literal('')).optional(),
  name: z.string().min(2, { message: "Name is required."}),
  address: z.string().min(5, { message: "Address is required."}),
  phone: z.string().min(10, { message: "Phone number is required."}),
});

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LoginDialog({ open, onOpenChange }: LoginDialogProps) {
  const auth = useFirebaseAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '', name: '', address: '', phone: '' },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    if (!auth || !firestore) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Firebase is not ready. Please try again in a moment.",
        });
        setIsSubmitting(false);
        return;
    }
    try {
        let currentUser = auth.currentUser;
        if (!currentUser) {
            const userCredential = await signInAnonymously(auth);
            currentUser = userCredential.user;
        }
        
        const userProfile = {
            uid: currentUser.uid,
            name: values.name,
            address: values.address,
            phone: values.phone,
            email: values.email || '',
        };
        
        const userProfileRef = doc(firestore, 'users', currentUser.uid);
        await setDoc(userProfileRef, userProfile, { merge: true });
        
        toast({
            title: "Login Successful",
            description: "Your information has been saved.",
        });
        
        onOpenChange(false); // Close dialog on success
        form.reset();

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold font-headline text-center">Welcome</DialogTitle>
          <DialogDescription className="text-center">
            Sign in or create an account to continue.
          </DialogDescription>
        </DialogHeader>
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
                <FormLabel>Email (Optional)</FormLabel>
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
      </DialogContent>
    </Dialog>
  );
}
