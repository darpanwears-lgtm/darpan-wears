
'use client';

import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog"
import Image from "next/image";
import type { Product } from "@/lib/types";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { Card, CardContent } from "./ui/card";

interface ImageLightboxProps {
  product: Product;
  initialIndex: number;
  children: React.ReactNode;
}

export function ImageLightbox({ product, initialIndex, children }: ImageLightboxProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-4xl h-[80vh] bg-transparent border-0 shadow-none flex items-center justify-center p-2">
        <Carousel
          opts={{
            startIndex: initialIndex,
            loop: true,
          }}
          className="w-full h-full"
        >
          <CarouselContent className="h-full">
            {product.imageUrls.map((url, index) => (
              <CarouselItem key={index}>
                <Card className="h-full border-0 bg-transparent shadow-none">
                  <CardContent className="relative flex h-full items-center justify-center p-0">
                    <Image 
                      src={url} 
                      alt={`${product.name} image ${index + 1}`}
                      fill 
                      className="object-contain"
                    />
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 z-10 text-white bg-black/30 hover:bg-black/50 border-none" />
          <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 z-10 text-white bg-black/30 hover:bg-black/50 border-none" />
        </Carousel>
      </DialogContent>
    </Dialog>
  )
}
