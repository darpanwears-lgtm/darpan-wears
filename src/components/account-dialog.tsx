'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useCollection, useAuth } from '@/firebase';
import { useFirestore, useMemoFirebase } from '@/firebase/provider';
import { doc, setDoc, getDoc, updateDoc, collection, query, orderBy } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Star, X } from 'lucide-react';
import type { UserProfile, Order } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ScrollArea } from './ui/scroll-area';


function ProfileTab() {
  const { user } = useUser();
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
    const fetchProfile = async () => {
        if (!userProfileRef) return;
        setIsLoading(true);
        try {
            const docSnap = await getDoc(userProfileRef);
            if (docSnap.exists()) {
                setProfile(docSnap.data() as UserProfile);
            } else if (user) {
                setProfile({ 
                    email: user.email || '',
                    name: user.displayName || '',
                    photoURL: user.photoURL || ''
                });
            }
        } catch (error) {
            console.error("Error fetching user profile:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not load your profile.' });
        } finally {
            setIsLoading(false);
        }
    };
    if(user) fetchProfile();
  }, [user, userProfileRef, toast]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!userProfileRef || !user) return;
    setIsSaving(true);
    try {
        const profileData = { ...profile, uid: user.uid, name: profile.name || user.displayName, email: profile.email || user.email };
        await setDoc(userProfileRef, profileData, { merge: true });
        toast({ title: 'Success', description: 'Your profile has been updated.' });
    } catch (error) {
        console.error("Error saving profile:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not save your profile.' });
    } finally {
        setIsSaving(false);
    }
  };
  
  if (isLoading) {
    return (
        <CardContent className="space-y-6">
            <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-10 w-full" /></div>
            <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-10 w-full" /></div>
            <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-10 w-full" /></div>
            <Skeleton className="h-10 w-32" />
        </CardContent>
    )
  }

  return (
      <CardContent className="space-y-6">
          <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" name="name" value={profile.name || ''} onChange={handleInputChange} />
          </div>
          <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" name="email" type="email" value={profile.email || ''} onChange={handleInputChange} disabled/>
          </div>
           <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" name="address" value={profile.address || ''} onChange={handleInputChange} />
          </div>
           <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" name="phone" type="tel" value={profile.phone || ''} onChange={handleInputChange} />
          </div>
          <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
      </CardContent>
  );
}

function OrdersTab() {
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();

    const ordersQuery = useMemoFirebase(
        () => (user && firestore ? query(collection(firestore, 'users', user.uid, 'orders'), orderBy('orderDate', 'desc')) : null),
        [user, firestore]
    );
    const { data: orders, isLoading } = useCollection<Order>(ordersQuery);

    const handleCancelOrder = async (orderId: string) => {
        if (!user || !firestore) return;
        const orderRef = doc(firestore, 'users', user.uid, 'orders', orderId);
        try {
            await updateDoc(orderRef, { status: 'Cancelled' });
            toast({ title: 'Order Cancelled', description: 'Your order has been successfully cancelled.' });
        } catch (error) {
            console.error('Error cancelling order:', error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not cancel the order.' });
        }
    };
    
    const handleRateOrder = async (orderId: string, rating: number) => {
        if (!user || !firestore) return;
        const orderRef = doc(firestore, 'users', user.uid, 'orders', orderId);
        try {
            await updateDoc(orderRef, { rating });
            toast({ title: 'Rating Submitted', description: `You rated this order ${rating} stars.` });
        } catch (error) {
            console.error('Error rating order:', error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not submit your rating.' });
        }
    };

    if (isLoading) {
        return <div className="p-6"><Skeleton className="h-32 w-full" /></div>
    }

    if (!orders || orders.length === 0) {
        return <div className="p-6 text-center text-muted-foreground">You have no orders yet.</div>
    }

    return (
        <CardContent className="space-y-4">
            {orders.map(order => (
                <Card key={order.id}>
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="text-lg">Order #{order.id.slice(0, 7)}</CardTitle>
                                <CardDescription>Placed on {format(new Date(order.orderDate), 'PPP')}</CardDescription>
                            </div>
                            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                                order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                                order.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                                'bg-blue-100 text-blue-800'
                            }`}>{order.status}</div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <ul className="divide-y">
                           {order.items.map(item => (
                               <li key={item.id} className="py-2 flex justify-between items-center">
                                   <span>{item.name} (x{item.quantity})</span>
                                   <span>${(item.price * item.quantity).toFixed(2)}</span>
                               </li>
                           ))}
                        </ul>
                        <div className="font-bold text-right">Total: ${order.totalAmount.toFixed(2)}</div>
                         <div className="flex justify-end items-center gap-2 pt-4 border-t">
                            {order.status === 'Processing' && (
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive" size="sm"><X className="mr-1 h-4 w-4" />Cancel Order</Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone. This will permanently cancel your order.</AlertDialogDescription></AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Back</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleCancelOrder(order.id)}>Confirm Cancellation</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            )}
                             {order.status === 'Delivered' && (
                               <div className="flex items-center gap-1">
                                 {[1,2,3,4,5].map(star => (
                                   <Star key={star} className={`cursor-pointer h-5 w-5 ${order.rating && order.rating >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} onClick={() => handleRateOrder(order.id, star)}/>
                                 ))}
                               </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </CardContent>
    )
}

interface AccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AccountDialog({ open, onOpenChange }: AccountDialogProps) {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const firebaseAuth = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!isUserLoading && !user) {
      onOpenChange(false);
      router.push('/');
    }
  }, [user, isUserLoading, router, onOpenChange]);
  
  const handleLogout = async () => {
    try {
      await signOut(firebaseAuth);
      onOpenChange(false);
      router.push('/');
      toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
    } catch (error) {
      console.error("Logout failed:", error);
      toast({ variant: 'destructive', title: 'Logout Failed', description: 'Please try again.' });
    }
  };

  if (isUserLoading || !user) {
    return null; // Don't render dialog while loading or if no user
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl p-0">
            <ScrollArea className="max-h-[85vh]">
                <div className="p-6">
                    <DialogHeader>
                        <DialogTitle>My Account</DialogTitle>
                        <DialogDescription>Manage your profile, orders, and settings.</DialogDescription>
                    </DialogHeader>

                    <Tabs defaultValue="profile" className="w-full mt-4">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="profile">Profile</TabsTrigger>
                            <TabsTrigger value="orders">My Orders</TabsTrigger>
                        </TabsList>
                        <TabsContent value="profile">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Profile Details</CardTitle>
                                    <CardDescription>Update your personal information.</CardDescription>
                                </CardHeader>
                                <ProfileTab />
                            </Card>
                        </TabsContent>
                        <TabsContent value="orders">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Order History</CardTitle>
                                    <CardDescription>View and manage your past orders.</CardDescription>
                                </CardHeader>
                                <OrdersTab />
                            </Card>
                        </TabsContent>
                    </Tabs>

                    <DialogFooter className="sm:justify-between pt-6">
                        <Button variant="ghost" onClick={handleLogout}>Logout</Button>
                        <DialogClose asChild>
                            <Button type="button">
                                Continue Shopping
                            </Button>
                        </DialogClose>
                    </DialogFooter>
                </div>
            </ScrollArea>
        </DialogContent>
    </Dialog>
  );
}
