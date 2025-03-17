import { InventoryMovementDeleteDialog } from '@/components/inventories/inventory-movement-delete-dialog';
import { InventoryMovementEditDialog } from '@/components/inventories/inventory-movement-edit-dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { BarChart3, Clock, Info, Package, Store as StoreIcon, Truck } from 'lucide-react';
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
    console.log("DATA: ", data);
    console.log("Store Info:", storeInfo)

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

    const InfoItem = ({ label, value, icon }: { label: string; value: React.ReactNode; icon?: React.ReactNode }) => (
        <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2">
                {icon && <span className="text-muted-foreground">{icon}</span>}
                <span className="text-muted-foreground">{label}</span>
            </div>
            <span className="font-medium">{value}</span>
        </div>
    );

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
                            <Card className="overflow-hidden">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg font-semibold">Product Image</CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    {imageLoading && productImage.length > 0 && (
                                        <div className="flex h-48 items-center justify-center">
                                            <Skeleton className="h-48 w-full" />
                                        </div>
                                    )}
                                    {productImage.length > 0 ? (
                                        <div className="relative flex items-center justify-center p-4">
                                            <img
                                                src={productImageFile || ''}
                                                alt={data.product_name}
                                                className={cn(
                                                    'h-auto w-full object-contain transition-opacity duration-300',
                                                    imageLoading ? 'opacity-0' : 'opacity-100',
                                                )}
                                                style={{ maxHeight: '240px' }}
                                                onLoad={handleImageLoad}
                                            />
                                        </div>
                                    ) : (
                                        <div className="bg-muted/30 flex h-48 items-center justify-center">
                                            <p className="text-muted-foreground flex flex-col items-center gap-2">
                                                <Package className="text-muted-foreground/50 h-12 w-12" />
                                                <span>No image available</span>
                                            </p>
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
                                        <div className="bg-muted/30 flex flex-col space-y-1 rounded-md p-3">
                                            <span className="text-muted-foreground text-sm">Quantity</span>
                                            <span className="text-xl font-bold">{data.quantity}</span>
                                        </div>
                                        <div className="bg-muted/30 flex flex-col space-y-1 rounded-md p-3">
                                            <span className="text-muted-foreground text-sm">Reorder Level</span>
                                            <span className="text-xl font-bold">{data.reorder_level}</span>
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
                                        <InfoItem label="Name" value={storeInfo.name} />
                                        <InfoItem label="Location" value={storeInfo.location_address} />
                                        <InfoItem label="Phone" value={storeInfo.contact_number} />
                                        <InfoItem label="Email" value={storeInfo.email} />
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="flex items-center gap-2 text-lg">
                                            <Package className="h-4 w-4" />
                                            Product Information
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        <InfoItem label="Brand" value={data.product_brand} />
                                        <InfoItem label="Category" value={data.product_category} />
                                        <InfoItem
                                            label="Price"
                                            value={`₱ ${
                                                typeof data.product_price === 'number'
                                                    ? data.product_price.toLocaleString('fil-PH', { minimumFractionDigits: 2 })
                                                    : data.product_price
                                            }`}
                                        />
                                        {data.product_size && <InfoItem label="Size" value={data.product_size} />}
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
                                        <InfoItem label="Name" value={supplierInfo.name} />
                                        <InfoItem label="Email" value={supplierInfo.email} />
                                        <InfoItem label="Phone" value={supplierInfo.phone} />
                                        <InfoItem label="Address" value={supplierInfo.address} />
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
