
'use client';

import { ProductForm } from '@/components/admin/product-form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProductList } from '@/components/admin/product-list';

export default function AdminPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold font-headline">Admin Panel</h1>
      </div>
      
       <Tabs defaultValue="manage-products">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manage-products">Manage Products</TabsTrigger>
          <TabsTrigger value="add-product">Add Product</TabsTrigger>
        </TabsList>
        <TabsContent value="manage-products" className="mt-6">
            <ProductList />
        </TabsContent>
        <TabsContent value="add-product" className="mt-6">
          <ProductForm product={null} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
