import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { router } from "@inertiajs/react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { ArrowUp, Loader2 } from "lucide-react";

interface StockOutDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    inventoryId: number;
    currentQuantity: number;
    onStockUpdated?: (updatedInventory: any) => void;
}

export function StockOutDialog({
    open,
    onOpenChange,
    inventoryId,
    currentQuantity,
    onStockUpdated
}: StockOutDialogProps) {
    const [quantity, setQuantity] = useState<number | ''>('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Reset form when dialog opens/closes
    useEffect(() => {
        if (!open) {
            setQuantity('');
            setError(null);
        }
    }, [open]);

    const handleStockOut = (e: React.FormEvent) => {
        e.preventDefault();

        if (quantity === '' || Number(quantity) <= 0) {
            setError('Please enter a valid quantity greater than 0');
            return;
        }

        if (Number(quantity) > currentQuantity) {
            setError(`Cannot remove more than the current quantity (${currentQuantity})`);
            return;
        }

        setError(null);
        setLoading(true);

        router.post(route('inventories.stock-out', inventoryId), {
            quantity: Number(quantity),
        }, {
            preserveState: true,
            preserveScroll: true,
            only: ['inventories', 'filters'],
            onSuccess: () => {
                toast.success('Stock removed successfully');
                setQuantity('');
                onOpenChange(false);
                setLoading(false);
            },
            onError: (errors) => {
                setLoading(false);
                setError(errors.quantity || 'Failed to remove stock. Please try again.');
            }
        });
    };

    const handleCancel = () => {
        setQuantity('');
        setError(null);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ArrowUp className="h-5 w-5 text-red-600" />
                        Stock Out
                    </DialogTitle>
                    <DialogDescription>
                        Remove stock from inventory. Enter the quantity to remove.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleStockOut}>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="quantity">
                                Quantity
                            </Label>
                            <Input
                                id="quantity"
                                type="number"
                                min="1"
                                max={currentQuantity}
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value ? Number(e.target.value) : '')}
                                placeholder={`Enter quantity to remove (max: ${currentQuantity})`}
                                autoFocus
                            />
                            {error && (
                                <div className="text-destructive text-sm">
                                    {error}
                                </div>
                            )}
                            <div className="text-muted-foreground text-xs">
                                Current stock: <span className="font-medium">{currentQuantity}</span> units
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={handleCancel} disabled={loading} className="gap-2 hover:cursor-pointer">
                            Cancel
                        </Button>
                        <Button 
                            type="submit"
                            disabled={loading}
                            className="gap-2 bg-red-600 hover:bg-red-700 hover:cursor-pointer"
                        >
                            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                            Remove Stock
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}