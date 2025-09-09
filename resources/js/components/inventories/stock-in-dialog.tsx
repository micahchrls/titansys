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
    const [showConfirmation, setShowConfirmation] = useState(false);
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
            setShowConfirmation(false);
        }
    }, [open, reset]);

    const handleInitiateStockIn = () => {
        const quantityValue = Number(data.quantity);
        if (!data.quantity || quantityValue <= 0) {
            setError('Please enter a valid quantity greater than 0');
            return;
        }

        setError(null);
        setShowConfirmation(true);
    };

    const handleStockIn = () => {
        post(route('inventories.stock-in', inventoryId), {
            preserveState: true,
            preserveScroll: true,
            onSuccess: (page) => {
                toast.success('Stock added successfully');
                onOpenChange(false);
                setShowConfirmation(false);
                
                // If a callback was provided, call it with updated data
                if (onStockUpdated && page.props.inventory) {
                    onStockUpdated(page.props.inventory);
                }
            },
            onError: (formErrors) => {
                setShowConfirmation(false);
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
                                value={data.quantity}
                                onChange={(e) => setData('quantity', e.target.value)}
                                placeholder="Enter quantity to add"
                            />
                            {(error || errors.quantity) && (
                                <div className="text-destructive text-sm">
                                    {error || errors.quantity}
                                </div>
                            )}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={handleCancel} disabled={processing} className="gap-2 hover:cursor-pointer">
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleInitiateStockIn} 
                            disabled={processing}
                            className="gap-2 hover:cursor-pointer"
                        >
                            {processing && <Loader2 className="h-4 w-4 animate-spin" />}
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
                            Are you sure you want to add <span className="font-bold">{data.quantity}</span> units to inventory?
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={handleCancelConfirmation} disabled={processing} className="hover:cursor-pointer">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={handleStockIn} 
                            disabled={processing}
                            className="gap-2 hover:cursor-pointer"
                        >
                            {processing && <Loader2 className="h-4 w-4 animate-spin" />}
                            Confirm
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}