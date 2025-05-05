export interface Property {
  id: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  type: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  yearBuilt: number;
  description: string;
  status: string;
  images: string[];
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  name: string;
  price: number;
  quantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  userId: string;
  propertyId: string;
  status: string;
  total: number;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
  paymentStatus: string;
  rush: boolean;
  notes: string;
}
