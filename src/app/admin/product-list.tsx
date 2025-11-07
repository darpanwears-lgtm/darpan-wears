
'use client';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, doc, deleteDoc } from 'firebase/firestore';
import type { Product } from '@/lib/types';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ProductForm } from './product-form';
import { FileEdit, Trash2, Link as LinkIcon } from 'lucide-react';
import { errorEmitter, FirestorePermissionError } from '@/firebase';
import Link from 'next/link';

export function ProductList() {
    const firestore = useFirestore();
    const productsCollection = useMemoFirebase(() => (firestore ? collection(firestore, 'products') : null), [firestore]);
    const { data: products, isLoading } = useCollection<Product>(productsCollection);
    const { toast } = useToast();
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

    const handleDelete = async (productId: string) => {
        if (!firestore) return;
        const productDoc = doc(firestore, 'products', productId);
        try {
            deleteDoc(productDoc).catch(async (serverError) => {
                const permissionError = new FirestorePermissionError({
                    path: productDoc.path,
                    operation: 'delete',
                });
                errorEmitter.emit('permission-error', permissionError);
            });
            toast({
                title: 'Product Deleted',
                description: 'The product has been successfully removed.',
            });
        } catch (error) {
            console.error('Error deleting product:', error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Could not delete the product.',
            });
        }
    };

    if (isLoading) {
        return (
             <Card>
                <CardHeader>
                    <CardTitle>Manage Your Products</CardTitle>
                    <CardDescription>View, edit, or delete your products here.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                             <div key={i} className="flex items-center space-x-4">
                                <Skeleton className="h-16 w-16" />
                                <div className="space-y-2 flex-grow">
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-4 w-1/2" />
                                </div>
                                <Skeleton className="h-10 w-24" />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Manage Your Products</CardTitle>
                <CardDescription>View, edit, or delete your products here.</CardDescription>
            </CardHeader>
            <CardContent>
                 {products && products.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Image</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Stock</TableHead>
                                <TableHead>Link</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {products.map((product) => {
                                const imageUrl = product.imageUrls && product.imageUrls.length > 0 ? product.imageUrls[0] : `https://picsum.photos/seed/${product.id}/48/48`;
                                return (
                                    <TableRow key={product.id}>
                                        <TableCell>
                                            <Image src={imageUrl} alt={product.name} width={48} height={48} className="rounded-md object-cover" />
                                        </TableCell>
                                        <TableCell className="font-medium">{product.name}</TableCell>
                                        <TableCell>${product.price.toFixed(2)}</TableCell>
                                        <TableCell>{product.stockQuantity}</TableCell>
                                        <TableCell>
                                            {product.productLink ? (
                                                <Button asChild variant="ghost" size="icon">
                                                    <Link href={product.productLink} target="_blank" rel="noopener noreferrer">
                                                        <LinkIcon className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                            ) : (
                                                <span className="text-muted-foreground">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                                                <DialogTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <FileEdit className="h-4 w-4" />
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="max-w-3xl">
                                                    <DialogHeader>
                                                        <DialogTitle>Edit: {product.name}</DialogTitle>
                                                    </DialogHeader>
                                                    <ProductForm product={product} onSuccess={() => setIsEditDialogOpen(false)} />
                                                </DialogContent>
                                            </Dialog>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            This action cannot be undone. This will permanently delete the product from your store.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDelete(product.id)}>Delete</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </TableCell>
                                    </TableRow>
                                )}
                            )}
                        </TableBody>
                    </Table>
                 ) : (
                    <p className="text-muted-foreground text-center">You have not added any products yet.</p>
                 )}
            </CardContent>
        </Card>
    );
}
