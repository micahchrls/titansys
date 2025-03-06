import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Category } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from '@inertiajs/react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import * as z from 'zod';

const formSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().optional(),
});

interface CategorySubcategoryDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    parentCategoryId: number | null;
}

export function CategorySubcategoryDialog({ 
    open, 
    onOpenChange,
    parentCategoryId 
}: CategorySubcategoryDialogProps) {
    const [parentCategoryName, setParentCategoryName] = useState<string>('');
    
    // When the dialog opens, get the parent category name
    useEffect(() => {
        if (open && parentCategoryId) {
            // Get categories from the existing page props
            const pagePropsData = (window as any)?.route?.current?.data?.categories?.data;
            if (pagePropsData && Array.isArray(pagePropsData)) {
                // Find the parent category by ID
                const parentCategory = pagePropsData.find(
                    (cat: any) => cat.id === parentCategoryId
                );
                if (parentCategory) {
                    setParentCategoryName(parentCategory.name);
                }
            }
        }
    }, [open, parentCategoryId]);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            description: '',
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        if (!parentCategoryId) {
            toast.error('Parent category is required');
            return;
        }

        // Create subcategory with parent_id
        const formData = {
            ...values,
            parent_id: parentCategoryId
        };

        router.post(route('categories.store'), formData, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                onOpenChange(false);
                toast.success('Subcategory created successfully');
            },
            onError: (errors) => {
                if (errors.message) {
                    toast.error(errors.message);
                } else {
                    toast.error('Failed to create subcategory');
                }
            },
        });
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Subcategory</DialogTitle>
                    <DialogDescription>
                        Add a new subcategory to {parentCategoryName || 'the selected category'}.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Subcategory name" {...field} />
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
                                        <Textarea placeholder="Subcategory description" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="submit">Create Subcategory</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
