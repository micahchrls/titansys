import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { AlertTriangle } from 'lucide-react';

interface StockMovement {
    id: number;
    quantity: number;
    movement_type: 'in' | 'out' | 'adjustment';
    created_at: string;
}

interface InventoryMovementDeleteDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    movement: StockMovement | null;
    onDelete: (id: number) => void;
}

export function InventoryMovementDeleteDialog({ 
    open, 
    onOpenChange, 
    movement, 
    onDelete 
}: InventoryMovementDeleteDialogProps) {
    
    const handleDelete = () => {
        if (movement) {
            onDelete(movement.id);
            onOpenChange(false);
            toast.success('Stock movement deleted successfully');
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader className="flex flex-col items-center gap-2">
                    <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                        <AlertTriangle className="h-6 w-6 text-red-600" />
                    </div>
                    <DialogTitle>Delete Stock Movement</DialogTitle>
                    <DialogDescription className="text-center">
                        Are you sure you want to delete this stock movement record? This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                
                {movement && (
                    <div className="border rounded-md p-3 bg-muted/50">
                        <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">Movement ID:</span>
                            <span className="text-sm">{movement.id}</span>
                        </div>
                        <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">Type:</span>
                            <span className="text-sm">{movement.movement_type === 'in' ? 'Stock In' : movement.movement_type === 'out' ? 'Stock Out' : 'Adjustment'}</span>
                        </div>
                        <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">Quantity:</span>
                            <span className="text-sm">{Math.abs(movement.quantity)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm font-medium">Date:</span>
                            <span className="text-sm">{new Date(movement.created_at).toLocaleString()}</span>
                        </div>
                    </div>
                )}
                
                <DialogFooter className="gap-2 sm:gap-0">
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button type="button" variant="destructive" onClick={handleDelete}>
                        Delete
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
