'use client';

import { useEffect, useState } from 'react';
import * as React from 'react';
import { notFound, useRouter } from 'next/navigation';
import Image from 'next/image';
import { products } from '@/lib/products';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export default function ProductPage({ params }: { params: { id: string } }) {
  const { toast } = useToast();
  const router = useRouter();
  const product = products.find((p) => p.id === params.id);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(
    product?.sizes ? product.sizes[0] : undefined
  );
  const [error, setError] = useState<string | null>(null);

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

  const handleBuyNow = () => {
    if (product.sizes && !selectedSize) {
      setError('Please select a size.');
      return;
    }
    setError(null);
    const checkoutUrl = `/checkout?productId=${product.id}&size=${selectedSize || ''}`;
    router.push(checkoutUrl);
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
          
          {product.sizes && product.sizes.length > 0 && (
            <div className="mb-6">
              <Label className="text-base font-medium mb-3 block">Size</Label>
              <RadioGroup
                value={selectedSize}
                onValueChange={setSelectedSize}
                className="flex items-center gap-2"
              >
                {product.sizes.map((size) => (
                  <FormItem key={size}>
                    <RadioGroupItem value={size} id={`size-${size}`} className="sr-only" />
                    <Label
                      htmlFor={`size-${size}`}
                      className={cn(
                        "flex items-center justify-center rounded-md border-2 p-3 text-sm font-medium uppercase hover:bg-muted focus:outline-none cursor-pointer",
                        selectedSize === size
                          ? "bg-primary text-primary-foreground border-transparent"
                          : "bg-transparent"
                      )}
                    >
                      {size}
                    </Label>
                  </FormItem>
                ))}
              </RadioGroup>
              {error && <p className="text-sm font-medium text-destructive mt-2">{error}</p>}
            </div>
          )}

          <div className="flex items-center gap-4">
            <Button size="lg" onClick={handleBuyNow} style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-foreground)' }} className="w-full">Buy Now</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Minimal FormItem for RadioGroup label association
const FormItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return <div ref={ref} className={cn(className)} {...props} />;
  }
);
FormItem.displayName = "FormItem";
