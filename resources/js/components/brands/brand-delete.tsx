import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Brand } from '@/types/index';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';

interface BrandDeleteProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    brands: Brand[];
    selectedBrandId: number | null;
}

export function BrandDelete({ open, onOpenChange, brands, selectedBrandId }: BrandDeleteProps) {
    const selectedBrand = brands.find((brand) => brand.id === selectedBrandId);

    const handleDelete = () => {
        if (!selectedBrandId) return;

        router.delete(route('brands.destroy', selectedBrandId), {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                onOpenChange(false);
                toast.success('Brand deleted successfully');
            },
            onError: (errors) => {
                if (errors.message) {
                    toast.error(errors.message);
                } else {
                    toast.error('Failed to delete brand.');
                }
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Delete Brand</DialogTitle>
                    <DialogDescription>
                        This action cannot be undone. This will permanently delete the brand{" "}
                        <strong>{selectedBrand?.name}</strong> and remove the data from our servers.
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
