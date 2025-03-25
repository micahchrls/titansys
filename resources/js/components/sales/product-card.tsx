import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ImageIcon, ShoppingCart } from "lucide-react";
import { Product } from "./types";

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  return (
    <div className="h-auto">
      <Card className="overflow-hidden border shadow-sm h-full transition-all hover:shadow-md">
        <div className="relative bg-muted h-44">
          {product.image ? (
            <img 
              src={product.image} 
              alt={product.name}
              className="h-full w-full object-cover"
              onError={(e) => {
                // Fallback to placeholder if image fails to load
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement!.querySelector('div')!.style.display = 'flex';
              }}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted">
              <ImageIcon className="h-12 w-12 text-muted-foreground opacity-50" />
            </div>
          )}
          <Badge variant={product.stock > 10 ? "success" : "danger"} className="absolute top-2 right-2 text-xs">
            {product.stock} in stock
          </Badge>
        </div>
        <CardContent className="p-4">
          <h3 className="font-medium text-foreground mb-1">{product.name}</h3>
          <Badge variant="secondary" className="mb-2 text-xs">
            {product.category}
          </Badge>
          <div className="mt-2 mb-3">
            <span className="font-bold text-lg">₱{product.price.toFixed(2)}</span>
          </div>
          <Button 
            className="w-full hover:bg-white hover:text-black hover:cursor-pointer" 
            size="sm"
            variant="outline"
            onClick={() => onAddToCart(product)}
            disabled={product.stock === 0}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Add to Cart
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
