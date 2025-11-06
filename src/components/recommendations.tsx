'use client';

import { useEffect, useState } from 'react';
import { getPersonalizedRecommendations } from '@/ai/flows/personalized-product-recommendations';
import { products as allProducts, inventory } from '@/lib/products';
import { Product } from '@/lib/types';
import { ProductCard } from './product-card';
import { Skeleton } from './ui/skeleton';

export function Recommendations() {
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const viewingHistory = JSON.parse(localStorage.getItem('viewingHistory') || '[]');
        const purchaseHistory = JSON.parse(localStorage.getItem('purchaseHistory') || '[]');

        if (viewingHistory.length === 0 && purchaseHistory.length === 0) {
          setLoading(false);
          return;
        }

        const result = await getPersonalizedRecommendations({
          viewingHistory,
          purchaseHistory,
          inventoryLevels: inventory,
        });

        if (result.recommendations && result.recommendations.length > 0) {
          const recommendations = allProducts.filter(p => result.recommendations.includes(p.id));
          setRecommendedProducts(recommendations);
        }
      } catch (error) {
        console.error('Failed to fetch recommendations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  if (loading) {
    return (
        <section className="mt-12">
            <h2 className="text-2xl font-bold mb-6 font-headline">Recommended for You</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex flex-col space-y-3">
                        <Skeleton className="h-[250px] w-full rounded-xl" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-[200px]" />
                            <Skeleton className="h-4 w-[150px]" />
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
  }

  if (recommendedProducts.length === 0) {
    return null;
  }

  return (
    <section className="mt-12">
      <h2 className="text-2xl font-bold mb-6 font-headline">Recommended for You</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {recommendedProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
