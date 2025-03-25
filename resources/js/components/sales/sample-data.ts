import { Product } from "./types";

// Sample product data - in a real app, this would come from an API
export const sampleProducts: Product[] = [
  { id: 1, name: 'Brake Pads', price: 49.99, stock: 50, category: 'Brakes', image: 'https://images.unsplash.com/photo-1632761773688-a5a85507dd50?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3' },
  { id: 2, name: 'Oil Filter', price: 19.99, stock: 30, category: 'Filters', image: 'https://images.unsplash.com/photo-1635764759774-da05b1a77c4e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3' },
  { id: 3, name: 'Air Filter', price: 24.99, stock: 20, category: 'Filters' },
  { id: 4, name: 'Spark Plugs', price: 15.99, stock: 40, category: 'Ignition', image: 'https://images.unsplash.com/photo-1600674226402-96aa99b26b3e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3' },
  { id: 5, name: 'Battery', price: 99.99, stock: 15, category: 'Electrical' },
  { id: 6, name: 'Wiper Blades', price: 29.99, stock: 25, category: 'Exterior', image: 'https://images.unsplash.com/photo-1669739432571-aee1f057c41f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3' },
  { id: 7, name: 'Headlight Bulbs', price: 12.99, stock: 35, category: 'Electrical' },
  { id: 8, name: 'Brake Fluid', price: 9.99, stock: 45, category: 'Fluids', image: 'https://images.unsplash.com/photo-1600850056064-a8b380df8395?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3' },
];
