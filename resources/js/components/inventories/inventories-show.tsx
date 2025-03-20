import { Button } from '@/components/ui/button';
import { router } from '@inertiajs/react';
import { ArrowLeft, Edit, Trash } from 'lucide-react';
import { Toaster } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { InventoryDetailTabs } from '@/components/inventories/inventory-detail-tabs';
import { useState } from 'react';
import { InventoryEditDialog } from '@/components/inventories/inventory-edit-dialog';
import { InventoryDeleteDialog } from '@/components/inventories/inventory-delete-dialog';
import { Supplier, StockMovement, ProductImage, Brand, Category, Store } from '@/types';
import { toast } from 'sonner';
import { Copy } from 'lucide-react';
import { usePage } from '@inertiajs/react';

// Define consistent interface that matches the dialog components
interface InventoryDisplayItem {
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
    stock_movement: StockMovement[];
    created_at: string;
    updated_at: string;
}

interface InventoryShowProps {
    inventory: {
        data: InventoryDisplayItem;
    };
}

export default function InventoriesShow({ inventory }: InventoryShowProps) {

    const { brands, categories, suppliers, stores } = usePage<{ brands: Brand[]; categories: Category[]; suppliers: Supplier[]; stores: Store[] }>().props;
    const { data } = inventory;

    // Create a state variable to hold the inventory data
    const [inventoryData, setInventoryData] = useState<InventoryDisplayItem>(data);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    
    const handleEdit = () => {
        setIsEditDialogOpen(true);
    };

    const handleDelete = () => {
        setIsDeleteDialogOpen(true);
    };

    const handleBack = () => {
        router.visit(route('inventories.index'));
    };

    // Handler for when inventory data is updated
    const handleInventoryUpdated = (updatedInventory: any) => {
        setInventoryData(updatedInventory.data || updatedInventory);
        setIsEditDialogOpen(false);
    };

    // Handler for when inventory is deleted
    const handleInventoryDeleted = () => {
        // Redirect to the inventory index page
        router.visit(route('inventories.index'));
    };

    const StockStatusBadge = () => {
        if (inventoryData.quantity <= 0) {
            return <Badge variant="destructive">Out of Stock</Badge>;
        } else if (inventoryData.quantity <= inventoryData.reorder_level) {
            return <Badge variant="outline" className="text-amber-600 border-amber-300">Low Stock</Badge>;
        } else {
            return <Badge variant="outline" className="text-green-600 border-green-300">In Stock</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <Button variant="outline" onClick={handleBack} size="sm" className="hover:cursor-pointer">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Inventory
                </Button>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleEdit} className="hover:cursor-pointer">
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Details
                    </Button>
                    <Button variant="destructive" size="sm" onClick={handleDelete} className="hover:cursor-pointer">
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                    </Button>
                </div>
            </div>

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{inventoryData.product_name}</h1>
                    <div className="flex items-center gap-2">
                        <p className="text-muted-foreground">SKU: {inventoryData.product_sku}</p>
                        <Button 
                            variant="ghost" 
                            size="sm"   
                            onClick={() => {
                                navigator.clipboard.writeText(inventoryData.product_sku);
                                toast.success("SKU copied to clipboard");
                            }}
                            className="hover:cursor-pointer"
                        >
                            <Copy className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
                <StockStatusBadge />
            </div>

            <InventoryDetailTabs data={inventoryData} />
            
            {/* Edit Dialog */}
            <InventoryEditDialog
                open={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
                inventory={inventoryData}
                brands={brands}
                categories={categories}
                suppliers={suppliers}
                stores={stores}
                onInventoryUpdated={handleInventoryUpdated}
            />
            
            {/* Delete Dialog */}
            <InventoryDeleteDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                inventory={inventoryData as any}
                onInventoryDeleted={handleInventoryDeleted}
            />
            
            <Toaster />
        </div>
    );
}