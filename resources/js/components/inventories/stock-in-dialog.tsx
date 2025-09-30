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
import { useForm } from "@inertiajs/react";
import { useState, useEffect } from "react";
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
    const [error, setError] = useState<string | null>(null);

    // Use Inertia's useForm hook for better form management
    const { data, setData, post, processing, reset, errors } = useForm({
        quantity: '',
    });

    // Reset form when dialog opens/closes
    useEffect(() => {
        if (!open) {
            reset();
            setError(null);
        }
    }, [open, reset]);

    const handleStockIn = (e: React.FormEvent) => {
        e.preventDefault();
        
        const quantityValue = Number(data.quantity);
        if (!data.quantity || quantityValue <= 0) {
            setError('Please enter a valid quantity greater than 0');
            return;
        }

        setError(null);

        post(route('inventories.stock-in', inventoryId), {
            preserveState: true,
            preserveScroll: true,
            only: ['inventories', 'filters'],
            onSuccess: () => {
                toast.success('Stock added successfully');
                onOpenChange(false);
            },
            onError: (formErrors) => {
                if (formErrors.quantity) {
                    setError(formErrors.quantity);
                } else {
                    setError('Failed to add stock. Please try again.');
                }
            }
        });
    };

    const handleCancel = () => {
        reset();
        setError(null);
        onOpenChange(false);
    };

    return (
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
                <form onSubmit={handleStockIn}>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="quantity">
                                Quantity
                            </Label>
                            <Input
                                id="quantity"
                                type="number"
                                min="1"
                                value={data.quantity}
                                onChange={(e) => setData('quantity', e.target.value)}
                                placeholder="Enter quantity to add"
                                autoFocus
                            />
                            {(error || errors.quantity) && (
                                <div className="text-destructive text-sm">
                                    {error || errors.quantity}
                                </div>
                            )}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={handleCancel} disabled={processing} className="gap-2 hover:cursor-pointer">
                            Cancel
                        </Button>
                        <Button 
                            type="submit"
                            disabled={processing}
                            className="gap-2 bg-green-600 hover:bg-green-700 hover:cursor-pointer"
                        >
                            {processing && <Loader2 className="h-4 w-4 animate-spin" />}
                            Add Stock
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}