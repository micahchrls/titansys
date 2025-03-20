import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { AlertTriangle } from 'lucide-react';
import { router } from '@inertiajs/react';
import { Brand, Category, Store, Supplier, ProductImage, StockMovement } from '@/types';

interface InventoryItem {
    id: number;
    product_id: number;
    product_name: string;
    product_sku: string;
    product_description: string;
    product_price: number;
    product_size: string;
    product_category: string;
    product_brand: string;
    product_category_id: number;
    product_brand_id: number;
    supplier_id: number;
    store_id: number;
    quantity: number;
    reorder_level: number;
    last_restocked: string;
    image_url: string | null;
    product_image: ProductImage[];
    supplier: Supplier[];
    store: Store;
    stock_movement?: StockMovement[];
    created_at?: string;
    updated_at?: string;
}

interface InventoryDeleteDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    inventory: InventoryItem;
    onInventoryDeleted?: () => void;
}

export function InventoryDeleteDialog({ 
    open, 
    onOpenChange, 
    inventory, 
    onInventoryDeleted 
}: InventoryDeleteDialogProps) {
    
    const handleDelete = () => {
        if (inventory) {
            try {
                router.delete(route('inventories.destroy', { inventory: inventory.id }), {
                    onSuccess: () => {
                        toast.success('Inventory deleted successfully');
                        onOpenChange(false);
                        
                        // If callback is provided, call it instead of reloading
                        if (onInventoryDeleted) {
                            onInventoryDeleted();
                        } else {
                            // Fallback to redirect
                            setTimeout(() => {
                                window.location.href = route('inventories.index');
                            }, 1000);
                        }
                    },
                    onError: (errors) => {
                        toast.error('Failed to delete inventory item');
                        console.error(errors);
                    }
                });
            } catch (error) {
                console.error(error);
            }
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
