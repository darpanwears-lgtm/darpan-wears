'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { useFirestore, useMemoFirebase } from '@/firebase/provider';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { signOut, useAuth as useFirebaseAuth } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import type { UserProfile } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function AccountPage() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const auth = useFirebaseAuth();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [profile, setProfile] = useState<Partial<UserProfile>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const userProfileRef = useMemoFirebase(
    () => (firestore && user ? doc(firestore, 'users', user.uid) : null),
    [firestore, user]
  );

  useEffect(() => {
    if (isUserLoading) {
      return;
    }
    if (!user) {
      router.push('/login');
      return;
    }
    
    const fetchProfile = async () => {
        if (!userProfileRef) return;
        setIsLoading(true);
        try {
            const docSnap = await getDoc(userProfileRef);
            if (docSnap.exists()) {
                setProfile(docSnap.data() as UserProfile);
            } else {
                // Pre-fill email if available from auth user
                setProfile({ email: user.email || '' });
            }
        } catch (error) {
            console.error("Error fetching user profile:", error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Could not load your profile.',
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    fetchProfile();

  }, [user, isUserLoading, router, userProfileRef, toast]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!userProfileRef) return;
    setIsSaving(true);
    try {
        await setDoc(userProfileRef, profile, { merge: true });
        toast({
            title: 'Success',
            description: 'Your profile has been updated.',
        });
    } catch (error) {
        console.error("Error saving profile:", error);
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Could not save your profile.',
        });
    } finally {
        setIsSaving(false);
    }
  };
  
  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/');
      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out.',
      });
    } catch (error) {
      console.error("Logout failed:", error);
      toast({
        variant: 'destructive',
        title: 'Logout Failed',
        description: 'Please try again.',
      });
    }
  };

  if (isLoading || isUserLoading) {
    return (
        <div className="container mx-auto px-4 py-8">
            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-64" />
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-10 w-full" /></div>
                    <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-10 w-full" /></div>
                    <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-10 w-full" /></div>
                    <Skeleton className="h-10 w-32" />
                </CardContent>
            </Card>
        </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>My Account</CardTitle>
          <CardDescription>Manage your profile details and preferences.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" name="name" value={profile.name || ''} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" name="email" type="email" value={profile.email || ''} onChange={handleInputChange} />
            </div>
             <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" name="address" value={profile.address || ''} onChange={handleInputChange} />
            </div>
             <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" name="phone" type="tel" value={profile.phone || ''} onChange={handleInputChange} />
            </div>

            <div className="flex justify-between items-center">
                <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
                 <Button variant="ghost" onClick={handleLogout}>Logout</Button>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}