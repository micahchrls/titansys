import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FileUpload } from '@/components/ui/file-upload';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Brand, Category, Store, Supplier, ProductImage, StockMovement } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { Trash } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

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
    product_image: ProductImage[];
    supplier: Supplier[];
    store: Store;
    stock_movement?: StockMovement[];
    created_at?: string;
    updated_at?: string;
}

const formSchema = z.object({
    product_name: z.string().min(1, 'Product name is required'),
    product_sku: z.string().min(1, 'SKU is required'),
    product_description: z.string().optional(),
    product_price: z.coerce.number().positive('Price must be positive'),
    product_size: z.string().nullable().transform(val => val === null ? "" : val).optional(),
    product_category_id: z.coerce.number().positive('Category is required'),
    product_brand_id: z.coerce.number().positive('Brand is required'),
    supplier_id: z.coerce.number().positive('Supplier is required'),
    store_id: z.coerce.number().positive('Store is required'),
    quantity: z.coerce.number().min(0, 'Quantity cannot be negative').optional(),
    reorder_level: z.coerce.number().min(0, 'Reorder level cannot be negative'),
    image: z.instanceof(File).optional(),
    remove_image: z.boolean().optional(),
});

interface InventoryEditDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    inventory: InventoryItem | null;
    brands: Brand[];
    categories: Category[];
    suppliers: Supplier[];
    stores: Store[];
    onInventoryUpdated?: (updatedInventory: any) => void;
}

