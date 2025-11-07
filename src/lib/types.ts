
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrls: string[];
  category: string;
  imageHint?: string;
  availableSizes?: string[];
  stockQuantity: number;
}

export interface CartItem extends Product {
  quantity: number;
  size: string;
  // Note: This only uses the primary image.
  imageUrl: string;
}

export interface OrderItem {
  id: string;
  name: string;
  imageUrl: string;
  price: number;
  quantity: number;
  size: string;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  orderDate: number; // Stored as a timestamp
  shippingAddress: {
    name: string;
    address: string;
    phone: string;
  };
  rating?: number;
  review?: string;
}


export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  address?: string;
  phone?: string;
}
