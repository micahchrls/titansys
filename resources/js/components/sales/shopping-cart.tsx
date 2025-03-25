import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart as ShoppingCartIcon } from "lucide-react";
import { CartItem as CartItemType } from "./types";
import { CartItem } from "./cart-item";

// Create an inline EmptyCart component instead of importing it
function EmptyCart() {
  return (
    <div className="flex flex-col items-center justify-center text-center p-6 border rounded-md border-dashed">
      <ShoppingCartIcon className="h-10 w-10 text-muted-foreground mb-2" />
      <p className="font-medium text-muted-foreground">Your cart is empty</p>
      <p className="text-sm text-muted-foreground mt-1">Add products to create an order</p>
    </div>
  );
}

interface ShoppingCartProps {
  cartItems: CartItemType[];
  onAddToCart: (item: CartItemType) => void;
  onRemoveFromCart: (itemId: number) => void;
}

export function ShoppingCart({ cartItems, onAddToCart, onRemoveFromCart }: ShoppingCartProps) {
  // Calculate total
  const cartTotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Card className="md:w-1/3 mt-4 md:mt-0">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center">
          <ShoppingCartIcon className="mr-2 h-5 w-5" />
          Cart ({itemCount} items)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {cartItems.length === 0 ? (
          <EmptyCart />
        ) : (
          <>
            <ScrollArea className="h-[calc(100vh-32rem)]">
              <div className="space-y-3">
                {cartItems.map((item) => (
                  <CartItem 
                    key={item.id}
                    item={item}
                    onAdd={onAddToCart}
                    onRemove={onRemoveFromCart}
                  />
                ))}
              </div>
            </ScrollArea>
            
            <Separator className="my-4" />
            
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-muted p-4 rounded-md">
                <span className="font-medium">Total Amount</span>
                <span className="font-bold text-lg">${cartTotal.toFixed(2)}</span>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="customer">Customer Name</Label>
                <Input id="customer" placeholder="Enter customer name" className="focus:border-primary" />
              </div>
              
              <Button 
                className="w-full mt-2" 
                size="lg" 
                disabled={cartItems.length === 0}
              >
                <ShoppingCartIcon className="mr-2 h-4 w-4" />
                Complete Order
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
