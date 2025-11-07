
'use client';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collectionGroup, query, orderBy, doc, updateDoc, FirestoreError } from 'firebase/firestore';
import type { Order } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { errorEmitter, FirestorePermissionError } from '@/firebase';

const statusOptions: Order['status'][] = ['Processing', 'Shipped', 'Delivered', 'Cancelled'];

export function OrderList() {
    const firestore = useFirestore();
    const ordersQuery = useMemoFirebase(() => (firestore ? query(collectionGroup(firestore, 'orders'), orderBy('orderDate', 'desc')) : null), [firestore]);
    const { data: orders, isLoading, error } = useCollection<Order>(ordersQuery);
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
                    {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
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
                                            (order.status || '') === 'Delivered' ? 'bg-green-100 text-green-800' :
                                            (order.status || '') === 'Cancelled' ? 'bg-red-100 text-red-800' :
                                            (order.status || '') === 'Shipped' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-blue-100 text-blue-800'
                                        }`}>{order.status || 'N/A'}</div>
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
                                                <Select value={order.status || ''} onValueChange={(newStatus: Order['status']) => handleStatusChange(order, newStatus)}>
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
