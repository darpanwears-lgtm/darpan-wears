
'use client';

import { useMemo, useState, useEffect } from 'react';
import { ProductCard } from '@/components/product-card';
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
import { FilterSheet } from '@/components/filter-sheet';
import { Search } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import Autoplay from "embla-carousel-autoplay";
import { HowToOrderDialog } from '@/components/how-to-order-dialog';

const heroImages = [
    {
        src: "https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=2071&auto=format&fit=crop",
        alt: "Fashion models posing",
        hint: "fashion models"
    },
    {
        src: "https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?q=80&w=2070&auto=format&fit=crop",
        alt: "Man in stylish clothing",
        hint: "mens fashion"
    },
    {
        src: "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?q=80&w=1935&auto=format&fit=crop",
        alt: "Retail clothing rack",
        hint: "clothing store"
    }
]

export default function Home() {
  const firestore = useFirestore();
  const productsCollection = useMemoFirebase(
    () => (firestore ? collection(firestore, 'products') : null),
    [firestore]
  );
  const { data: productsFromDb, isLoading } = useCollection<Product>(productsCollection);

  const products = useMemo(() => {
    // If not loading and the database has products, use them.
    if (!isLoading && productsFromDb && productsFromDb.length > 0) {
      return productsFromDb;
    }
    // If not loading and database is empty, use placeholders.
    if (!isLoading && productsFromDb && productsFromDb.length === 0) {
      return PlaceHolderImages;
    }
    // While loading, return an empty array to avoid showing placeholders temporarily.
    return [];
  }, [isLoading, productsFromDb]);

  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');
  const [priceRange, setPriceRange] = useState([1000]);
  const [sortBy, setSortBy] = useState('default');
  
  const categories = useMemo(() => {
    if (!products) return [];
    const allCategories = products.map(p => p.category);
    return ['all', ...Array.from(new Set(allCategories))];
  }, [products]);

  const maxPrice = useMemo(() => {
    if (!products || products.length === 0) return 1000;
    return Math.max(...products.map(p => p.price), 1000);
  }, [products]);

  const filteredAndSortedProducts = useMemo(() => {
    if (!products) return [];
    
    let filtered = products
      .filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter(product => 
        category === 'all' ? true : product.category === category
      )
      .filter(product =>
        product.price <= priceRange[0]
      );
    
    switch (sortBy) {
        case 'price-asc':
            filtered.sort((a, b) => a.price - b.price);
            break;
        case 'price-desc':
            filtered.sort((a, b) => b.price - a.price);
            break;
        default:
            // No default sorting or keep original
            break;
    }

    return filtered;

  }, [products, searchTerm, category, priceRange, sortBy]);


  return (
    <div className="flex flex-col flex-grow">
      <section className="relative h-[50vh] sm:h-[60vh] w-full flex items-center justify-center text-center text-white overflow-hidden">
        <Carousel 
            className="absolute inset-0"
            plugins={[ Autoplay({ delay: 5000, stopOnInteraction: false }) ]}
            opts={{ loop: true }}
        >
            <CarouselContent>
                {heroImages.map((img, index) => (
                    <CarouselItem key={index}>
                        <Image
                            src={img.src}
                            alt={img.alt}
                            fill
                            className="object-cover"
                            data-ai-hint={img.hint}
                            priority={index === 0}
                        />
                    </CarouselItem>
                ))}
            </CarouselContent>
        </Carousel>
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 p-4 flex flex-col items-center">
            <Image src="https://i.postimg.cc/3wJPYWH2/20251106-223219.png" alt="Darpan Wears Logo" width={80} height={80} className="rounded-full mb-4" />
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold font-headline mb-4 leading-tight">
            Welcome to Darpan Wears
          </h1>
          <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" style={{ backgroundColor: 'orange', color: 'black', border: '2px solid black' }}>
                <Link href="#all-products">Shop Now</Link>
              </Button>
              <HowToOrderDialog />
          </div>
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
             <div className="flex items-center gap-4">
                <div className="flex-grow relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input 
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <div>
                    <FilterSheet 
                        categories={categories}
                        category={category}
                        onCategoryChange={setCategory}
                        priceRange={priceRange}
                        onPriceRangeChange={setPriceRange}
                        maxPrice={maxPrice}
                        sortBy={sortBy}
                        onSortByChange={setSortBy}
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
              {filteredAndSortedProducts.length > 0 ? (
                 <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 md:gap-6">
                  {filteredAndSortedProducts.map((product: Product) => (
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
      </div>
    </div>
  );
}
