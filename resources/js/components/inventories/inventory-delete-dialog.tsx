import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { AlertTriangle } from 'lucide-react';
import { router } from '@inertiajs/react';

interface InventoryItem {
    id: number;
    product_name: string;
    product_sku: string;
    quantity: number;
}

interface InventoryDeleteDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    inventory: InventoryItem | null;
}

export function InventoryDeleteDialog({ 
    open, 
    onOpenChange, 
    inventory 
}: InventoryDeleteDialogProps) {
    
    const handleDelete = () => {
        if (inventory) {
            router.delete(route('inventories.destroy', inventory.id), {
                onSuccess: () => {
                    onOpenChange(false);
                    toast.success('Inventory item deleted successfully');
                    // Navigate back to inventory index
                    router.visit(route('inventories.index'));
                },
                onError: (errors) => {
                    toast.error('Failed to delete inventory item');
                    console.error(errors);
                }
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader className="flex flex-col items-center gap-2">
                    <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                        <AlertTriangle className="h-6 w-6 text-red-600" />
                    </div>
                    <DialogTitle>Delete Inventory Item</DialogTitle>
                    <DialogDescription className="text-center">
                        Are you sure you want to delete this inventory item? This action cannot be undone and will also delete all associated stock movement records.
                    </DialogDescription>
                </DialogHeader>
                
                {inventory && (
                    <div className="border rounded-md p-3 bg-muted/50">
                        <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">Product Name:</span>
                            <span className="text-sm font-medium">{inventory.product_name}</span>
                        </div>
                        <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">SKU:</span>
                            <span className="text-sm">{inventory.product_sku}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm font-medium">Quantity:</span>
                            <span className="text-sm">{inventory.quantity}</span>
                        </div>
                    </div>
                )}
                
                <DialogFooter className="gap-2 sm:gap-0">
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button type="button" variant="destructive" onClick={handleDelete}>
                        Delete
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
