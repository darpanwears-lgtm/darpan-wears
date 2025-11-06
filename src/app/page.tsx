
'use client';

import { useMemo, useState } from 'react';
import { ProductCard } from '@/components/product-card';
import { Recommendations } from '@/components/recommendations';
import { useCollection } from '@/firebase';
import { collection } from 'firebase/firestore';
import { useFirestore, useMemoFirebase } from '@/firebase/provider';
import type { Product } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';

export default function Home() {
  const firestore = useFirestore();
  const productsCollection = useMemoFirebase(
    () => (firestore ? collection(firestore, 'products') : null),
    [firestore]
  );
  const { data: productsFromDb, isLoading } = useCollection<Product>(productsCollection);

  const products = !isLoading && productsFromDb?.length === 0 ? PlaceHolderImages : productsFromDb;

  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');
  const [priceRange, setPriceRange] = useState([500]);
  
  const categories = useMemo(() => {
    if (!products) return [];
    const allCategories = products.map(p => p.category);
    return ['all', ...Array.from(new Set(allCategories))];
  }, [products]);

  const maxPrice = useMemo(() => {
    if (!products) return 100;
    return Math.max(...products.map(p => p.price), 100);
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    return products
      .filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter(product => 
        category === 'all' ? true : product.category === category
      )
      .filter(product =>
        product.price <= priceRange[0]
      );
  }, [products, searchTerm, category, priceRange]);


  return (
    <div className="flex flex-col flex-grow">
      <section className="relative h-[50vh] sm:h-[60vh] w-full flex items-center justify-center text-center text-white overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=2071&auto=format&fit=crop"
          alt="Fashion models"
          fill
          className="object-cover"
          data-ai-hint="fashion models"
          priority
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 p-4 flex flex-col items-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold font-headline mb-4 leading-tight">
            Style Redefined
          </h1>
          <Button asChild size="lg" style={{ backgroundColor: 'orange', color: 'black', border: '2px solid black' }}>
            <Link href="#all-products">Shop Now</Link>
          </Button>
        </div>
      </section>

      <div
        className="container mx-auto px-4 py-8"
        style={{
          flexGrow: 1,
        }}
      >
        <section className="text-center mb-8" id="all-products">
          <h2 className="text-3xl font-bold tracking-tight lg:text-4xl font-headline">
            Our Products
          </h2>
        </section>

        <section className="mb-8 p-4 border rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                    <Input 
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="md:col-span-1">
                     <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                            {categories.map(cat => (
                                <SelectItem key={cat} value={cat}>
                                    {cat === 'all' ? 'All Categories' : cat}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                 <div className="md:col-span-1 space-y-2">
                    <label className="text-sm font-medium">Price up to: <span className="font-bold">${priceRange[0]}</span></label>
                    <Slider 
                        min={0}
                        max={maxPrice}
                        step={1}
                        value={priceRange}
                        onValueChange={setPriceRange}
                    />
                </div>
            </div>
        </section>

        <section>
          {isLoading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 md:gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="flex flex-col space-y-3">
                  <Skeleton className="h-[150px] sm:h-[250px] w-full rounded-xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {filteredProducts.length > 0 ? (
                 <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 md:gap-6">
                  {filteredProducts.map((product: Product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                    <p className="text-muted-foreground">No products match your filters.</p>
                </div>
              )}
            </>
          )}
        </section>

        <Recommendations />
      </div>
    </div>
  );
}
