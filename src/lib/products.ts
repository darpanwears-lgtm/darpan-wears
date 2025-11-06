import type { Product } from './types';
import { PlaceHolderImages } from './placeholder-images';

const getImage = (id: string) => {
  const image = PlaceHolderImages.find(img => img.id === id);
  if (!image) {
    return {
      url: 'https://picsum.photos/seed/placeholder/400/500',
      hint: 'placeholder image'
    };
  }
  return {
    url: image.imageUrl,
    hint: image.imageHint,
  }
};

export const products: Product[] = [
  {
    id: '1',
    name: 'Classic Black Tee',
    description: 'A timeless black t-shirt made from 100% premium cotton. Perfect for any occasion.',
    price: 29.99,
    category: 'T-Shirts',
    image: getImage('t-shirt-1').url,
    imageHint: getImage('t-shirt-1').hint,
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    id: '2',
    name: 'Urban Denim Jeans',
    description: 'Stylish and durable blue jeans, designed for comfort and a modern fit.',
    price: 89.99,
    category: 'Jeans',
    image: getImage('jeans-1').url,
    imageHint: getImage('jeans-1').hint,
    sizes: ['30', '32', '34', '36'],
  },
  {
    id: '3',
    name: 'Cozy Gray Hoodie',
    description: 'Stay warm and comfortable with our soft-touch gray hoodie. An essential for cooler days.',
    price: 59.99,
    category: 'Hoodies',
    image: getImage('hoodie-1').url,
    imageHint: getImage('hoodie-1').hint,
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    id: '4',
    name: 'Minimalist Sneakers',
    description: 'Clean white canvas sneakers that pair well with any outfit. Versatile and stylish.',
    price: 79.99,
    category: 'Shoes',
    image: getImage('sneakers-1').url,
    imageHint: getImage('sneakers-1').hint,
    sizes: ['8', '9', '10', '11'],
  },
  {
    id: '5',
    name: 'Rebel Leather Jacket',
    description: 'Make a statement with this classic black leather jacket. Built to last and always in style.',
    price: 199.99,
    category: 'Jackets',
    image: getImage('jacket-1').url,
    imageHint: getImage('jacket-1').hint,
    sizes: ['S', 'M', 'L'],
  },
  {
    id: '6',
    name: 'Everyday Baseball Cap',
    description: 'A simple yet stylish cap to complete your look. Available in multiple colors.',
    price: 24.99,
    category: 'Accessories',
    image: getImage('hat-1').url,
    imageHint: getImage('hat-1').hint,
  },
  {
    id: '7',
    name: 'Flowy Summer Dress',
    description: 'Light and airy, this summer dress is perfect for warm weather and sunny days.',
    price: 69.99,
    category: 'Dresses',
    image: getImage('dress-1').url,
    imageHint: getImage('dress-1').hint,
    sizes: ['XS', 'S', 'M', 'L'],
  },
  {
    id: '8',
    name: 'Chrono Digital Watch',
    description: 'A sleek and functional digital watch with a minimalist design.',
    price: 129.99,
    category: 'Accessories',
    image: getImage('watch-1').url,
    imageHint: getImage('watch-1').hint,
  },
];

export const inventory: Record<string, number> = {
  '1': 15,
  '2': 10,
  '3': 20,
  '4': 8,
  '5': 5,
  '6': 30,
  '7': 12,
  '8': 0, // Out of stock to test recommendations
};
