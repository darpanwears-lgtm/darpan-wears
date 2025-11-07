
'use client';

import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog"
import Image from "next/image";

interface ImageLightboxProps {
  imageUrl: string;
  alt: string;
  children: React.ReactNode;
}

export function ImageLightbox({ imageUrl, alt, children }: ImageLightboxProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-4xl h-[80vh] bg-transparent border-0 shadow-none flex items-center justify-center p-2">
        <div className="relative w-full h-full">
            <Image 
                src={imageUrl} 
                alt={alt} 
                fill 
                className="object-contain"
            />
        </div>
      </DialogContent>
    </Dialog>
  )
}