export function InventoryEditDialog({ open, onOpenChange, inventory, brands, categories, suppliers, stores, onInventoryUpdated }: InventoryEditDialogProps) {
    // Store original values to compare changes
    const originalValuesRef = useRef<Record<string, any>>({});
    
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            product_name: inventory?.product_name || '',
            product_sku: inventory?.product_sku || '',
            product_description: inventory?.product_description || '',
            product_price: inventory?.product_price || 0,
            product_size: inventory?.product_size ?? '',
            product_category_id: inventory?.product_category_id || 0,
            product_brand_id: inventory?.product_brand_id || 0,
            supplier_id: inventory?.supplier_id || 0,
            store_id: inventory?.store_id || 0,
            quantity: inventory?.quantity || 0,
            reorder_level: inventory?.reorder_level || 0,
        },
    });

    useEffect(() => {
        if (inventory) {
            const initialValues = {
                product_name: inventory.product_name,
                product_sku: inventory.product_sku,
                product_description: inventory.product_description || '',
                product_price: inventory.product_price,
                product_size: inventory.product_size ?? '',
                product_category_id: inventory.product_category_id,
                product_brand_id: inventory.product_brand_id,
                supplier_id: inventory.supplier_id,
                store_id: inventory.store_id,
                quantity: inventory.quantity,
                reorder_level: inventory.reorder_level,
                remove_image: false,
            };
            
            // Store the original values for later comparison
            originalValuesRef.current = { ...initialValues };
            
            form.reset(initialValues);
        }
    }, [inventory, form]);

    const [imagePreview, setImagePreview] = useState<string | null>(null);

    // Initialize image preview when inventory data changes
    useEffect(() => {
        if (inventory?.product_image) {
            const imageUrl = `${window.location.origin}/storage/${inventory.product_image.file_path}`;
            setImagePreview(imageUrl);
        } else {
            setImagePreview(null);
        }
    }, [inventory]);

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
        form.setValue('remove_image', true);
    };

    // Effect to initialize select fields when the dialog opens
    useEffect(() => {
        if (open && inventory) {
            // Set IDs directly
            if (inventory.supplier_id) {
                form.setValue('supplier_id', inventory.supplier_id);
            }

            if (inventory.store_id) {
                form.setValue('store_id', inventory.store_id);
            }

            if (inventory.product_category_id) {
                form.setValue('product_category_id', inventory.product_category_id);
            }

            if (inventory.product_brand_id) {
                form.setValue('product_brand_id', inventory.product_brand_id);
            }

            // Force a form state update
            form.trigger();
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
                                    console.error('Form validation failed', form.formState.errors);
                                    toast.error('Please fill in all required fields correctly');
                                    return;
                                }

                                const values = form.getValues();
                                
                                // Function to check if form values have actually changed
                                const hasFormChanged = () => {
                                    const originalValues = originalValuesRef.current;
                                    const currentValues = form.getValues();
                                    
                                    // Fields to check for changes (excluding image and remove_image)
                                    const fieldsToCheck = [
                                        'product_name',
                                        'product_sku',
                                        'product_description',
                                        'product_price', 
                                        'product_size',
                                        'product_category_id',
                                        'product_brand_id',
                                        'supplier_id',
                                        'store_id',
                                        'quantity',
                                        'reorder_level'
                                    ];
                                    
                                    // Check each field for changes
                                    for (const field of fieldsToCheck) {
                                        const originalValue = originalValues[field];
                                        const currentValue = currentValues[field];
                                        
                                        // Handle numbers vs strings consistently
                                        const normalizedOriginal = typeof originalValue === 'number' ? originalValue : String(originalValue || '');
                                        const normalizedCurrent = typeof currentValue === 'number' ? currentValue : String(currentValue || '');
                                        
                                        if (normalizedOriginal !== normalizedCurrent) {
                                            return true; // Found a change
                                        }
                                    }
                                    
                                    // Check for image changes
                                    if (values.image instanceof File || values.remove_image) {
                                        return true;
                                    }
                                    
                                    return false; // No changes found
                                };

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
                                    // Convert value to string to check
                                    const stringValue = value !== undefined && value !== null ? String(value) : '';
                                    return stringValue.trim() === '' || (typeof value === 'number' && isNaN(value)) || value === 0; // For ID fields, 0 is invalid
                                });

                                if (missingFields.length > 0) {
                                    console.error('Missing required fields:', missingFields);
                                    toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`);
                                    return;
                                }

                                if (inventory) {
                                    // Check if any values have actually changed
                                    if (!hasFormChanged()) {
                                        // No changes were made, just close the dialog without submitting
                                        onOpenChange(false);
                                        return;
                                    }
                                    
                                    const url = route('inventories.update', inventory.id);

                                    // Close the dialog immediately to prevent multiple submissions
                                    onOpenChange(false);

                                    // Show a loading toast
                                    const toastId = toast.loading('Updating inventory...');

                                    // Create FormData for file upload
                                    const formData = new FormData();

                                    // Add method override for Laravel to recognize it as PUT
                                    formData.append('_method', 'PUT');

                                    // Add CSRF token - make sure to get it correctly
                                    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
                                    if (csrfToken) {
                                        formData.append('_token', csrfToken);
                                    } else {
                                        // Log error and show toast if CSRF token is missing
                                        console.error('CSRF token not found');
                                        toast.error('CSRF token not found. Please refresh the page and try again.');
                                        onOpenChange(true);
                                        return;
                                    }

                                    // Add all form values to FormData
                                    Object.entries(values).forEach(([key, value]) => {
                                        if (key === 'image' && value instanceof File) {
                                            formData.append(key, value);
                                        } else if (key === 'remove_image') {
                                            // Always explicitly send the remove_image flag
                                            formData.append(key, value ? '1' : '0');
                                        } else if (value !== undefined && value !== null) {
                                            formData.append(key, value.toString());
                                        }
                                    });

                                    // Add existing product image details if available and no new image is selected
                                    if (inventory?.product_image && inventory.product_image.length > 0 && !values.image && !values.remove_image) {
                                        formData.append('product_image_id', inventory.product_image[0].id.toString());
                                        formData.append('product_image_path', inventory.product_image[0].file_path);
                                    }

                                    // Use XMLHttpRequest directly instead of Inertia router for more control
                                    // Create XMLHttpRequest to handle the form submission manually
                                    const xhr = new XMLHttpRequest();
                                    xhr.open('POST', url, true);

                                    // Set up event handlers
                                    xhr.onload = function () {
                                        if (xhr.status >= 200 && xhr.status < 300) {
                                            // Success
                                            let successMessage = 'Inventory item updated successfully';
                                            let updatedInventory = null;
                                            
                                            try {
                                                const response = JSON.parse(xhr.responseText);
                                                if (response.message) {
                                                    successMessage = response.message;
                                                }
                                                
                                                if (response.inventory) {
                                                    updatedInventory = response.inventory;
                                                    
                                                    // If the backend response doesn't include supplier/store objects 
                                                    // make sure to preserve the original ones
                                                    if (!updatedInventory.supplier && inventory.supplier) {
                                                        updatedInventory.supplier = inventory.supplier;
                                                    }
                                                    if (!updatedInventory.store && inventory.store) {
                                                        updatedInventory.store = inventory.store;
                                                    }
                                                }
                                            } catch (e) {
                                                console.error('Error parsing response:', e);
                                            }
                                            
                                            toast.success(successMessage, {
                                                id: toastId,
                                            });
                                            
                                            // Make sure to preserve store and supplier information
                                            if (onInventoryUpdated && updatedInventory) {
                                                // Ensure supplier and store objects are preserved
                                                if (!updatedInventory.supplier && inventory.supplier) {
                                                    updatedInventory.supplier = inventory.supplier;
                                                }
                                                if (!updatedInventory.store && inventory.store) {
                                                    updatedInventory.store = inventory.store;
                                                }
                                                
                                                onInventoryUpdated(updatedInventory);
                                            }
                                            
                                            // No need to reload the page
                                        } else {
                                            // Error
                                            console.error('Request failed with status:', xhr.status);
                                            let errorMessage = 'Failed to update inventory item';
                                            try {
                                                const response = JSON.parse(xhr.responseText);
                                                if (response.errors) {
                                                    errorMessage = Object.values(response.errors).flat().join(', ');
                                                } else if (response.message) {
                                                    errorMessage = response.message;
                                                }
                                            } catch (e) {
                                                console.error('Error parsing response:', e);
                                            }
                                            toast.error(`Failed to update inventory item: ${errorMessage}`, {
                                                id: toastId,
                                            });
                                            
                                            // Reopen the dialog to show errors
                                            onOpenChange(true);
                                        }
                                    };

                                    xhr.onerror = function () {
                                        console.error('Request failed');
                                        toast.error('Failed to update inventory item: Network error', {
                                            id: toastId,
                                        });
                                        
                                        // Reopen the dialog to show errors
                                        onOpenChange(true);
                                    };

                                    // Set X-Requested-With header for Laravel to recognize it as an AJAX request
                                    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
                                    // Set X-CSRF-Token header - this is crucial for Laravel's CSRF protection
                                    if (csrfToken) {
                                        xhr.setRequestHeader('X-CSRF-TOKEN', csrfToken);
                                    }
                                    
                                    // Also set the Content-Type header to let Laravel know it's a form submission
                                    // Do NOT set this for FormData submissions as it will break file uploads
                                    // xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
                                    // Set X-Inertia header for Inertia.js
                                    xhr.setRequestHeader('X-Inertia', 'true');

                                    // Send the request
                                    xhr.send(formData);
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
                            <div className="space-y-6 md:col-span-2">
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
                                                <FormLabel className="flex items-center gap-1">
                                                    Size <span className="text-xs text-muted-foreground">(Optional)</span>
                                                </FormLabel>
                                                <FormControl>
                                                    <Input {...field} placeholder="Enter product size if applicable" />
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
