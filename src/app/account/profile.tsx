'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { User } from 'firebase/auth';

interface ProfileTabProps {
    user: User;
}

const profileSchema = z.object({
  displayName: z.string().min(2, { message: 'Name must be at least 2 characters.' }).optional(),
  email: z.string().email({ message: 'Please enter a valid email.' }),
});

export function ProfileTab({ user }: ProfileTabProps) {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: user.displayName || '',
      email: user.email || '',
    },
  });

  function onSubmit(values: z.infer<typeof profileSchema>) {
    console.log("Profile updated:", values);
    toast({
      title: "Profile Updated",
      description: "Your information has been successfully updated.",
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
        <CardDescription>Manage your account details here.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="displayName" render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} disabled />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <Button type="submit" style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-foreground)' }}>Save Changes</Button>
            </form>
          </Form>
      </CardContent>
    </Card>
  );
}
