
'use client';

import { useState, useEffect } from 'react';
import * as React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { Product } from '@/lib/types';
import { DialogClose, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from './ui/scroll-area';
import { Card, CardContent } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel"
import { ImageLightbox } from './image-lightbox';
import Link from 'next/link';
import { CheckoutDialog } from './checkout-dialog';

interface ProductDetailsProps {
    product: Product;
}

export function ProductDetails({ product }: ProductDetailsProps) {
  const [selectedSize, setSelectedSize] = useState<string | undefined>(
    product?.availableSizes ? product.availableSizes[0] : undefined
  );
  const [error, setError] = useState<string | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

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


  if (!product) {
    return null;
  }

  const handleBuyNow = () => {
     if (product.availableSizes && product.availableSizes.length > 0 && !selectedSize) {
      setError('Please select a size.');
      return;
    }
    setError(null);
    setIsCheckoutOpen(true);
  }

  return (
    <>
    <ScrollArea className="max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="sr-only">{product.name}</DialogTitle>
          <DialogDescription className="sr-only">{product.description}</DialogDescription>
        </DialogHeader>
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-start p-1">
            <div className="w-full md:sticky top-0">
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
                    {product.productLink ? (
                      <Button size="lg" variant="secondary" asChild className="w-full">
                        <Link href={product.productLink} target="_blank">View Original</Link>
                      </Button>
                    ) : (
                       <DialogClose asChild>
                        <Button size="lg" variant="outline" className="w-full">Back</Button>
                      </DialogClose>
                    )}
                    
                    <Button size="lg" onClick={handleBuyNow} style={{ backgroundColor: 'orange', color: 'black', border: '2px solid black' }} className="w-full">Buy Now</Button>
                    
                </div>
            </div>
        </div>
    </ScrollArea>
     {product && (
        <CheckoutDialog 
            open={isCheckoutOpen}
            onOpenChange={setIsCheckoutOpen}
            product={product}
            selectedSize={selectedSize}
        />
      )}
    </>
  );
}

// Minimal FormItem for RadioGroup label association
const FormItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return <div ref={ref} className={cn(className)} {...props} />;
  }
);
FormItem.displayName = "FormItem";

