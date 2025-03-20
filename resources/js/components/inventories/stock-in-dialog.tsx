import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { router } from "@inertiajs/react";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowDown, Loader2 } from "lucide-react";

interface StockInDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    inventoryId: number;
    onStockUpdated?: (updatedInventory: any) => void;
}

export function StockInDialog({ 
    open, 
    onOpenChange, 
    inventoryId,
    onStockUpdated
}: StockInDialogProps) {
    const [quantity, setQuantity] = useState<number | ''>('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showConfirmation, setShowConfirmation] = useState(false);

    const handleInitiateStockIn = () => {
        if (quantity === '' || Number(quantity) <= 0) {
            setError('Please enter a valid quantity greater than 0');
            return;
        }

        setError(null);
        setShowConfirmation(true);
    };

    const handleStockIn = () => {
        setLoading(true);
        setError(null);

        router.post(route('inventories.stock-in', inventoryId), {
            quantity: Number(quantity),
        }, {
            onSuccess: () => {
                toast.success('Stock added successfully');
                setQuantity('');
                onOpenChange(false);
                setLoading(false);
                setShowConfirmation(false);
                
                // If a callback was provided, fetch the updated inventory
                if (onStockUpdated) {
                    router.get(route('inventories.show', inventoryId), {}, {
                        onSuccess: (page) => {
                            onStockUpdated(page.props.inventory);
                        },
                        preserveState: true,
                    });
                } else {
                    // Just reload the page to reflect changes
                    router.reload();
                }
            },
            onError: (errors) => {
                setLoading(false);
                setShowConfirmation(false);
                setError(errors.quantity || 'Failed to add stock. Please try again.');
            }
        });
    };

    const handleCancel = () => {
        setQuantity('');
        setError(null);
        onOpenChange(false);
    };

    const handleCancelConfirmation = () => {
        setShowConfirmation(false);
    };

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <ArrowDown className="h-5 w-5 text-green-600" />
                            Stock In
                        </DialogTitle>
                        <DialogDescription>
                            Add stock to inventory. Enter the quantity to add.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="quantity">
                                Quantity
                            </Label>
                            <Input
                                id="quantity"
                                type="number"
                                min="1"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value ? Number(e.target.value) : '')}
                                placeholder="Enter quantity to add"
                            />
                            {error && (
                                <div className="text-destructive text-sm">
                                    {error}
                                </div>
                            )}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={handleCancel} disabled={loading} className="gap-2 hover:cursor-pointer">
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleInitiateStockIn} 
                            disabled={loading}
                            className="gap-2 hover:cursor-pointer"
                        >
                            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                            Proceed
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Stock Addition</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to add <span className="font-bold">{quantity}</span> units to inventory?
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={handleCancelConfirmation} disabled={loading} className="hover:cursor-pointer">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={handleStockIn} 
                            disabled={loading}
                            className="gap-2 hover:cursor-pointer"
                        >
                            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                            Confirm
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}