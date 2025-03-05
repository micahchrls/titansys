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
import { Category } from "@/types";

interface CategoryCreateProps {
    showModal: boolean;
    setShowModal: (show: boolean) => void;
    parentId?: number | null;
}

export default function CategoryCreate({ 
    showModal, 
    setShowModal,
    parentId = null 
}: CategoryCreateProps) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedParentId, setSelectedParentId] = useState<string | null>(
        parentId ? String(parentId) : null
    );

    // Fetch categories for parent selection
    useEffect(() => {
        if (showModal) {
            // Only fetch if we're not already specifying a parent
            if (parentId === null) {
                fetch('/api/categories')
                    .then(response => response.json())
                    .then(data => {
                        setCategories(data);
                    })
                    .catch(error => {
                        console.error('Error fetching categories:', error);
                    });
            }
        }
    }, [showModal, parentId]);

    // Reset form when dialog opens
    useEffect(() => {
        if (showModal) {
            setName("");
            setDescription("");
            setSelectedParentId(parentId ? String(parentId) : null);
        }
    }, [showModal, parentId]);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const formData = {
            name,
            description,
            parent_id: selectedParentId ? parseInt(selectedParentId) : null
        };

        router.post(
            "/categories",
            formData,
            {
                onSuccess: () => {
                    setShowModal(false);
                    setName("");
                    setDescription("");
                    setSelectedParentId(null);
                    toast.success(parentId ? "Subcategory created successfully" : "Category created successfully");
                    setIsSubmitting(false);
                },
                onError: (errors) => {
                    console.error(errors);
                    toast.error(parentId ? "Failed to create subcategory" : "Failed to create category");
                    setIsSubmitting(false);
                },
            }
        );
    };

    return (
        <Dialog open={showModal} onOpenChange={setShowModal}>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>
                            {parentId ? "Create Subcategory" : "Create Category"}
                        </DialogTitle>
                        <DialogDescription>
                            {parentId 
                                ? "Add a new subcategory to the selected parent category."
                                : "Add a new category to your system. Click save when you're done."
                            }
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        {!parentId && (
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
                                            {categories.map((category) => (
                                                <SelectItem key={category.id} value={String(category.id)}>
                                                    {category.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        )}
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
                            {isSubmitting ? "Creating..." : "Create"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
