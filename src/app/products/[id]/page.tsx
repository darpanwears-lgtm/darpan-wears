
'use client';

import { useEffect, useState } from 'react';
import * as React from 'react';
import { notFound, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useFirestore, useMemoFirebase } from '@/firebase/provider';
import type { Product } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel"
import { ImageLightbox } from '@/components/image-lightbox';
import Link from 'next/link';


export default function ProductPage({ params }: { params: { id: string } }) {
  const { toast } = useToast();
  const router = useRouter();
  const firestore = useFirestore();

  const productRef = useMemoFirebase(
    () => (firestore ? doc(firestore, 'products', params.id) : null),
    [firestore, params.id]
  );
  const { data: product, isLoading } = useDoc<Product>(productRef);

  const [selectedSize, setSelectedSize] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);

  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)
  const [count, setCount] = useState(0)
 
  useEffect(() => {
    if (!api) {
      return
    }
 
    setCount(api.scrollSnapList().length)
    setCurrent(api.selectedScrollSnap())
 
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap())
    })
  }, [api])

  useEffect(() => {
    if (product) {
      setSelectedSize(product.availableSizes?.[0]);
      const MAX_HISTORY_LENGTH = 10;
      const history = JSON.parse(localStorage.getItem('viewingHistory') || '[]');
      const updatedHistory = [product.id, ...history.filter((id: string) => id !== product.id)].slice(0, MAX_HISTORY_LENGTH);
      localStorage.setItem('viewingHistory', JSON.stringify(updatedHistory));
    }
  }, [product]);

  if (isLoading) {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                <Skeleton className="aspect-square w-full rounded-lg" />
                <div className="flex flex-col justify-center space-y-4">
                    <Skeleton className="h-10 w-3/4" />
                    <Skeleton className="h-8 w-1/4" />
                    <Skeleton className="h-20 w-full" />
                    <div className="flex gap-2">
                        <Skeleton className="h-12 w-12 rounded-md" />
                        <Skeleton className="h-12 w-12 rounded-md" />
                        <Skeleton className="h-12 w-12 rounded-md" />
                    </div>
                     <Skeleton className="h-12 w-full" />
                </div>
            </div>
        </div>
    );
  }

  if (!product) {
    notFound();
  }

  const handleBuyNow = () => {
    if (product.availableSizes && !selectedSize) {
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
        <div>
           <Carousel setApi={setApi} className="w-full">
            <CarouselContent>
              {product.imageUrls.map((url, index) => (
                <CarouselItem key={index}>
                  <Card>
                    <CardContent className="relative flex aspect-square items-center justify-center p-0">
                      <ImageLightbox product={product} initialIndex={index}>
                        <Image
                              src={url}
                              alt={`${product.name} image ${index + 1}`}
                              fill
                              className="object-contain rounded-lg cursor-zoom-in"
                              data-ai-hint={product.imageHint}
                          />
                      </ImageLightbox>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
           <div className="py-2 text-center text-sm text-muted-foreground">
            Slide {current + 1} of {count}
          </div>
        </div>
        <div className="flex flex-col justify-center">
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
             {product.productLink && (
                <Button size="lg" variant="secondary" asChild className="w-full">
                    <Link href={product.productLink} target="_blank" rel="noopener noreferrer">View Original</Link>
                </Button>
            )}
            <Button size="lg" onClick={handleBuyNow} style={{ backgroundColor: 'orange', color: 'black', border: '2px solid black' }} className="w-full">Buy Now</Button>
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
