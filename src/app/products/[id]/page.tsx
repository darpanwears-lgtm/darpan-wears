'use client';

import { useEffect } from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { products } from '@/lib/products';
import { Button } from '@/components/ui/button';
import { useCart } from '@/lib/cart-context';
import { useToast } from '@/hooks/use-toast';

export default function ProductPage({ params }: { params: { id: string } }) {
  const { addItem } = useCart();
  const { toast } = useToast();
  const product = products.find((p) => p.id === params.id);

  useEffect(() => {
    if (product) {
      const MAX_HISTORY_LENGTH = 10;
      const history = JSON.parse(localStorage.getItem('viewingHistory') || '[]');
      const updatedHistory = [product.id, ...history.filter((id: string) => id !== product.id)].slice(0, MAX_HISTORY_LENGTH);
      localStorage.setItem('viewingHistory', JSON.stringify(updatedHistory));
    }
  }, [product]);

  if (!product) {
    notFound();
  }

  const handleAddToCart = () => {
    addItem(product);
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        <div className="aspect-square w-full overflow-hidden rounded-lg bg-secondary">
          <Image
            src={product.image}
            alt={product.name}
            width={600}
            height={600}
            className="w-full h-full object-cover"
            data-ai-hint={product.imageHint}
          />
        </div>
        <div className="flex flex-col justify-center">
          <h1 className="text-3xl lg:text-4xl font-bold mb-2 font-headline">{product.name}</h1>
          <p className="text-2xl font-semibold mb-4 text-primary">${product.price.toFixed(2)}</p>
          <p className="text-muted-foreground mb-6">{product.description}</p>
          <div className="flex items-center gap-4">
            <Button size="lg" onClick={handleAddToCart} style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-foreground)' }}>Add to Cart</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
