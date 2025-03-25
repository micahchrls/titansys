import { ScrollArea } from "@/components/ui/scroll-area";
import { Search } from "lucide-react";
import { ProductCard } from "./product-card";
import { Product } from "./types";

interface ProductGridProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
}

export function ProductGrid({ products, onAddToCart }: ProductGridProps) {
  return (
    <ScrollArea className="h-[calc(100vh-22rem)]">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 p-1">
        {products.map((product) => (
          <ProductCard 
            key={product.id} 
            product={product}
            onAddToCart={onAddToCart}
          />
        ))}
        
        {products.length === 0 && (
          <div className="col-span-full text-center text-muted-foreground py-8 border rounded-lg border-dashed mt-4">
            <Search className="h-10 w-10 text-muted-foreground mb-2 mx-auto" />
            <p className="font-medium">No products found</p>
            <p className="text-sm mt-1">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
