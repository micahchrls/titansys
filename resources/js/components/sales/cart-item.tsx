import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Minus } from "lucide-react";
import { CartItem as CartItemType } from "./types";

interface CartItemProps {
  item: CartItemType;
  onAdd: (item: CartItemType) => void;
  onRemove: (itemId: number) => void;
}

export function CartItem({ item, onAdd, onRemove }: CartItemProps) {
  return (
    <div 
      className="flex items-center justify-between rounded-lg border p-3 hover:bg-accent/50 transition-colors"
    >
      <div className="flex-1 mr-4">
        <p className="font-medium">{item.name}</p>
        <Badge variant="secondary" className="mt-1 mb-1">{item.category}</Badge>
        <div className="flex items-center justify-between mt-1">
          <p className="text-sm text-muted-foreground">
            ${item.price.toFixed(2)} × {item.quantity}
          </p>
          <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Button 
          size="icon" 
          variant="outline"
          onClick={() => onRemove(item.id)}
          className="h-7 w-7"
        >
          <Minus className="h-3 w-3" />
        </Button>
        <span className="w-8 text-center font-medium">{item.quantity}</span>
        <Button 
          size="icon" 
          variant="outline"
          onClick={() => onAdd(item)}
          className="h-7 w-7"
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
