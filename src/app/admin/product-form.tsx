
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
import { addDoc, collection, doc, updateDoc } from 'firebase/firestore';
import { useFirestore, FirestorePermissionError, errorEmitter, useUser } from '@/firebase';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import type { Product } from '@/lib/types';

const productSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  description: z.string().min(10, { message: 'Description is too short.' }),
  price: z.coerce.number().min(0.01, { message: 'Price must be positive.' }),
  category: z.string().min(2, { message: 'Category is required.' }),
  availableSizes: z.array(z.object({ value: z.string().min(1, "Size can't be empty") })).optional(),
  stockQuantity: z.coerce.number().min(0, { message: 'Stock can\'t be negative.'}),
  imageUrls: z.array(z.object({ value: z.string().url({ message: 'Please enter a valid URL.' }) })).min(1, { message: 'At least one image URL is required.' }),
  productLink: z.string().url({ message: 'Please enter a valid URL.' }).optional().or(z.literal('')),
});

interface ProductFormProps {
    product?: Product;
    onSuccess?: () => void;
}

export function ProductForm({ product, onSuccess }: ProductFormProps) {
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const isEditMode = !!product;

  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      category: '',
      availableSizes: [{value: 'S'}, {value: 'M'}, {value: 'L'}],
      stockQuantity: 1,
      imageUrls: [{ value: '' }],
      productLink: '',
    },
  });

  useEffect(() => {
    if (isEditMode) {
      form.reset({
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        availableSizes: product.availableSizes?.map(s => ({ value: s })) || [],
        stockQuantity: product.stockQuantity,
        imageUrls: product.imageUrls.map(url => ({ value: url })),
        productLink: product.productLink || '',
      });
    }
  }, [product, isEditMode, form]);


  const { fields: sizeFields, append: appendSize, remove: removeSize } = useFieldArray({
    control: form.control,
    name: "availableSizes",
  });

  const { fields: imageFields, append: appendImage, remove: removeImage } = useFieldArray({
    control: form.control,
    name: "imageUrls",
  });

  async function onSubmit(values: z.infer<typeof productSchema>) {
    if (!firestore || !user) {
        toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to manage products.'});
        return;
    }
    setIsSubmitting(true);
    
    try {
      const productData = {
        name: values.name,
        description: values.description,
        price: values.price,
        category: values.category,
        availableSizes: values.availableSizes?.map(s => s.value),
        stockQuantity: values.stockQuantity,
        imageUrls: values.imageUrls.map(i => i.value),
        productLink: values.productLink,
      };

      if (isEditMode && product.id) {
          const productRef = doc(firestore, 'products', product.id);
          updateDoc(productRef, productData).catch(async (serverError) => {
              const permissionError = new FirestorePermissionError({
                  path: productRef.path,
                  operation: 'update',
                  requestResourceData: productData,
              });
              errorEmitter.emit('permission-error', permissionError);
          });
          toast({
            title: 'Product Updated',
            description: `${values.name} has been successfully updated.`,
          });

      } else {
         const productsCollection = collection(firestore, 'products');
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
      }

      if(onSuccess) onSuccess();

    } catch (error) {
      console.error("Error submitting product:", error);
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: `Could not ${isEditMode ? 'update' : 'add'} the product. Please try again.`,
      });
    } finally {
        setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditMode ? "Edit Product" : "Add New Product"}</CardTitle>
        <CardDescription>{isEditMode ? "Update the details for this product." : "Fill out the details below to add a new product to your store."}</CardDescription>
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
            
            <FormField control={form.control} name="productLink" render={({ field }) => ( <FormItem><FormLabel>Product Link (for Resellers)</FormLabel><FormControl><Input {...field} placeholder="https://original-product-url.com" /></FormControl><FormMessage /></FormItem> )} />

            <div className='grid md:grid-cols-2 gap-6'>
                <div>
                    <FormLabel>Available Sizes</FormLabel>
                    <div className="space-y-2 mt-2">
                    {sizeFields.map((field, index) => (
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
                        <Button type="button" variant="destructive" size="sm" onClick={() => removeSize(index)}>Remove</Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => appendSize({ value: "" })}
                    >
                      Add Size
                    </Button>
                  </div>
                </div>

                <div>
                    <FormLabel>Product Image URLs</FormLabel>
                    <div className="space-y-2 mt-2">
                    {imageFields.map((field, index) => (
                      <div key={field.id} className="flex items-center gap-2">
                         <FormField
                            control={form.control}
                            name={`imageUrls.${index}.value`}
                            render={({ field }) => (
                                <FormItem className="flex-grow">
                                    <FormControl>
                                        <Input {...field} placeholder={`Image URL ${index + 1}`} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                            />
                        <Button type="button" variant="destructive" size="sm" onClick={() => removeImage(index)}>Remove</Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => appendImage({ value: "" })}
                    >
                      Add Image
                    </Button>
                  </div>
                </div>
            </div>
            
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? (isEditMode ? 'Saving Changes...' : 'Adding Product...') : (isEditMode ? 'Save Changes' : 'Add Product')}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
