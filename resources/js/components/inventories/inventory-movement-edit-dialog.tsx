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

const formSchema = z.object({
    quantity: z.coerce.number().positive('Quantity must be positive'),
    movement_type: z.enum(['in', 'out', 'adjustment'], { required_error: 'Movement type is required' }),
    reference_number: z.string().optional(),
    reference_type: z.enum(['purchase_order', 'sales_order', 'return', 'internal_transfer', 'inventory_check'], { required_error: 'Reference type is required' }),
    notes: z.string().optional(),
    location: z.string().optional(),
    reason_code: z.string().optional(),
});

interface InventoryMovementEditDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    movement: StockMovement | null;
    onSave: (movement: any) => void;
}

export function InventoryMovementEditDialog({ 
    open, 
    onOpenChange, 
    movement, 
    onSave 
}: InventoryMovementEditDialogProps) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            quantity: movement?.quantity || 0,
            movement_type: movement?.movement_type || 'in',
            reference_number: movement?.reference_number || '',
            reference_type: movement?.reference_type || 'purchase_order',
            notes: movement?.notes || '',
            location: movement?.location || 'Main Warehouse',
            reason_code: movement?.reason_code || '',
        },
    });

    React.useEffect(() => {
        if (movement) {
            form.reset({
                quantity: Math.abs(movement.quantity),
                movement_type: movement.movement_type,
                reference_number: movement.reference_number || '',
                reference_type: movement.reference_type || 'purchase_order',
                notes: movement.notes || '',
                location: movement.location || 'Main Warehouse',
                reason_code: movement.reason_code || '',
            });
        }
    }, [movement, form]);

    function onSubmit(values: z.infer<typeof formSchema>) {
        if (!movement) return;
        
        try {
            // Close the dialog and show success message immediately for better user experience
            onOpenChange(false);
            toast.success('Stock movement updated successfully');
            
            // Prepare the complete updated movement object
            const updatedMovement = {
                ...movement,
                quantity: values.movement_type === 'out' ? -Math.abs(values.quantity) : Math.abs(values.quantity),
                movement_type: values.movement_type,
                reference_number: values.reference_number,
                reference_type: values.reference_type,
                notes: values.notes,
                location: values.location,
                reason_code: values.reason_code,
            };
            
            // Call parent component's save function
            onSave(updatedMovement);
        } catch (error) {
            console.error('Error updating stock movement:', error);
            toast.error('Failed to update stock movement');
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Edit Stock Movement</DialogTitle>
                    <DialogDescription>
                        Update the details of this stock movement. Click save when you're done.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="quantity"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Quantity</FormLabel>
                                        <FormControl>
                                            <Input type="number" min={1} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="movement_type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Movement Type</FormLabel>
                                        <Select 
                                            onValueChange={field.onChange} 
                                            defaultValue={field.value}
                                            value={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select movement type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="in">Stock In</SelectItem>
                                                <SelectItem value="out">Stock Out</SelectItem>
                                                <SelectItem value="adjustment">Adjustment</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="reference_type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Reference Type</FormLabel>
                                        <Select 
                                            onValueChange={field.onChange} 
                                            defaultValue={field.value}
                                            value={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select reference type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="purchase_order">Purchase Order</SelectItem>
                                                <SelectItem value="sales_order">Sales Order</SelectItem>
                                                <SelectItem value="return">Return</SelectItem>
                                                <SelectItem value="internal_transfer">Internal Transfer</SelectItem>
                                                <SelectItem value="inventory_check">Inventory Check</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="reference_number"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Reference Number</FormLabel>
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
                                name="location"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Location</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="reason_code"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Reason Code</FormLabel>
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
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Notes</FormLabel>
                                    <FormControl>
                                        <Textarea 
                                            placeholder="Add any additional notes here..."
                                            className="resize-none"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        
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
