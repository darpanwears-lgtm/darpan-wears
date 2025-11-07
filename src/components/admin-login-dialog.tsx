
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"


const formSchema = z.object({
  password: z.string().min(1, { message: 'Password is required.' }),
});

interface AdminLoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AdminLoginDialog({ open, onOpenChange }: AdminLoginDialogProps) {
  const router = useRouter();
  const { login, isAdmin, isAuthLoading } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { password: '' },
  });
  
  useEffect(() => {
    // If the user is an admin and this dialog is open, close it and navigate to the admin page.
    if (isAdmin && open) {
        onOpenChange(false);
        router.push('/admin');
    }
  }, [isAdmin, open, onOpenChange, router]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    const success = await login(values.password);
    if (!success) {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: 'The password you entered is incorrect.',
      });
       form.reset();
    }
    // On success, the effect hook will handle closing the dialog and redirecting.
    setIsSubmitting(false);
  }

  // Handle programmatic closing of the dialog
  const handleOpenChange = (isOpen: boolean) => {
    if (isSubmitting) return; // Prevent closing while submitting
    onOpenChange(isOpen);
    if (!isOpen) {
        form.reset();
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold font-headline text-center">Admin Access</DialogTitle>
          <DialogDescription className="text-center">
            Enter the password to access the admin panel.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="password" render={({ field }) => (
                <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )} />
            <Button type="submit" className="w-full" style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-foreground)' }} disabled={isSubmitting || isAuthLoading}>
                {(isSubmitting || isAuthLoading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {(isSubmitting || isAuthLoading) ? 'Verifying...' : 'Enter'}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

