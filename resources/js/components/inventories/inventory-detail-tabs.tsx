import { InventoryMovementDeleteDialog } from '@/components/inventories/inventory-movement-delete-dialog';
import { InventoryMovementEditDialog } from '@/components/inventories/inventory-movement-edit-dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { BarChart3, Clock, Info, Package, Store as StoreIcon, Truck, Hash, Car, Tag, Layers, Ruler, User, Mail, Phone, MapPin } from 'lucide-react';
import React, { useEffect, useState } from 'react';

import { StockMovementHistory } from '@/components/inventories/stock-movement-history';
import { Inventory, ProductImage, Store, Supplier } from '@/types';
import { toast } from 'sonner';

interface StockMovement {
    id: number;
    quantity: number;
    movement_type: 'in' | 'out' | 'adjustment';
    created_at: string;
    updated_at: string;
    user_id?: number;
    user_name?: string;
    reference_number?: string;
    reference_type?: 'purchase_order' | 'sales_order' | 'return' | 'internal_transfer' | 'inventory_check';
    notes?: string;
    previous_quantity?: number;
    location?: string;
    reason_code?: string;
}

interface InventoryDetailTabsProps {
    data: Inventory;
}

export function InventoryDetailTabs({ data }: InventoryDetailTabsProps) {
    // Fix: Handle supplier as an array and extract the first item
    const supplierInfo: Supplier = Array.isArray(data.supplier) ? data.supplier[0] || {} : data.supplier || {};
    const productImage: ProductImage[] = Array.isArray(data.product_image) ? data.product_image : data.product_image ? [data.product_image] : [];

    // Fix: Handle store as an array if needed
    const storeInfo: Store = Array.isArray(data.store) ? data.store[0] || {} : data.store || {};
    console.log('DATA: ', data);
    console.log('Store Info:', storeInfo);

    // Fix the image URL path to correctly point to the Laravel storage
    const productImageFile = productImage.length ? `${window.location.origin}/storage/${productImage[0].file_path}` : null;

    const [activeTab, setActiveTab] = useState<'details' | 'movements'>('details');
    const [movementToEdit, setMovementToEdit] = useState<StockMovement | null>(null);
    const [movementToDelete, setMovementToDelete] = useState<StockMovement | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [stockMovements, setStockMovements] = useState<StockMovement[]>(data.stock_movement || []);
    const [imageLoading, setImageLoading] = useState(true);

    // Ensure stockMovements is updated when data changes (e.g., after API update)
    useEffect(() => {
        setStockMovements(data.stock_movement || []);
    }, [data.stock_movement]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    const handleEditMovement = (movement: StockMovement) => {
        setMovementToEdit(movement);
        setIsEditDialogOpen(true);
    };

    const handleDeleteMovement = (movement: StockMovement) => {
        setMovementToDelete(movement);
        setIsDeleteDialogOpen(true);
    };

    const saveMovementChanges = (updatedMovement: any) => {
        try {
            // Ensure the updated movement has all the necessary properties
            const completeUpdatedMovement = {
                ...updatedMovement,
                // Add any missing properties that might be needed for display
                updated_at: new Date().toISOString(),
            };

            const updatedMovements = stockMovements.map((movement) =>
                movement.id === completeUpdatedMovement.id ? completeUpdatedMovement : movement,
            );

            setStockMovements(updatedMovements);
            // Toast notification is now handled in the edit dialog component
        } catch (error) {
            console.error('Error updating stock movements state:', error);
            toast.error('An error occurred while updating the display');
        }
    };

    const deleteMovement = (id: number) => {
        // In a real app, this would typically include an API call to delete on the backend
        // Then, on successful response, update the local state

        const updatedMovements = stockMovements.filter((movement) => movement.id !== id);
        setStockMovements(updatedMovements);
        toast.success(`Stock movement #${id} deleted successfully`);
    };

    const StockStatusBadge = () => {
        if (data.quantity <= 0) {
            return <Badge variant="destructive">Out of Stock</Badge>;
        } else if (data.quantity <= data.reorder_level) {
            return (
                <Badge variant="outline" className="border-amber-300 text-amber-600">
                    Low Stock
                </Badge>
            );
        } else {
            return (
                <Badge variant="outline" className="border-green-300 text-green-600">
                    In Stock
                </Badge>
            );
        }
    };

    const InfoItem = ({ label, value, icon }: { label: string; value: React.ReactNode; icon?: React.ReactNode }) => {
        // Don't render if value is empty, null, or undefined
        if (!value || (typeof value === 'string' && value.trim() === '')) {
            return null;
        }

        return (
            <div className="flex items-center justify-between py-3 px-1 rounded-lg hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-3">
                    {icon && (
                        <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center text-muted-foreground">
                            {icon}
                        </div>
                    )}
                    <span className="text-sm font-medium text-muted-foreground">{label}</span>
                </div>
                <span className="font-semibold text-right max-w-[60%] break-words">{value}</span>
            </div>
        );
    };

    const handleImageLoad = () => {
        setImageLoading(false);
    };

    return (
        <>
            <Tabs defaultValue="details" className="w-full" onValueChange={(value) => setActiveTab(value as 'details' | 'movements')}>
                <TabsList className="mb-4 w-full justify-start">
                    <TabsTrigger value="details" className="flex items-center gap-1">
                        <Info className="h-4 w-4" />
                        Product Details
                    </TabsTrigger>
                    <TabsTrigger value="movements" className="flex items-center gap-1">
                        <BarChart3 className="h-4 w-4" />
                        Stock Movements
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                        <div className="space-y-4 lg:col-span-1">
                            <Card className="overflow-hidden border-0 shadow-md">
                                <CardHeader className="pb-3 bg-gradient-to-r from-slate-50 to-slate-100">
                                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                        <Package className="h-5 w-5 text-slate-600" />
                                        Product Image
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    {imageLoading && productImage.length > 0 && (
                                        <div className="flex h-64 items-center justify-center bg-slate-50">
                                            <Skeleton className="h-64 w-full rounded-none" />
                                        </div>
                                    )}
                                    {productImage.length > 0 ? (
                                        <div className="relative flex items-center justify-center p-6 bg-gradient-to-br from-slate-50 to-white">
                                            <img
                                                src={productImageFile || ''}
                                                alt={data.part_number}
                                                className={cn(
                                                    'h-auto w-full object-contain transition-all duration-300 rounded-lg shadow-sm',
                                                    imageLoading ? 'opacity-0' : 'opacity-100',
                                                )}
                                                style={{ maxHeight: '280px' }}
                                                onLoad={handleImageLoad}
                                            />
                                        </div>
                                    ) : (
                                        <div className="bg-gradient-to-br from-slate-100 to-slate-200 flex h-64 items-center justify-center">
                                            <div className="text-center">
                                                <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-slate-300/50">
                                                    <Package className="h-8 w-8 text-slate-500" />
                                                </div>
                                                <p className="text-slate-600 font-medium">No image available</p>
                                                <p className="text-slate-500 text-sm mt-1">Upload an image for this product</p>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg">Inventory Status</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className={cn(
                                            "flex flex-col space-y-1 rounded-lg p-4 text-white shadow-md transition-all duration-200 hover:shadow-lg",
                                            data.quantity <= 0 
                                                ? "bg-gradient-to-br from-red-500 to-red-600"
                                                : data.quantity <= data.reorder_level 
                                                    ? "bg-gradient-to-br from-amber-500 to-orange-500"
                                                    : "bg-gradient-to-br from-green-500 to-emerald-500"
                                        )}>
                                            <div className="flex items-center gap-2">
                                                <Package className="h-4 w-4 opacity-80" />
                                                <span className="text-sm font-medium opacity-90">Current Stock</span>
                                            </div>
                                            <span className="text-2xl font-bold">{data.quantity}</span>
                                        </div>
                                        <div className="bg-gradient-to-br from-slate-600 to-slate-700 flex flex-col space-y-1 rounded-lg p-4 text-white shadow-md transition-all duration-200 hover:shadow-lg">
                                            <div className="flex items-center gap-2">
                                                <BarChart3 className="h-4 w-4 opacity-80" />
                                                <span className="text-sm font-medium opacity-90">Reorder Level</span>
                                            </div>
                                            <span className="text-2xl font-bold">{data.reorder_level}</span>
                                        </div>
                                    </div>
                                    <Separator />
                                    <InfoItem label="Status" value={<StockStatusBadge />} icon={<Package className="h-4 w-4" />} />
                                    <InfoItem label="Last Restocked" value={formatDate(data.last_restocked)} icon={<Clock className="h-4 w-4" />} />
                                </CardContent>
                            </Card>
                        </div>

                        <div className="space-y-4 lg:col-span-2">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="flex items-center gap-2 text-lg">
                                            <Info className="h-4 w-4" />
                                            Description
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-muted-foreground">{data.product_description || 'No description available'}</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="flex items-center gap-2 text-lg">
                                            <StoreIcon className="h-4 w-4" />
                                            Store Information
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        <InfoItem label="Name" value={storeInfo.name} icon={<StoreIcon className="h-4 w-4" />} />
                                        <InfoItem label="Location" value={storeInfo.location_address} icon={<MapPin className="h-4 w-4" />} />
                                        <InfoItem label="Phone" value={storeInfo.contact_number} icon={<Phone className="h-4 w-4" />} />
                                        <InfoItem label="Email" value={storeInfo.email} icon={<Mail className="h-4 w-4" />} />
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="flex items-center gap-2 text-lg">
                                            <Hash className="h-4 w-4" />
                                            Product Information
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        <InfoItem label="Part Number" value={data.part_number} icon={<Tag className="h-4 w-4" />} />
                                        <InfoItem label="Vehicle" value={data.vehicle} icon={<Car className="h-4 w-4" />} />
                                        <InfoItem label="Brand" value={data.product_brand} icon={<Layers className="h-4 w-4" />} />
                                        <InfoItem label="Category" value={data.product_category} icon={<Ruler className="h-4 w-4" />} />
                                        <InfoItem label="Code" value={data.code} icon={<Hash className="h-4 w-4" />} />
                                        {data.product_size && <InfoItem label="Size" value={data.product_size} icon={<Ruler className="h-4 w-4" />} />}
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="flex items-center gap-2 text-lg">
                                            <Truck className="h-4 w-4" />
                                            Supplier Information
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        <InfoItem label="Name" value={supplierInfo.name} icon={<User className="h-4 w-4" />} />
                                        <InfoItem label="Email" value={supplierInfo.email} icon={<Mail className="h-4 w-4" />} />
                                        <InfoItem label="Phone" value={supplierInfo.phone} icon={<Phone className="h-4 w-4" />} />
                                        <InfoItem label="Address" value={supplierInfo.address} icon={<MapPin className="h-4 w-4" />} />
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="movements">
                    <StockMovementHistory stockMovements={stockMovements} onEditMovement={handleEditMovement} onAddMovement={() => {}} />
                </TabsContent>
            </Tabs>

            {/* Edit Dialog */}
            <InventoryMovementEditDialog
                open={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
                movement={movementToEdit}
                onSave={saveMovementChanges}
            />

            {/* Delete Dialog */}
            <InventoryMovementDeleteDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                movement={movementToDelete}
                onDelete={deleteMovement}
            />
        </>
    );
}
