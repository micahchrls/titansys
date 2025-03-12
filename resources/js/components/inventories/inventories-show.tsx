import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { router } from '@inertiajs/react';
import { ArrowLeft, Edit, Trash } from 'lucide-react';
import { Toaster } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { InventoryDetailTabs } from '@/components/ui/inventory-detail-tabs';
import { useState } from 'react';
import { InventoryEditDialog } from './inventory-edit-dialog';
import { InventoryDeleteDialog } from './inventory-delete-dialog';

interface StockMovement {
    id: number;
    quantity: number;
    movement_type: 'in' | 'out' | 'adjustment';
    created_at: string;
    updated_at: string;
}

interface InventoryShowProps {
    inventory: {
        data: {
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
            stock_movement: StockMovement[];
            reorder_level: number;
            last_restocked: string;
            image_url: string | null;
            created_at: string;
            updated_at: string;
        }
    };
}

export default function InventoriesShow({ inventory }: InventoryShowProps) {
    const { data } = inventory;
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

    const StockStatusBadge = () => {
        if (data.quantity <= 0) {
            return <Badge variant="destructive">Out of Stock</Badge>;
        } else if (data.quantity <= data.reorder_level) {
            return <Badge variant="outline" className="text-amber-600 border-amber-300">Low Stock</Badge>;
        } else {
            return <Badge variant="outline" className="text-green-600 border-green-300">In Stock</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <Button variant="outline" onClick={handleBack} size="sm">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Inventory
                </Button>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleEdit}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={handleDelete}>
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                    </Button>
                </div>
            </div>

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{data.product_name}</h1>
                    <p className="text-muted-foreground">SKU: {data.product_sku}</p>
                </div>
                <StockStatusBadge />
            </div>

            <InventoryDetailTabs data={data} />
            
            {/* Edit Dialog */}
            <InventoryEditDialog
                open={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
                inventory={data}
            />
            
            {/* Delete Dialog */}
            <InventoryDeleteDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                inventory={data}
            />
            
            <Toaster />
        </div>
    );
}