'use client';

import { useState } from 'react';
import * as React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { Product } from '@/lib/types';
import { DialogClose } from '@/components/ui/dialog';
import { useRouter } from 'next/navigation';
import { ScrollArea } from './ui/scroll-area';

interface ProductDetailsProps {
    product: Product;
}

export function ProductDetails({ product }: ProductDetailsProps) {
  const { toast } = useToast();
  const router = useRouter();

  const [selectedSize, setSelectedSize] = useState<string | undefined>(
    product?.availableSizes ? product.availableSizes[0] : undefined
  );
  const [error, setError] = useState<string | null>(null);


  if (!product) {
    return null;
  }

  const handleBuyNow = () => {
     if (product.availableSizes && !selectedSize) {
      setError('Please select a size.');
      return;
    }
    setError(null);
    const checkoutUrl = `/checkout?productId=${product.id}&size=${selectedSize || ''}`;
    router.push(checkoutUrl);
  }

  return (
    <ScrollArea className="max-h-[85vh]">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-start p-1">
            <div className="aspect-square w-full overflow-hidden rounded-lg bg-secondary md:sticky top-0">
              <Image
                  src={product.imageUrl}
                  alt={product.name}
                  width={600}
                  height={600}
                  className="w-full h-full object-cover"
                  data-ai-hint={product.imageHint}
              />
            </div>
            <div className="flex flex-col justify-center h-full">
                <h1 className="text-3xl lg:text-4xl font-bold mb-2 font-headline">{product.name}</h1>
                <p className="text-2xl font-semibold mb-4 text-primary">${product.price.toFixed(2)}</p>
                <p className="text-muted-foreground mb-6">{product.description}</p>
                
                {product.availableSizes && product.availableSizes.length > 0 && (
                    <div className="mb-6">
                    <Label className="text-base font-medium mb-3 block">Size</Label>
                    <RadioGroup
                        value={selectedSize}
                        onValueChange={setSelectedSize}
                        className="flex items-center gap-2"
                    >
                        {product.availableSizes.map((size) => (
                        <FormItem key={size}>
                            <RadioGroupItem value={size} id={`size-${size}-${product.id}`} className="sr-only" />
                            <Label
                            htmlFor={`size-${size}-${product.id}`}
                            className={cn(
                                "flex items-center justify-center rounded-md border-2 w-12 h-12 text-sm font-medium uppercase hover:bg-muted focus:outline-none cursor-pointer",
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

                <div className="flex items-center gap-4 mt-auto pt-4">
                    <DialogClose asChild>
                        <Button size="lg" variant="outline" className="w-full">Back</Button>
                    </DialogClose>
                    <DialogClose asChild>
                        <Button size="lg" onClick={handleBuyNow} style={{ backgroundColor: 'orange', color: 'black', border: '2px solid black' }} className="w-full">Buy Now</Button>
                    </DialogClose>
                </div>
            </div>
        </div>
    </ScrollArea>
  );
}

// Minimal FormItem for RadioGroup label association
const FormItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return <div ref={ref} className={cn(className)} {...props} />;
  }
);
FormItem.displayName = "FormItem";
