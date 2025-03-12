import React from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { router } from '@inertiajs/react';

interface InventoryItem {
    id: number;
    product_id: number;
    product_name: string;
    product_sku: string;
    product_description: string;
    product_price: number;
    product_size: string;
    product_category: string;
    product_brand: string;
    supplier_name: string;
    quantity: number;
    reorder_level: number;
    last_restocked: string;
    image_url: string | null;
}

const formSchema = z.object({
    product_name: z.string().min(1, 'Product name is required'),
    product_sku: z.string().min(1, 'SKU is required'),
    product_description: z.string().optional(),
    product_price: z.coerce.number().positive('Price must be positive'),
    product_size: z.string().optional(),
    product_category: z.string().min(1, 'Category is required'),
    product_brand: z.string().min(1, 'Brand is required'),
    supplier_name: z.string().min(1, 'Supplier is required'),
    quantity: z.coerce.number().min(0, 'Quantity cannot be negative'),
    reorder_level: z.coerce.number().min(0, 'Reorder level cannot be negative'),
});

interface InventoryEditDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    inventory: InventoryItem | null;
}

export function InventoryEditDialog({ 
    open, 
    onOpenChange, 
    inventory 
}: InventoryEditDialogProps) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            product_name: inventory?.product_name || '',
            product_sku: inventory?.product_sku || '',
            product_description: inventory?.product_description || '',
            product_price: inventory?.product_price || 0,
            product_size: inventory?.product_size || '',
            product_category: inventory?.product_category || '',
            product_brand: inventory?.product_brand || '',
            supplier_name: inventory?.supplier_name || '',
            quantity: inventory?.quantity || 0,
            reorder_level: inventory?.reorder_level || 0,
        },
    });

    React.useEffect(() => {
        if (inventory) {
            form.reset({
                product_name: inventory.product_name,
                product_sku: inventory.product_sku,
                product_description: inventory.product_description,
                product_price: inventory.product_price,
                product_size: inventory.product_size,
                product_category: inventory.product_category,
                product_brand: inventory.product_brand,
                supplier_name: inventory.supplier_name,
                quantity: inventory.quantity,
                reorder_level: inventory.reorder_level,
            });
        }
    }, [inventory, form]);

    function onSubmit(values: z.infer<typeof formSchema>) {
        // In a real app, use Inertia to submit to controller
        if (inventory) {
            try {
                // First update with toast notification
                toast.success('Inventory item updated successfully');
                onOpenChange(false);
                
                // Then send the request
                router.put(route('inventories.update', inventory.id), values, {
                    onSuccess: () => {
                        // No need for another toast since we already showed one
                        // Just reload the page to reflect changes
                        router.reload();
                    },
                    onError: (errors) => {
                        toast.error('Failed to update inventory item');
                        console.error(errors);
                    },
                    // Preserve the form state during navigation
                    preserveState: true
                });
            } catch (error) {
                console.error('Error updating inventory:', error);
                toast.error('Failed to update inventory item');
            }
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Edit Inventory Item</DialogTitle>
                    <DialogDescription>
                        Update the details of this inventory item. Click save when you're done.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="product_name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Product Name</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="product_sku"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>SKU</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        
                        <FormField
                            control={form.control}
                            name="product_description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea 
                                            placeholder="Product description..."
                                            className="resize-none"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="product_price"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Price</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.01" min="0" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="product_size"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Size</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="product_category"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Category</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="product_brand"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Brand</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        
                        <FormField
                            control={form.control}
                            name="supplier_name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Supplier</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="quantity"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Quantity</FormLabel>
                                        <FormControl>
                                            <Input type="number" min="0" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="reorder_level"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Reorder Level</FormLabel>
                                        <FormControl>
                                            <Input type="number" min="0" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button type="submit">Save Changes</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
