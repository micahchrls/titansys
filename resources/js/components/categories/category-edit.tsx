import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Category } from '@/types/index';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

const formSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().optional(),
    parent_id: z
        .string()
        .nullable()
        .optional()
        .transform((val) => (val === '' || val === 'null' ? null : val)),
});

interface CategoryEditProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    categories: Category[];
    selectedCategoryId: number | null;
}

export function CategoryEdit({ open, onOpenChange, categories, selectedCategoryId }: CategoryEditProps) {
    // Helper function to find a category (either parent or child) by ID
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
    const [parentOptions, setParentOptions] = useState<Category[]>([]);
    
    // Load potential parent categories when dialog opens
    useEffect(() => {
        if (open) {
            // Only include top-level categories that are not the selected category
            // and not any of its children (to prevent circular references)
            const validParents = categories.filter(category => 
                category.id !== selectedCategoryId && 
                !(selectedCategory?.children?.some(child => child.id === category.id))
            );
            setParentOptions(validParents);
        }
    }, [open, selectedCategoryId, categories]);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: selectedCategory?.name || '',
            description: selectedCategory?.description || '',
            parent_id: selectedCategory?.parent_id ? String(selectedCategory.parent_id) : null,
        },
    });

    // Reset form when dialog opens/closes or selected category changes
    useEffect(() => {
        if (selectedCategoryId !== null) {
            const category = getCategory(selectedCategoryId);
            if (category) {
                form.reset({
                    name: category.name,
                    description: category.description || '',
                    parent_id: category.parent_id ? String(category.parent_id) : null,
                });
            }
        }
    }, [selectedCategoryId, open, categories]);

    function onSubmit(values: z.infer<typeof formSchema>) {
        if (!selectedCategoryId) return;

        router.put(route('categories.update', selectedCategoryId), values, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                onOpenChange(false);
                toast.success('Category updated successfully');
            },
            onError: (errors) => {
                if (errors.message) {
                    toast.error(errors.message);
                } else {
                    toast.error('Failed to update category');
                }
            },
        });
    }

    // Determine if this is a subcategory being edited
    const isSubcategory = selectedCategory?.parent_id !== null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <DialogHeader>
                            <DialogTitle>Edit {isSubcategory ? 'Subcategory' : 'Category'}</DialogTitle>
                            <DialogDescription>
                                Make changes to this {isSubcategory ? 'subcategory' : 'category'}.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter category name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Enter category description" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="parent_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Parent Category</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value !== null ? String(field.value) : 'null'}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select parent category (optional)" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="null">None (Top-level category)</SelectItem>
                                                {parentOptions.map((category) => (
                                                    <SelectItem key={category.id} value={String(category.id)}>
                                                        {category.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                Save Changes
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
