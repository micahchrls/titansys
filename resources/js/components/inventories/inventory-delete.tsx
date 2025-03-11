import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Inventory } from '@/types';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';

interface InventoryDeleteProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    inventories: Inventory[];
    selectedInventoryId: number | null;
}

export default function InventoryDelete({ open, onOpenChange, inventories, selectedInventoryId }: InventoryDeleteProps) {
    const selectedInventory = inventories.find((inventory) => inventory.id === selectedInventoryId);

    const handleDelete = () => {
        if (!selectedInventoryId) return;

        router.delete(route('inventories.destroy', selectedInventoryId), {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                onOpenChange(false);
                toast.success('Inventory deleted successfully');
            },
            onError: (errors) => {
                if (errors.message) {
                    toast.error(errors.message);
                } else {
                    toast.error('Failed to delete inventory.');
                }
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Delete Inventory</DialogTitle>
                    <DialogDescription>
                        This action cannot be undone. This will permanently delete the inventory item and remove all associated data from our servers.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    {selectedInventory ? (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between border-b pb-2">
                                <span className="text-muted-foreground text-sm">Product Name:</span>
                                <span className="font-medium">{selectedInventory.product_name}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground text-sm">SKU:</span>
                                <span className="font-medium">{selectedInventory.product_sku}</span>
                            </div>
                        </div>
                    ) : (
                        <div className="rounded-md bg-yellow-50 p-4">
                            <div className="flex">
                                <div className="text-yellow-700">The selected inventory item could not be found.</div>
                            </div>
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button type="button" variant="destructive" onClick={handleDelete} disabled={!selectedInventory}>
                        Delete
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
