import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FileUpload } from '@/components/ui/file-upload';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useForm } from '@inertiajs/react';
import { Loader2, Trash } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

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
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    // Use Inertia's useForm hook instead of react-hook-form
    const { data, setData, post, processing, reset, errors, clearErrors } = useForm({
        part_number: '',
        vehicle: '',
        description: '',
        code: '',
        size: '',
        sku: '',
        auto_generate_sku: true,
        product_category_id: '',
        product_brand_id: '',
        supplier_id: '',
        store_id: '',
        quantity: '',
        reorder_level: '',
        image: null as File | null,
    });

    useEffect(() => {
        if (!open) {
            reset();
            setImagePreview(null);
            setValidationErrors({});
            clearErrors();
        }
    }, [open, reset, clearErrors]);

    const handleImageChange = (files: File[]) => {
        if (files.length > 0) {
            const file = files[0];
            setData('image', file);

            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setData('image', null);
        setImagePreview(null);
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!data.part_number.trim()) newErrors.part_number = 'Part number is required';
        if (!data.vehicle.trim()) newErrors.vehicle = 'Vehicle is required';
        if (!data.code.trim()) newErrors.code = 'Code is required';
        if (!data.product_category_id) newErrors.product_category_id = 'Category is required';
        if (!data.product_brand_id) newErrors.product_brand_id = 'Brand is required';
        if (!data.supplier_id) newErrors.supplier_id = 'Supplier is required';
        if (!data.store_id) newErrors.store_id = 'Store is required';
        if (!data.quantity.trim()) newErrors.quantity = 'Quantity is required';
        if (!data.reorder_level.trim()) newErrors.reorder_level = 'Reorder level is required';

        setValidationErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        const formData = new FormData();

        // Append all form data
        Object.entries(data).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '') {
                if (key === 'image' && value instanceof File) {
                    formData.append(key, value);
                } else if (key === 'auto_generate_sku') {
                    formData.append(key, value ? '1' : '0');
                } else {
                    formData.append(key, String(value));
                }
            }
        });

        post(route('inventories.store'), {
            data: formData,
            preserveState: true,
            preserveScroll: true,
            forceFormData: true,
            onSuccess: (page) => {
                onOpenChange(false);
                // Access flash message from the page props
                if (page.props.flash?.success) {
                    toast.success(page.props.flash.success);
                } else {
                    toast.success('Inventory created successfully');
                }
            },
            onError: (formErrors) => {
                if (formErrors.message) {
                    toast.error(formErrors.message);
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
                <form onSubmit={onSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                        <div className="space-y-2 md:col-span-1">
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
                                        className="text-destructive hover:bg-destructive/10 hover:text-destructive flex w-fit items-center gap-1 hover:cursor-pointer"
                                    >
                                        <Trash className="h-4 w-4" /> Remove Image
                                    </Button>
                                </div>
                            )}
                        </div>

                        <div className="space-y-6 md:col-span-2">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="part_number">Part Number</Label>
                                        <Input 
                                            id="part_number"
                                            placeholder="Enter part number" 
                                            value={data.part_number}
                                            onChange={(e) => setData('part_number', e.target.value)}
                                        />
                                        {(validationErrors.part_number || errors.part_number) && (
                                            <p className="text-sm text-red-500">{validationErrors.part_number || errors.part_number}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="vehicle">Vehicle</Label>
                                        <Input 
                                            id="vehicle"
                                            placeholder="Enter vehicle" 
                                            value={data.vehicle}
                                            onChange={(e) => setData('vehicle', e.target.value)}
                                        />
                                        {(validationErrors.vehicle || errors.vehicle) && (
                                            <p className="text-sm text-red-500">{validationErrors.vehicle || errors.vehicle}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="description">Description (Optional)</Label>
                                        <Textarea 
                                            id="description"
                                            placeholder="Enter product description" 
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="code">Code</Label>
                                        <Input 
                                            id="code"
                                            type="number"
                                            placeholder="Enter code" 
                                            value={data.code}
                                            onChange={(e) => setData('code', e.target.value)}
                                        />
                                        {(validationErrors.code || errors.code) && (
                                            <p className="text-sm text-red-500">{validationErrors.code || errors.code}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="size">Size (Optional)</Label>
                                        <Input 
                                            id="size"
                                            placeholder="Enter size" 
                                            value={data.size}
                                            onChange={(e) => setData('size', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="product_category_id">Category</Label>
                                        <Select value={data.product_category_id} onValueChange={(value) => setData('product_category_id', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categories.map((category) => (
                                                    <SelectItem key={category.id} value={String(category.id)}>
                                                        {category.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {(validationErrors.product_category_id || errors.product_category_id) && (
                                            <p className="text-sm text-red-500">{validationErrors.product_category_id || errors.product_category_id}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="product_brand_id">Brand</Label>
                                        <Select value={data.product_brand_id} onValueChange={(value) => setData('product_brand_id', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select brand" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {brands.map((brand) => (
                                                    <SelectItem key={brand.id} value={String(brand.id)}>
                                                        {brand.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {(validationErrors.product_brand_id || errors.product_brand_id) && (
                                            <p className="text-sm text-red-500">{validationErrors.product_brand_id || errors.product_brand_id}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="supplier_id">Supplier</Label>
                                        <Select value={data.supplier_id} onValueChange={(value) => setData('supplier_id', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select supplier" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {suppliers.map((supplier) => (
                                                    <SelectItem key={supplier.id} value={String(supplier.id)}>
                                                        {supplier.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {(validationErrors.supplier_id || errors.supplier_id) && (
                                            <p className="text-sm text-red-500">{validationErrors.supplier_id || errors.supplier_id}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="store_id">Store</Label>
                                        <Select value={data.store_id} onValueChange={(value) => setData('store_id', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select store" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {stores.map((store) => (
                                                    <SelectItem key={store.id} value={String(store.id)}>
                                                        {store.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {(validationErrors.store_id || errors.store_id) && (
                                            <p className="text-sm text-red-500">{validationErrors.store_id || errors.store_id}</p>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="quantity">Quantity</Label>
                                            <Input 
                                                id="quantity"
                                                type="number"
                                                placeholder="Enter quantity" 
                                                value={data.quantity}
                                                onChange={(e) => setData('quantity', e.target.value)}
                                            />
                                            {(validationErrors.quantity || errors.quantity) && (
                                                <p className="text-sm text-red-500">{validationErrors.quantity || errors.quantity}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="reorder_level">Reorder Level</Label>
                                            <Input 
                                                id="reorder_level"
                                                type="number"
                                                placeholder="Enter reorder level" 
                                                value={data.reorder_level}
                                                onChange={(e) => setData('reorder_level', e.target.value)}
                                            />
                                            {(validationErrors.reorder_level || errors.reorder_level) && (
                                                <p className="text-sm text-red-500">{validationErrors.reorder_level || errors.reorder_level}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center space-x-2">
                                    <Checkbox 
                                        id="auto_generate_sku" 
                                        checked={data.auto_generate_sku}
                                        onCheckedChange={(checked) => setData('auto_generate_sku', !!checked)}
                                    />
                                    <Label htmlFor="auto_generate_sku">Auto-generate SKU</Label>
                                </div>

                                {!data.auto_generate_sku && (
                                    <div className="space-y-2">
                                        <Label htmlFor="sku">SKU</Label>
                                        <Input 
                                            id="sku"
                                            placeholder="Enter SKU" 
                                            value={data.sku}
                                            onChange={(e) => setData('sku', e.target.value)}
                                        />
                                        {errors.sku && (
                                            <p className="text-sm text-red-500">{errors.sku}</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={processing}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Inventory
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
