'use client';

import Image from 'next/image';
import { ProductDetails } from './product-details';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { Product } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog"


interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {

  return (
    <Dialog>
      <Card className="flex flex-col overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
          <DialogTrigger asChild>
            <div className="flex-grow cursor-pointer">
              <CardHeader className="p-0">
                <div className="aspect-square w-full overflow-hidden">
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    width={400}
                    height={400}
                    className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                    data-ai-hint={product.imageHint}
                  />
                </div>
              </CardHeader>
              <CardContent className="p-4 flex-grow">
                <CardTitle className="text-base font-medium line-clamp-2">{product.name}</CardTitle>
              </CardContent>
            </div>
          </DialogTrigger>
        <CardFooter className="p-4 flex items-center justify-between">
          <p className="text-lg font-bold">
            ${product.price.toFixed(2)}
          </p>
          <DialogTrigger asChild>
            <Button>Buy</Button>
          </DialogTrigger>
        </CardFooter>
      </Card>
      <DialogContent className="max-w-4xl">
        <ProductDetails product={product} />
      </DialogContent>
    </Dialog>
  );
}
