import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Supplier } from "@/types";
import { router } from "@inertiajs/react";
import { useState } from "react";
import { toast } from "sonner";

interface SupplierDeleteProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    suppliers: Supplier[];
    selectedSupplierId: number | null;
}

export function SupplierDelete({ open, onOpenChange, suppliers, selectedSupplierId }: SupplierDeleteProps) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = () => {
        if (!selectedSupplierId) return;
        
        setIsDeleting(true);
        router.delete(`/suppliers/${selectedSupplierId}`, {
            onSuccess: () => {
                onOpenChange(false);
                toast.success("Supplier deleted successfully");
                setIsDeleting(false);
            },
            onError: (errors) => {
                console.error(errors);
                toast.error("Failed to delete supplier");
                setIsDeleting(false);
            },
        });
    };

    const supplierName = suppliers.find((s) => s.id === selectedSupplierId)?.name || "";

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Are you absolutely sure?</DialogTitle>
                    <DialogDescription>
                        This action cannot be undone. This will permanently delete the supplier{" "}
                        <strong>{supplierName}</strong> and remove the data from our servers.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isDeleting}>
                        Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                        {isDeleting ? "Deleting..." : "Delete"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
