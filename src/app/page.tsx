'use client';

import { ProductCard } from '@/components/product-card';
import { Recommendations } from '@/components/recommendations';
import { useCollection } from '@/firebase';
import { collection } from 'firebase/firestore';
import { useFirestore, useMemoFirebase } from '@/firebase/provider';
import type { Product } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  const firestore = useFirestore();
  const productsCollection = useMemoFirebase(
    () => (firestore ? collection(firestore, 'products') : null),
    [firestore]
  );
  const { data: products, isLoading } = useCollection<Product>(productsCollection);

  return (
    <div
      className="container mx-auto px-4 py-8"
    >
      <section className="text-center mb-12 rounded-lg p-6 bg-black/50">
        <h1 className="text-4xl font-bold tracking-tight lg:text-5xl font-headline text-white">
          New Arrivals
        </h1>
        <p className="mt-4 text-lg text-gray-200">
          Check out the latest collection from Darpan Wears.
        </p>
      </section>

      <section id="all-products" className="rounded-lg p-6 bg-black/50">
        <h2 className="text-2xl font-bold mb-6 font-headline text-white">All Products</h2>
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex flex-col space-y-3">
                <Skeleton className="h-[250px] w-full rounded-xl bg-gray-700" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[200px] bg-gray-700" />
                  <Skeleton className="h-4 w-[150px] bg-gray-700" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products?.map((product: Product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      <Recommendations />
    </div>
  );
}
