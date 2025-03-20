import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Brand, Category, Store, Supplier } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from '@inertiajs/react';
import { Trash } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { FileUpload } from '../ui/file-upload';

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
    product_category_id: number;
    product_brand_id: number;
    supplier_id: number;
    store_id: number;
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
    product_category_id: z.coerce.number().positive('Category is required'),
    product_brand_id: z.coerce.number().positive('Brand is required'),
    supplier_id: z.coerce.number().positive('Supplier is required'),
    store_id: z.coerce.number().positive('Store is required'),
    quantity: z.coerce.number().min(0, 'Quantity cannot be negative'),
    reorder_level: z.coerce.number().min(0, 'Reorder level cannot be negative'),
    image: z.instanceof(File).optional(),
});

interface InventoryEditDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    inventory: InventoryItem | null;
    brands: Brand[];
    categories: Category[];
    suppliers: Supplier[];
    stores: Store[];
}

export function InventoryEditDialog({ open, onOpenChange, inventory, brands, categories, suppliers, stores }: InventoryEditDialogProps) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            product_name: inventory?.product_name || '',
            product_sku: inventory?.product_sku || '',
            product_description: inventory?.product_description || '',
            product_price: inventory?.product_price || 0,
            product_size: inventory?.product_size || '',
            product_category_id: inventory?.product_category_id || 0,
            product_brand_id: inventory?.product_brand_id || 0,
            supplier_id: inventory?.supplier_id || 0,
            store_id: inventory?.store_id || 0,
            quantity: inventory?.quantity || 0,
            reorder_level: inventory?.reorder_level || 0,
        },
    });

    // Log inventory data when component mounts
    useEffect(() => {
        if (inventory) {
            console.log('Inventory data for edit dialog:', inventory);
            console.log('Supplier ID:', inventory.supplier_id);
            console.log('Store ID:', inventory.store_id);
            console.log('Category ID:', inventory.product_category_id);
            console.log('Brand ID:', inventory.product_brand_id);
        }
    }, [inventory]);

    useEffect(() => {
        if (inventory) {
            console.log('Resetting form with inventory data:', inventory);
            form.reset({
                product_name: inventory.product_name,
                product_sku: inventory.product_sku,
                product_description: inventory.product_description,
                product_price: inventory.product_price,
                product_size: inventory.product_size,
                product_category_id: inventory.product_category_id,
                product_brand_id: inventory.product_brand_id,
                supplier_id: inventory.supplier_id,
                store_id: inventory.store_id,
                quantity: inventory.quantity,
                reorder_level: inventory.reorder_level,
            });
        }
    }, [inventory, form]);


    const [imagePreview, setImagePreview] = useState<string | null>(
        inventory?.product_image ? `${window.location.origin}/storage/${inventory.product_image.file_path}` : null
    );

    console.log('Inventory: ', inventory);

    const handleImageChange = (files: File[]) => {
        if (files.length > 0) {
            const file = files[0]; // Only use the first file
            form.setValue('image', file);

            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        form.setValue('image', undefined);
        setImagePreview(null);
    };

    // Effect to initialize select fields when the dialog opens
    useEffect(() => {
        if (open && inventory) {
            console.log('Dialog opened, initializing select fields');

            // Force a small delay to ensure the form is ready
            setTimeout(() => {
                // Set IDs directly
                if (inventory.supplier_id) {
                    console.log('Setting supplier_id on dialog open:', inventory.supplier_id);
                    form.setValue('supplier_id', inventory.supplier_id);
                }

                if (inventory.store_id) {
                    console.log('Setting store_id on dialog open:', inventory.store_id);
                    form.setValue('store_id', inventory.store_id);
                }

                if (inventory.product_category_id) {
                    console.log('Setting product_category_id on dialog open:', inventory.product_category_id);
                    form.setValue('product_category_id', inventory.product_category_id);
                }

                if (inventory.product_brand_id) {
                    console.log('Setting product_brand_id on dialog open:', inventory.product_brand_id);
                    form.setValue('product_brand_id', inventory.product_brand_id);
                }

                // Force a form state update
                form.trigger();
            }, 100);
        }
    }, [open, inventory, form]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-5xl sm:max-w-5xl">
                <DialogHeader>
                    <DialogTitle>Edit Inventory Item</DialogTitle>
                    <DialogDescription>Update the details of this inventory item. Click save when you're done.</DialogDescription>
                </DialogHeader>
                <div className="border-muted-foreground text-muted-foreground mb-4 rounded border-2 border-dashed px-4 py-3">
                    <p className="text-sm">
                        Note: This form is for editing product details only. Stock quantity adjustments should be performed through the inventory
                        movement functionality.
                    </p>
                </div>
                <Form {...form}>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();

                            // Validate form before submission
                            form.trigger().then((isValid) => {
                                if (!isValid) {
                                    console.error('Form validation failed');
                                    toast.error('Please fill in all required fields correctly');
                                    return;
                                }

                                const values = form.getValues();
                                console.log('Form submitted with values:', values);

                                // Check if any required fields are missing or empty
                                const requiredFields = [
                                    'product_name',
                                    'product_sku',
                                    'product_price',
                                    'product_category_id',
                                    'product_brand_id',
                                    'supplier_id',
                                    'store_id',
                                    'quantity',
                                    'reorder_level',
                                ];

                                const missingFields = requiredFields.filter((field) => {
                                    const value = values[field as keyof typeof values];
                                    return !value || (typeof value === 'string' && value.trim() === '');
                                });

                                if (missingFields.length > 0) {
                                    console.error('Missing required fields:', missingFields);
                                    toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`);
                                    return;
                                }

                                if (inventory) {
                                    const url = route('inventories.update', inventory.id);
                                    console.log('Sending PUT request to:', url);

                                    // Close the dialog immediately to prevent multiple submissions
                                    onOpenChange(false);

                                    // Show a loading toast
                                    const toastId = toast.loading('Updating inventory...');

                                    router.put(url, values, {
                                        onSuccess: () => {
                                            // Update the loading toast to success
                                            toast.success('Inventory item updated successfully', {
                                                id: toastId,
                                            });
                                        },
                                        onError: (errors) => {
                                            console.error('Request failed with errors:', errors);
                                            if (Object.keys(errors).length > 0) {
                                                const errorMessages = Object.values(errors).flat().join(', ');
                                                toast.error(`Failed to update inventory item: ${errorMessages}`, {
                                                    id: toastId,
                                                });
                                            } else {
                                                toast.error('Failed to update inventory item', {
                                                    id: toastId,
                                                });
                                            }
                                        },
                                        onFinish: () => {
                                            // Reload the page after a short delay to ensure toast is visible
                                            setTimeout(() => {
                                                router.reload();
                                            }, 1000);
                                        },
                                    });
                                }
                            });
                        }}
                        className="space-y-4"
                    >
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                            <div className="space-y-4 md:col-span-1">
                                <Label htmlFor="image">Product Image (Optional)</Label>
                                {!imagePreview ? (
                                    <div className="flex w-full items-center justify-center rounded-lg border border-dashed border-neutral-200 bg-white p-2 dark:border-neutral-800 dark:bg-black">
                                        <FileUpload onChange={handleImageChange} />
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-between gap-3">
                                        <Card className="overflow-hidden">
                                            <CardContent className="p-2">
                                                <img src={imagePreview} alt="Product preview" className="h-64 w-full rounded-sm object-contain" />
                                            </CardContent>
                                        </Card>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={removeImage}
                                            className="text-destructive hover:bg-destructive/10 hover:text-destructive flex w-fit items-center gap-1 hover:cursor-pointer"
                                        >
                                            <Trash className="h-4 w-4" /> Remove Image
                                        </Button>
                                    </div>
                                )}
                            </div>
                            <div className="md:col-span-2 space-y-6">
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
                                                    <Input {...field} disabled />
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
                                                <Textarea placeholder="Product description..." className="resize-none" {...field} />
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
                                        name="product_category_id"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Category</FormLabel>
                                                <FormControl>
                                                    <Select
                                                        onValueChange={(value) => {
                                                            console.log('Category selected:', value);
                                                            field.onChange(parseInt(value));
                                                        }}
                                                        value={field.value ? field.value.toString() : ''}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select a category" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {categories.map((category) => (
                                                                <SelectItem key={category.id} value={category.id.toString()}>
                                                                    {category.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="product_brand_id"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Brand</FormLabel>
                                                <FormControl>
                                                    <Select
                                                        onValueChange={(value) => {
                                                            console.log('Brand selected:', value);
                                                            field.onChange(parseInt(value));
                                                        }}
                                                        value={field.value ? field.value.toString() : ''}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select a brand" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {brands.map((brand) => (
                                                                <SelectItem key={brand.id} value={brand.id.toString()}>
                                                                    {brand.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="supplier_id"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Supplier</FormLabel>
                                                <FormControl>
                                                    <Select
                                                        onValueChange={(value) => {
                                                            console.log('Supplier selected:', value);
                                                            field.onChange(parseInt(value));
                                                        }}
                                                        value={field.value ? field.value.toString() : ''}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select a supplier" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {suppliers.map((supplier) => (
                                                                <SelectItem key={supplier.id} value={supplier.id.toString()}>
                                                                    {supplier.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="store_id"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Store</FormLabel>
                                                <FormControl>
                                                    <Select
                                                        onValueChange={(value) => {
                                                            console.log('Store selected:', value);
                                                            field.onChange(parseInt(value));
                                                        }}
                                                        value={field.value ? field.value.toString() : ''}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select a store" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {stores.map((store) => (
                                                                <SelectItem key={store.id} value={store.id.toString()}>
                                                                    {store.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="quantity"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Quantity</FormLabel>
                                                <FormControl>
                                                    <Input type="number" min="0" {...field} disabled />
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
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={form.formState.isSubmitting} className="hover:cursor-pointer">
                                Save Changes
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
