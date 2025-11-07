export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  imageHint?: string;
  availableSizes?: string[];
  stockQuantity: number;
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

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  address?: string;
  phone?: string;
}
