
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useUser, useFirestore, useCollection, useMemoFirebase, FirestorePermissionError, errorEmitter } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { collectionGroup, query, orderBy, doc, updateDoc, FirestoreError } from 'firebase/firestore';
import type { Order } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const statusOptions: Order['status'][] = ['Processing', 'Shipped', 'Delivered', 'Cancelled'];

function OrderList() {
    const firestore = useFirestore();
    const ordersQuery = useMemoFirebase(() => (firestore ? query(collectionGroup(firestore, 'orders'), orderBy('orderDate', 'desc')) : null), [firestore]);
    const { data: orders, isLoading } = useCollection<Order>(ordersQuery);
    const { toast } = useToast();

    const handleStatusChange = async (order: Order, newStatus: Order['status']) => {
        if (!firestore || !order.userId || !order.id) return;
        const orderRef = doc(firestore, 'users', order.userId, 'orders', order.id);
        
        updateDoc(orderRef, { status: newStatus })
            .then(() => {
                toast({
                    title: 'Order Status Updated',
                    description: `Order #${order.id.slice(0,7)} is now ${newStatus}.`,
                });
            })
            .catch((error: FirestoreError) => {
                const permissionError = new FirestorePermissionError({
                    path: orderRef.path,
                    operation: 'update',
                    requestResourceData: { status: newStatus },
                });
                errorEmitter.emit('permission-error', permissionError);
            });
    };
    
    if (isLoading) {
        return (
             <Card>
                <CardHeader>
                    <CardTitle>Manage Customer Orders</CardTitle>
                    <CardDescription>View and update the status of all orders.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Manage Customer Orders</CardTitle>
                <CardDescription>View and update the status of all orders.</CardDescription>
            </CardHeader>
            <CardContent>
                 {orders && orders.length > 0 ? (
                    <Accordion type="single" collapsible className="w-full">
                        {orders.map((order) => (
                             <AccordionItem value={order.id} key={order.id}>
                                <AccordionTrigger>
                                     <div className="flex justify-between items-center w-full pr-4">
                                        <div className="text-left">
                                            <p className="font-medium">Order #{order.id ? order.id.slice(0, 7) : 'N/A'}</p>
                                            <p className="text-sm text-muted-foreground">{order.shippingAddress.name} - {format(new Date(order.orderDate), 'PPP')}</p>
                                        </div>
                                        <p className="text-lg font-bold">${order.totalAmount.toFixed(2)}</p>
                                        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                            order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                                            order.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                                            order.status === 'Shipped' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-blue-100 text-blue-800'
                                        }`}>{order.status}</div>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                    <div className="grid md:grid-cols-2 gap-6 p-4 bg-muted/50 rounded-md">
                                        <div>
                                            <h4 className="font-semibold mb-2">Customer & Shipping</h4>
                                            <p>{order.shippingAddress.name}</p>
                                            <p>{order.shippingAddress.address}</p>
                                            <p>{order.shippingAddress.phone}</p>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold mb-2">Order Items</h4>
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Item</TableHead>
                                                        <TableHead>Qty</TableHead>
                                                        <TableHead>Price</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                {order.items.map(item => (
                                                    <TableRow key={item.id}>
                                                        <TableCell>{item.name} {item.size && `(${item.size})`}</TableCell>
                                                        <TableCell>{item.quantity}</TableCell>
                                                        <TableCell>${item.price.toFixed(2)}</TableCell>
                                                    </TableRow>
                                                ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                         <div className="md:col-span-2">
                                            <h4 className="font-semibold mb-2">Update Status</h4>
                                             <div className="flex items-center gap-4">
                                                <Select value={order.status} onValueChange={(newStatus: Order['status']) => handleStatusChange(order, newStatus)}>
                                                    <SelectTrigger className="w-[180px]">
                                                        <SelectValue placeholder="Change status" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {statusOptions.map(status => (
                                                            <SelectItem key={status} value={status}>{status}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                 ) : (
                    <p className="text-muted-foreground text-center">There are no orders to display yet.</p>
                 )}
            </CardContent>
        </Card>
    );
}

export default function OrdersPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { isAdmin, isAuthLoading, logout } = useAuth();
  const { isUserLoading: isFirebaseUserLoading } = useUser();

  useEffect(() => {
    if (isAuthLoading || isFirebaseUserLoading) return;
    
    if (!isAdmin) {
      toast({
        title: 'Access Denied',
        description: 'You must be an admin to view this page.',
        variant: 'destructive',
      });
      router.push('/');
    }
  }, [isAdmin, isAuthLoading, isFirebaseUserLoading, router, toast]);

  const handleLogout = () => {
    logout();
    toast({
        title: "Logged Out",
        description: "You have been successfully logged out."
    });
    router.push('/');
  }

  if (isAuthLoading || isFirebaseUserLoading || !isAdmin) {
    return (
        <div className="container mx-auto flex items-center justify-center min-h-[calc(100vh-8rem)]">
            <p>Verifying admin access...</p>
        </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold font-headline">All Orders</h1>
        <Button variant="ghost" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
        </Button>
      </div>
      <OrderList />
    </div>
  );
}
