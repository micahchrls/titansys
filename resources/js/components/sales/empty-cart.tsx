import { ShoppingCart } from "lucide-react";

export default function EmptyCart() {
  return (
    <div className="flex flex-col items-center justify-center text-center p-6 border rounded-md border-dashed">
      <ShoppingCart className="h-10 w-10 text-muted-foreground mb-2" />
      <p className="font-medium text-muted-foreground">Your cart is empty</p>
      <p className="text-sm text-muted-foreground mt-1">Add products to create an order</p>
    </div>
  );
}
