import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Are you absolutely sure?</DialogTitle>
                    <DialogDescription>
                        This action cannot be undone. This will permanently delete the category{" "}
                        <strong>{categoryName}</strong> and remove the data from our servers.
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
