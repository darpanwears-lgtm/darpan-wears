'use client';

import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useAuth } from '@/lib/auth-context';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

const signupSchema = z.object({
  instagramUsername: z.string().min(2, { message: 'Instagram username is required.' }),
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});


interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LoginDialog({ open, onOpenChange }: LoginDialogProps) {
  const { emailLogin, emailSignUp } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("login");

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const signupForm = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: { instagramUsername: '', email: '', password: '' },
  });

  const handleLogin = async (values: z.infer<typeof loginSchema>) => {
    setIsSubmitting(true);
    const success = await emailLogin(values.email, values.password);
    if (success) {
      toast({ title: "Login Successful", description: "Welcome back!" });
      onOpenChange(false);
    } else {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: "Please check your email and password and try again.",
      });
    }
    setIsSubmitting(false);
  };

  const handleSignUp = async (values: z.infer<typeof signupSchema>) => {
    setIsSubmitting(true);
    const success = await emailSignUp(values.email, values.password, values.instagramUsername);
    if (success) {
      toast({ title: "Account Created", description: "You have been successfully signed up!" });
      onOpenChange(false);
    } else {
      toast({
        variant: "destructive",
        title: "Sign Up Failed",
        description: "Could not create an account. The email might already be in use.",
      });
    }
    setIsSubmitting(false);
  };
  
  const handleOpenChange = (isOpen: boolean) => {
    if (isSubmitting) return; 
    onOpenChange(isOpen);
    if (!isOpen) {
        loginForm.reset();
        signupForm.reset();
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold font-headline text-center">Welcome</DialogTitle>
          <DialogDescription className="text-center">
            Sign in or create an account to continue.
          </DialogDescription>
        </DialogHeader>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
                <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4 pt-4">
                        <FormField control={loginForm.control} name="email" render={({ field }) => ( <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="you@example.com" {...field} /></FormControl><FormMessage /></FormItem> )} />
                        <FormField control={loginForm.control} name="password" render={({ field }) => ( <FormItem><FormLabel>Password</FormLabel><FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl><FormMessage /></FormItem> )} />
                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isSubmitting ? 'Logging in...' : 'Login'}
                        </Button>
                    </form>
                </Form>
            </TabsContent>
            <TabsContent value="signup">
                 <Form {...signupForm}>
                    <form onSubmit={signupForm.handleSubmit(handleSignUp)} className="space-y-4 pt-4">
                        <FormField control={signupForm.control} name="instagramUsername" render={({ field }) => ( <FormItem><FormLabel>Instagram Username</FormLabel><FormControl><Input placeholder="your_insta_name" {...field} /></FormControl><FormMessage /></FormItem> )} />
                        <FormField control={signupForm.control} name="email" render={({ field }) => ( <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="you@example.com" {...field} /></FormControl><FormMessage /></FormItem> )} />
                        <FormField control={signupForm.control} name="password" render={({ field }) => ( <FormItem><FormLabel>Password</FormLabel><FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl><FormMessage /></FormItem> )} />
                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isSubmitting ? 'Creating Account...' : 'Sign Up'}
                        </Button>
                    </form>
                </Form>
            </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
