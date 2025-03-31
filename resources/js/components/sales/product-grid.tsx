import { ScrollArea } from "@/components/ui/scroll-area";
import { Search } from "lucide-react";
import { ProductCard } from "@/components/sales/product-card";

import { Product } from '@/types/index';
import { CartItem } from './types';

interface ProductGridProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  cartItems: CartItem[];
}

export function ProductGrid({ products, onAddToCart, cartItems }: ProductGridProps) {
  // Filter out products with zero or negative stock quantity
  const availableProducts = products.filter(product => {
    const stockQuantity = product.quantity || 0;
    const productInCart = cartItems.find((item) => item.id === product.id);
    const quantityInCart = productInCart ? productInCart.quantity : 0;
    
    // Only show products that have stock available (considering cart quantities)
    return (stockQuantity - quantityInCart) > 0;
  });

  return (
    <ScrollArea className="h-[calc(100vh-22rem)]">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 p-1">
        {availableProducts.map((product) => (
          <ProductCard 
            key={product.id} 
            product={product}
            onAddToCart={onAddToCart}
            cartItems={cartItems}
          />
        ))}
        
        {availableProducts.length === 0 && ( 
          <div className="col-span-full text-center text-muted-foreground py-8 border rounded-lg border-dashed mt-4 min-h-[300px] flex items-center justify-center">
            <div>
              <Search className="h-10 w-10 text-muted-foreground mb-2 mx-auto" />
              <p className="font-medium">No products found</p>
              <p className="text-sm mt-1">Try adjusting your search or filter criteria</p>
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
