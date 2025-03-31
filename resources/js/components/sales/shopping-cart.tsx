import EmptyCart from '@/components/sales/empty-cart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Loader2, ShoppingCart as ShoppingCartIcon } from 'lucide-react';

import { CartItem } from '@/components/sales/cart-item';
import { router } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';
import { CartItem as CartItemType } from './types';

interface ShoppingCartProps {
    cartItems: CartItemType[];
    onAddToCart: (item: CartItemType) => void;
    onRemoveFromCart: (itemId: number, removeAll?: boolean) => void;
}

export function ShoppingCart({ cartItems, onAddToCart, onRemoveFromCart }: ShoppingCartProps) {
    // Calculate total
    const cartTotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
    const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleCompleteOrder = () => {
        if (cartItems.length === 0) {
            toast.error('Your cart is empty. Add items before completing order.');
            return;
        }

        setIsSubmitting(true);

        router.post(
            route('sales.store'),
            {
                items: cartItems.map((item) => ({
                    store_id: item.store_id as number,
                    item_id: item.id,
                    quantity: item.quantity,
                })),
                total_price: cartTotal,
            },
            {
                onSuccess: () => {
                    // Close dialog and reset state
                    setIsDialogOpen(false);
                    setIsSubmitting(false);

                    // Redirect to sales index with URL parameters to trigger toast
                    const redirectUrl = route('sales.index') + `?success=true&items=${itemCount}&total=${cartTotal.toFixed(2)}`;

                    window.location.href = redirectUrl;
                },
                onError: (errors) => {
                    console.error(errors);
                    toast.error('There was an error processing your order', {
                        description: 'Please try again or contact support if the issue persists.',
                        duration: 5000,
                    });
                    setIsSubmitting(false);
                },
            },
        );
    };

    return (
        <Card className="mt-4 md:mt-0 md:w-[50%]">
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
                                    <CartItem key={item.id} item={item} onAdd={onAddToCart} onRemove={onRemoveFromCart} />
                                ))}
                            </div>
                        </ScrollArea>

                        <Separator className="my-4" />

                        <div className="space-y-4">
                            <div className="bg-muted flex items-center justify-between rounded-md p-4">
                                <span className="font-medium">Total Amount</span>
                                <span className="text-lg font-bold">₱ {cartTotal.toFixed(2)}</span>
                            </div>

                            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button className="mt-2 w-full" size="lg" disabled={cartItems.length === 0}>
                                        <ShoppingCartIcon className="mr-2 h-4 w-4" />
                                        Complete Order
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-md">
                                    <DialogHeader>
                                        <DialogTitle className="flex items-center">
                                            <ShoppingCartIcon className="text-primary mr-2 h-5 w-5" />
                                            Confirm Order
                                        </DialogTitle>
                                        <DialogDescription>Please review your order before confirming.</DialogDescription>
                                    </DialogHeader>

                                    <div className="my-4 max-h-[300px] space-y-3 overflow-auto pr-1">
                                        {cartItems.map((item) => (
                                            <div key={item.id} className="flex items-center justify-between border-b pb-2 text-sm">
                                                <span>
                                                    {item.name} × {item.quantity}
                                                </span>
                                                <span className="font-medium">₱{(item.price * item.quantity).toFixed(2)}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="bg-muted mb-4 flex items-center justify-between rounded-md p-3">
                                        <span className="font-medium">Total Amount</span>
                                        <span className="text-lg font-bold">₱{cartTotal.toFixed(2)}</span>
                                    </div>

                                    <DialogFooter className="flex-col gap-2 sm:flex-row">
                                        <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="sm:mt-0" disabled={isSubmitting}>
                                            Cancel
                                        </Button>
                                        <Button onClick={handleCompleteOrder} className="cursor-pointer gap-2" disabled={isSubmitting}>
                                            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                                            {isSubmitting ? 'Processing...' : 'Confirm Order'}
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
