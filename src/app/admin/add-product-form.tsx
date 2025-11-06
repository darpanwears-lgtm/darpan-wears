'use client';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { addDoc, collection } from 'firebase/firestore';
import { useFirestore, useFirebaseApp, FirestorePermissionError, errorEmitter, useUser } from '@/firebase';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';

const productSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  description: z.string().min(10, { message: 'Description is too short.' }),
  price: z.coerce.number().min(0.01, { message: 'Price must be positive.' }),
  category: z.string().min(2, { message: 'Category is required.' }),
  availableSizes: z.array(z.object({ value: z.string().min(1, "Size can't be empty") })).optional(),
  stockQuantity: z.coerce.number().min(0, { message: 'Stock can\'t be negative.'}),
  image: z.any().refine((file) => file?.length == 1, 'Image is required.'),
});

export function AdminProductForm() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const firebaseApp = useFirebaseApp();
  const { user } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      category: '',
      availableSizes: [{value: 'S'}, {value: 'M'}, {value: 'L'}],
      stockQuantity: 1,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "availableSizes",
  });

  async function onSubmit(values: z.infer<typeof productSchema>) {
    if (!firestore || !firebaseApp || !user) {
        toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to add a product.'});
        return;
    }
    setIsSubmitting(true);
    
    try {
      const storage = getStorage(firebaseApp);
      const imageFile = values.image[0] as File;
      const storageRef = ref(storage, `products/${Date.now()}_${imageFile.name}`);
      
      const uploadResult = await uploadBytes(storageRef, imageFile);
      const imageUrl = await getDownloadURL(uploadResult.ref);

      const productsCollection = collection(firestore, 'products');
      
      const productData = {
        name: values.name,
        description: values.description,
        price: values.price,
        category: values.category,
        availableSizes: values.availableSizes?.map(s => s.value),
        stockQuantity: values.stockQuantity,
        imageUrl: imageUrl,
      };

      addDoc(productsCollection, productData).catch(async (serverError) => {
          const permissionError = new FirestorePermissionError({
              path: productsCollection.path,
              operation: 'create',
              requestResourceData: productData,
          });
          errorEmitter.emit('permission-error', permissionError);
      });
      
      toast({
        title: 'Product Added',
        description: `${values.name} has been successfully added to the store.`,
      });
      form.reset();
    } catch (error) {
      console.error("Error adding product:", error);
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: 'Could not add the product. Please try again.',
      });
    } finally {
        setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Product</CardTitle>
        <CardDescription>Fill out the details below to add a new product to your store.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField control={form.control} name="name" render={({ field }) => ( <FormItem><FormLabel>Product Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
            <FormField control={form.control} name="description" render={({ field }) => ( <FormItem><FormLabel>Product Description</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem> )} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField control={form.control} name="price" render={({ field }) => ( <FormItem><FormLabel>Price</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem> )} />
                <FormField control={form.control} name="category" render={({ field }) => ( <FormItem><FormLabel>Category</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                <FormField control={form.control} name="stockQuantity" render={({ field }) => ( <FormItem><FormLabel>Stock Quantity</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem> )} />
            </div>

            <div>
                <FormLabel>Available Sizes</FormLabel>
                <div className="space-y-2 mt-2">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex items-center gap-2">
                     <FormField
                        control={form.control}
                        name={`availableSizes.${index}.value`}
                        render={({ field }) => (
                            <FormItem className="flex-grow">
                                <FormControl>
                                    <Input {...field} placeholder={`Size ${index + 1}`} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                    <Button type="button" variant="destructive" size="sm" onClick={() => remove(index)}>Remove</Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ value: "" })}
                >
                  Add Size
                </Button>
              </div>
            </div>

            <FormField
                control={form.control}
                name="image"
                render={({ field: { onChange, value, ...rest } }) => (
                <FormItem>
                    <FormLabel>Product Image</FormLabel>
                    <FormControl>
                        <Input 
                            type="file" 
                            accept="image/*"
                            onChange={(e) => onChange(e.target.files)}
                            {...rest}
                        />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? 'Adding Product...' : 'Add Product'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
