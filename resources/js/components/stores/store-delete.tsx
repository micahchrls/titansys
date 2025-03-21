import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Store } from '@/types/index';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';

interface StoreDeleteProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    stores: Store[];
    selectedStoreId: number | null;
}

export function StoreDelete({ open, onOpenChange, stores, selectedStoreId }: StoreDeleteProps) {
    const selectedStore = stores.find((store) => store.id === selectedStoreId);

    const handleDelete = () => {
        if (!selectedStoreId) return;

        router.delete(route('stores.destroy', selectedStoreId), {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                onOpenChange(false);
                toast.success('Store deleted successfully');
            },
            onError: (errors) => {
                if (errors.message) {
                    toast.error(errors.message);
                } else {
                    toast.error('Failed to delete store.');
                }
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Delete Store</DialogTitle>
                    <DialogDescription>
                        This action cannot be undone. This will permanently delete the store{" "}
                        <strong>{selectedStore?.name}</strong> and remove the data from our servers.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
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
