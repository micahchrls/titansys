import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FileUpload } from '@/components/ui/file-upload';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from '@inertiajs/react';
import { Loader2, Trash } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

const formSchema = z.object({
    product_name: z.string().min(1, 'Product name is required'),
    description: z.string().optional(),
    price: z.string().min(1, 'Price is required'),
    size: z.string().optional(),
    product_category_id: z.string().min(1, 'Category is required'),
    product_brand_id: z.string().min(1, 'Brand is required'),
    supplier_id: z.string().min(1, 'Supplier is required'),
    store_id: z.string().min(1, 'Store is required'),
    quantity: z.string().min(1, 'Quantity is required'),
    reorder_level: z.string().min(1, 'Reorder level is required'),
    image: z.instanceof(File).optional(),
});

interface InventoriesFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    categories?: any[];
    brands?: any[];
    suppliers?: any[];
    stores?: any[];
}

export default function InventoriesFormDialog({
    open,
    onOpenChange,
    categories = [],
    brands = [],
    suppliers = [],
    stores = [],
}: InventoriesFormDialogProps) {
    const [loading, setLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [loadedCategories, setLoadedCategories] = useState<any[]>([]);
    const [loadedBrands, setLoadedBrands] = useState<any[]>([]);
    const [loadedSuppliers, setLoadedSuppliers] = useState<any[]>([]);
    const [loadedStores, setLoadedStores] = useState<any[]>([]);
    const [isLoadingCategories, setIsLoadingCategories] = useState(false);
    const [isLoadingBrands, setIsLoadingBrands] = useState(false);
    const [isLoadingSuppliers, setIsLoadingSuppliers] = useState(false);
    const [isLoadingStores, setIsLoadingStores] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            product_name: '',
            description: '',
            price: '',
            size: '',
            product_category_id: '',
            product_brand_id: '',
            supplier_id: '',
            store_id: '',
            quantity: '',
            reorder_level: '',
        },
    });

    useEffect(() => {
        if (!open) {
            form.reset();
            setImagePreview(null);
            // Reset loaded data states to empty when dialog closes
            setLoadedCategories([]);
            setLoadedBrands([]);
            setLoadedSuppliers([]);
            setLoadedStores([]);
        }
    }, [open, form]);

    // Functions to load data when dropdown is opened
    const loadCategories = () => {
        if (loadedCategories.length === 0 && !isLoadingCategories) {
            setIsLoadingCategories(true);
            // Use the categories prop that was passed in
            setLoadedCategories(categories);
            setIsLoadingCategories(false);
        }
    };

    const loadBrands = () => {
        if (loadedBrands.length === 0 && !isLoadingBrands) {
            setIsLoadingBrands(true);
            // Use the brands prop that was passed in
            setLoadedBrands(brands);
            setIsLoadingBrands(false);
        }
    };

    const loadSuppliers = () => {
        if (loadedSuppliers.length === 0 && !isLoadingSuppliers) {
            setIsLoadingSuppliers(true);
            // Use the suppliers prop that was passed in
            setLoadedSuppliers(suppliers);
            setIsLoadingSuppliers(false);
        }
    };

    const loadStores = () => {
        if (loadedStores.length === 0 && !isLoadingStores) {
            setIsLoadingStores(true);
            // Use the stores prop that was passed in
            setLoadedStores(stores);
            setIsLoadingStores(false);
        }
    };

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

    function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true);
        //Create inventory
        const formData = new FormData();

        Object.entries(values).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                if (key === 'image' && value instanceof File) {
                    formData.append(key, value);
                } else {
                    formData.append(key, String(value));
                }
            }
        });

        router.post(route('inventories.store'), formData, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: (page) => {
                setLoading(false);
                form.reset();
                onOpenChange(false);

                // Access flash message from the page props
                if (page.props.flash?.success) {
                    toast.success(page.props.flash.success);
                } else {
                    toast.success('Inventory created successfully');
                }
            },
            onError: (errors) => {
                setLoading(false);
                if (errors.message) {
                    toast.error(errors.message);
                } else {
                    toast.error('Failed to create inventory');
                }
            },
        });
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-5xl sm:max-w-5xl">
                <DialogHeader>
                    <DialogTitle>Add New Inventory</DialogTitle>
                    <DialogDescription>Add a new product to your inventory. Fill out the form below with the product details.</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                            <div className="md:col-span-1 space-y-4">
                                <Label htmlFor="image">Product Image (Optional)</Label>
                                {!imagePreview ? (
                                    <div className="w-full rounded-lg border border-dashed border-neutral-200 bg-white p-2 dark:border-neutral-800 dark:bg-black">
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
                                            className="flex w-fit items-center gap-1 text-destructive hover:bg-destructive/10 hover:text-destructive hover:cursor-pointer"
                                        >
                                            <Trash className="h-4 w-4" /> Remove Image
                                        </Button>
                                    </div>
                                )}
                            </div>
                            
                            <div className="md:col-span-2 space-y-6">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="space-y-4">
                                        <FormField
                                            control={form.control}
                                            name="product_name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Product Name</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Enter product name" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="product_category_id"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Category</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value} onOpenChange={loadCategories}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select a category" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {isLoadingCategories ? (
                                                                <div className="flex items-center justify-center py-2">
                                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                                    <span>Loading categories...</span>
                                                                </div>
                                                            ) : loadedCategories.length > 0 ? (
                                                                loadedCategories.map((category) => (
                                                                    <SelectItem key={category.id} value={String(category.id)}>
                                                                        {category.name}
                                                                    </SelectItem>
                                                                ))
                                                            ) : (
                                                                <div className="text-muted-foreground py-2 text-center text-sm">No categories found</div>
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="price"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Price</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" placeholder="0.00" step="0.01" min="0" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="size"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Size (Optional)</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Size/Dimensions" {...field} />
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
                                                    <FormLabel>Store Location</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value} onOpenChange={loadStores}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select a store" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {isLoadingStores ? (
                                                                <div className="flex items-center justify-center py-2">
                                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                                    <span>Loading stores...</span>
                                                                </div>
                                                            ) : loadedStores.length > 0 ? (
                                                                loadedStores.map((store) => (
                                                                    <SelectItem key={store.id} value={String(store.id)}>
                                                                        {store.name}
                                                                    </SelectItem>
                                                                ))
                                                            ) : (
                                                                <div className="text-muted-foreground py-2 text-center text-sm">No stores found</div>
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        <FormField
                                            control={form.control}
                                            name="product_brand_id"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Brand</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value} onOpenChange={loadBrands}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select a brand" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {isLoadingBrands ? (
                                                                <div className="flex items-center justify-center py-2">
                                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                                    <span>Loading brands...</span>
                                                                </div>
                                                            ) : loadedBrands.length > 0 ? (
                                                                loadedBrands.map((brand) => (
                                                                    <SelectItem key={brand.id} value={String(brand.id)}>
                                                                        {brand.name}
                                                                    </SelectItem>
                                                                ))
                                                            ) : (
                                                                <div className="text-muted-foreground py-2 text-center text-sm">No brands found</div>
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="supplier_id"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Supplier</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value} onOpenChange={loadSuppliers}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select a supplier" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {isLoadingSuppliers ? (
                                                                <div className="flex items-center justify-center py-2">
                                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                                    <span>Loading suppliers...</span>
                                                                </div>
                                                            ) : loadedSuppliers.length > 0 ? (
                                                                loadedSuppliers.map((supplier) => (
                                                                    <SelectItem key={supplier.id} value={String(supplier.id)}>
                                                                        {supplier.name}
                                                                    </SelectItem>
                                                                ))
                                                            ) : (
                                                                <div className="text-muted-foreground py-2 text-center text-sm">No suppliers found</div>
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="quantity"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Quantity</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" placeholder="0" min="0" {...field} />
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
                                                        <Input type="number" placeholder="0" min="0" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>

                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Description (Optional)</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="Enter product description" className="h-20 resize-none" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Add Product
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
