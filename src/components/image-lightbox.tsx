
'use client';

import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogClose,
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
import { X } from "lucide-react";

interface ImageLightboxProps {
  product: Product;
  initialIndex: number;
  children: React.ReactNode;
}

export function ImageLightbox({ product, initialIndex, children }: ImageLightboxProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-none w-screen h-screen bg-black/80 border-0 shadow-none flex items-center justify-center p-2">
        <Carousel
          opts={{
            startIndex: initialIndex,
            loop: true,
          }}
          className="w-full h-full max-w-6xl max-h-[90vh]"
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
          <CarouselPrevious className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 text-white bg-black/30 hover:bg-black/50 border-none" />
          <CarouselNext className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 text-white bg-black/30 hover:bg-black/50 border-none" />
        </Carousel>
        <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground text-white">
          <X className="h-6 w-6" />
          <span className="sr-only">Close</span>
        </DialogClose>
      </DialogContent>
    </Dialog>
  )
}
