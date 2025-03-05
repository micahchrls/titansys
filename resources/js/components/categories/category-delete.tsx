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
import { Category } from "@/types";
import { router } from "@inertiajs/react";
import { useState } from "react";
import { toast } from "sonner";

interface CategoryDeleteProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    categories: Category[];
    selectedCategoryId: number | null;
}

export function CategoryDelete({ open, onOpenChange, categories, selectedCategoryId }: CategoryDeleteProps) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = () => {
        if (!selectedCategoryId) return;
        
        setIsDeleting(true);
        router.delete(`/categories/${selectedCategoryId}`, {
            onSuccess: () => {
                onOpenChange(false);
                toast.success("Category deleted successfully");
                setIsDeleting(false);
            },
            onError: (errors) => {
                console.error(errors);
                toast.error("Failed to delete category");
                setIsDeleting(false);
            },
        });
    };

    const categoryName = categories.find((c) => c.id === selectedCategoryId)?.name || "";

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the category{" "}
                        <strong>{categoryName}</strong> and remove the data from our servers.
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
