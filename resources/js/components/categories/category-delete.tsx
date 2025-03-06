import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Category } from '@/types/index';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';

interface CategoryDeleteProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    categories: Category[];
    selectedCategoryId: number | null;
}

export function CategoryDelete({ open, onOpenChange, categories, selectedCategoryId }: CategoryDeleteProps) {
    // Find the selected category from the categories array
    const getCategory = (id: number | null): Category | undefined => {
        if (!id) return undefined;
        
        // Search in top level categories
        for (const category of categories) {
            if (category.id === id) {
                return category;
            }
            
            // Search in subcategories if any
            if (category.children && category.children.length > 0) {
                const found = category.children.find(sub => sub.id === id);
                if (found) return found;
            }
        }
        
        return undefined;
    };
    
    const selectedCategory = getCategory(selectedCategoryId);
    
    // Check if the category has subcategories
    const hasSubcategories = selectedCategory?.children && selectedCategory.children.length > 0;

    const handleDelete = () => {
        if (!selectedCategoryId) return;

        router.delete(route('categories.destroy', selectedCategoryId), {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                onOpenChange(false);
                toast.success('Category deleted successfully');
            },
            onError: (errors) => {
                if (errors.message) {
                    toast.error(errors.message);
                } else {
                    toast.error('Failed to delete category.');
                }
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Delete Category</DialogTitle>
                    <DialogDescription>
                        This action cannot be undone. This will permanently delete{" "}
                        <strong>{selectedCategory?.name}</strong> and remove the data from our servers.
                    </DialogDescription>
                </DialogHeader>
                
                {hasSubcategories && (
                    <div className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 text-sm font-medium py-2 px-3 rounded-md my-2">
                        Note: This category has {selectedCategory?.children?.length} subcategories.
                        All subcategories will also be deleted.
                    </div>
                )}
                
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
