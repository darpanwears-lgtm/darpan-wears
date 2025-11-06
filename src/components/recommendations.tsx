'use client';

import { useEffect, useState } from 'react';
import { getPersonalizedRecommendations } from '@/ai/flows/personalized-product-recommendations';
import { Product } from '@/lib/types';
import { ProductCard } from './product-card';
import { Skeleton } from './ui/skeleton';
import { useCollection } from '@/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useFirestore, useMemoFirebase } from '@/firebase/provider';

export function Recommendations() {
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const firestore = useFirestore();

  const productsCollection = useMemoFirebase(
    () => (firestore ? collection(firestore, 'products') : null),
    [firestore]
  );
  
  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const viewingHistory = JSON.parse(localStorage.getItem('viewingHistory') || '[]');
        const purchaseHistory = JSON.parse(localStorage.getItem('purchaseHistory') || '[]');

        if (viewingHistory.length === 0 && purchaseHistory.length === 0) {
          setLoading(false);
          return;
        }

        // We can't pass inventory now as it's not available on the client
        const result = await getPersonalizedRecommendations({
          viewingHistory,
          purchaseHistory,
          inventoryLevels: {},
        });
        
        if (result && result.recommendations && result.recommendations.length > 0 && productsCollection) {
          const recommendedIds = result.recommendations.slice(0, 10); // Limit to 10 recommendations for query performance
          const q = query(productsCollection, where('__name__', 'in', recommendedIds));
          const querySnapshot = await getDocs(q);
          const recommendations: Product[] = [];
          querySnapshot.forEach((doc) => {
            recommendations.push({ id: doc.id, ...doc.data() } as Product);
          });
          setRecommendedProducts(recommendations);
        }
      } catch (error) {
        console.error('Failed to fetch recommendations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [productsCollection]);

  if (loading) {
    return (
        <section className="mt-12 p-6 rounded-lg bg-black/50 dark:bg-black/50">
            <h2 className="text-2xl font-bold mb-6 font-headline text-white dark:text-white">Recommended for You</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex flex-col space-y-3">
                        <Skeleton className="h-[250px] w-full rounded-xl bg-gray-700" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-[200px] bg-gray-700" />
                            <Skeleton className="h-4 w-[150px] bg-gray-700" />
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
    <section className="mt-12 p-6 rounded-lg bg-black/50 dark:bg-black/50">
      <h2 className="text-2xl font-bold mb-6 font-headline text-white dark:text-white">Recommended for You</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {recommendedProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
