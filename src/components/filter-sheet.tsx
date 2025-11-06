
'use client';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Filter } from 'lucide-react';

interface FilterSheetProps {
    categories: string[];
    category: string;
    onCategoryChange: (value: string) => void;
    priceRange: number[];
    onPriceRangeChange: (value: number[]) => void;
    maxPrice: number;
}

export function FilterSheet({
    categories,
    category,
    onCategoryChange,
    priceRange,
    onPriceRangeChange,
    maxPrice
}: FilterSheetProps) {
  return (
    <Sheet>
        <SheetTrigger asChild>
            <Button variant="outline" className="w-full justify-start text-left font-normal">
                <Filter className="mr-2 h-4 w-4" />
                Filters
            </Button>
        </SheetTrigger>
        <SheetContent>
            <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <div className="grid gap-6 py-6">
                 <div>
                     <label className="text-sm font-medium mb-2 block">Category</label>
                     <Select value={category} onValueChange={onCategoryChange}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                            {categories.map(cat => (
                                <SelectItem key={cat} value={cat}>
                                    {cat === 'all' ? 'All Categories' : cat}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                 <div>
                    <label className="text-sm font-medium">Price up to: <span className="font-bold">${priceRange[0]}</span></label>
                    <Slider 
                        min={0}
                        max={maxPrice}
                        step={1}
                        value={priceRange}
                        onValueChange={onPriceRangeChange}
                        className="mt-2"
                    />
                </div>
            </div>
        </SheetContent>
    </Sheet>
  );
}
