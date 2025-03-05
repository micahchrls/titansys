import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Category } from "@/types";
import { router } from "@inertiajs/react";
import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { 
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue, 
} from "@/components/ui/select";

interface CategoryEditProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    categories: Category[];
    selectedCategoryId: number | null;
}

export function CategoryEdit({ open, onOpenChange, categories, selectedCategoryId }: CategoryEditProps) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedParentId, setSelectedParentId] = useState<string | null>(null);
    const [availableParents, setAvailableParents] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

    // Find the current category and set form values
    useEffect(() => {
        if (open && selectedCategoryId) {
            const category = categories.find((c) => c.id === selectedCategoryId);
            if (category) {
                setName(category.name);
                setDescription(category.description);
                setSelectedParentId(category.parent_id ? String(category.parent_id) : null);
                setSelectedCategory(category);
            }
        }
    }, [open, selectedCategoryId, categories]);

    // Filter available parent categories (exclude self and descendants)
    useEffect(() => {
        if (selectedCategory) {
            // Get all descendants of the selected category
            const getDescendantIds = (categoryId: number): number[] => {
                const directChildren = categories.filter(c => c.parent_id === categoryId);
                let descendants: number[] = directChildren.map(c => c.id);
                
                for (const child of directChildren) {
                    descendants = [...descendants, ...getDescendantIds(child.id)];
                }
                
                return descendants;
            };
            
            const descendantIds = getDescendantIds(selectedCategory.id);
            const selfAndDescendants = [selectedCategory.id, ...descendantIds];
            
            // Filter out self and descendants from available parents
            const filtered = categories.filter(c => !selfAndDescendants.includes(c.id));
            setAvailableParents(filtered);
        }
    }, [selectedCategory, categories]);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        router.put(
            `/categories/${selectedCategoryId}`,
            {
                name,
                description,
                parent_id: selectedParentId ? parseInt(selectedParentId) : null
            },
            {
                onSuccess: () => {
                    onOpenChange(false);
                    toast.success("Category updated successfully");
                    setIsSubmitting(false);
                },
                onError: (errors) => {
                    console.error(errors);
                    toast.error("Failed to update category");
                    setIsSubmitting(false);
                },
            }
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Edit Category</DialogTitle>
                        <DialogDescription>
                            Make changes to the category here. Click save when you're done.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="parent" className="text-right">
                                Parent Category
                            </Label>
                            <div className="col-span-3">
                                <Select 
                                    value={selectedParentId || ""} 
                                    onValueChange={setSelectedParentId}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="None (Top-level category)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">None (Top-level category)</SelectItem>
                                        {availableParents.map((category) => (
                                            <SelectItem key={category.id} value={String(category.id)}>
                                                {category.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                Name
                            </Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="description" className="text-right">
                                Description
                            </Label>
                            <Textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="col-span-3"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Saving..." : "Save changes"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
