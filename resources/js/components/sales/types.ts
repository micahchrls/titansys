export interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  image?: string;
  category: string;
}

export interface CartItem extends Product {
  quantity: number;
}
