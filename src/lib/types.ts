import { StaticImageData } from "next/image";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  imageHint: string;
  sizes?: string[];
}

export interface CartItem extends Product {
  quantity: number;
  size: string;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  date: string;
  status: 'Processing' | 'Shipped' | 'Delivered';
}

export interface User {
  id: string;
  name: string;
  email: string;
}
