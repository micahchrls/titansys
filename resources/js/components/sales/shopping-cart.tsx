import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CheckCircle, ShoppingCart as ShoppingCartIcon, Loader2 } from "lucide-react";
import EmptyCart from "@/components/sales/empty-cart";

import { CartItem as CartItemType } from "./types";
import { CartItem } from "@/components/sales/cart-item";
import { router } from "@inertiajs/react";
import { toast } from "sonner";
import { useState } from "react";


interface ShoppingCartProps {
  cartItems: CartItemType[];
  onAddToCart: (item: CartItemType) => void;
  onRemoveFromCart: (itemId: number, removeAll?: boolean) => void;
}

export function ShoppingCart({ cartItems, onAddToCart, onRemoveFromCart }: ShoppingCartProps) {
  // Calculate total
  const cartTotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCompleteOrder = () => {
    if (cartItems.length === 0) {
      toast.error("Your cart is empty. Add items before completing order.");
      return;
    }

    setIsSubmitting(true);
    
    router.post(route('sales.store'), {
      items: cartItems.map(item => ({
        store_id: item.store_id,
        item_id: item.id,
        quantity: item.quantity
      })),
      total_price: cartTotal,
    }, {
      onSuccess: () => {
        toast.success("Order completed successfully!");
        setIsDialogOpen(false);
        setIsSubmitting(false);
      },
      onError: (errors) => {
        console.error(errors);
        toast.error("There was an error processing your order");
        setIsSubmitting(false);
      }
    });
  };

  return (
    <Card className="md:w-[50%] mt-4 md:mt-0">
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
            <ScrollArea className="h-[calc(100vh-27rem)]">
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
                <span className="font-bold text-lg">₱ {cartTotal.toFixed(2)}</span>
              </div>
              
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    className="w-full mt-2" 
                    size="lg" 
                    disabled={cartItems.length === 0}
                  >
                    <ShoppingCartIcon className="mr-2 h-4 w-4" />
                    Complete Order
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center">
                      <ShoppingCartIcon className="mr-2 h-5 w-5 text-primary" />
                      Confirm Order
                    </DialogTitle>
                    <DialogDescription>
                      Please review your order before confirming.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="max-h-[300px] overflow-auto my-4 space-y-3 pr-1">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex justify-between items-center text-sm border-b pb-2">
                        <span>{item.name} × {item.quantity}</span>
                        <span className="font-medium">₱{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="bg-muted p-3 rounded-md mb-4 flex justify-between items-center">
                    <span className="font-medium">Total Amount</span>
                    <span className="font-bold text-lg">₱{cartTotal.toFixed(2)}</span>
                  </div>
                  
                  <DialogFooter className="flex-col sm:flex-row gap-2">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="sm:mt-0" disabled={isSubmitting}>
                      Cancel
                    </Button>
                    <Button onClick={handleCompleteOrder} className="gap-2 cursor-pointer" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle className="h-4 w-4" />
                      )}
                      {isSubmitting ? "Processing..." : "Confirm Order"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
