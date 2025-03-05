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
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the supplier{" "}
                        <strong>{supplierName}</strong> and remove the data from our servers.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                        {isDeleting ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
