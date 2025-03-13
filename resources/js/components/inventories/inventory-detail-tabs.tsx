import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {  ArrowUpDown, X, ArrowUp, ArrowDown, RefreshCw, User, Calendar, Clock, FileText, Info, MapPin, Hash, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { 
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getPaginationRowModel,
    SortingState,
    getSortedRowModel,
    ColumnFiltersState,
    getFilteredRowModel,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { InventoryMovementEditDialog } from '@/components/inventories/inventory-movement-edit-dialog';
import { InventoryMovementDeleteDialog } from '@/components/inventories/inventory-movement-delete-dialog';
import { 
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { DateRangePicker } from '../ui/date-picker';
import { addDays, isAfter, isBefore, isEqual, startOfDay, endOfDay, format } from 'date-fns';
import { Inventory, Product, ProductImage, Supplier } from '@/types';

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
    
    const supplierInfo: Supplier[] = data.supplier;
    const productImage: ProductImage[] = data.product_image || [];
    const productImageFile = productImage.length > 0
        ? `${window.location.origin}/storage/products/${productImage[0].file_name}`
        : null;
    
    const [activeTab, setActiveTab] = useState<'details' | 'movements'>('details');
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [movementToEdit, setMovementToEdit] = useState<StockMovement | null>(null);
    const [movementToDelete, setMovementToDelete] = useState<StockMovement | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [stockMovements, setStockMovements] = useState<StockMovement[]>(data.stock_movement || []);

    // Date range filter state
    const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
    const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
    const [filteredMovements, setFilteredMovements] = useState<StockMovement[]>(stockMovements);

    // Ensure stockMovements is updated when data changes (e.g., after API update)
   useEffect(() => {
        setStockMovements(data.stock_movement || []);
    }, [data.stock_movement]);

    // Apply date range filter whenever stockMovements, dateFrom, or dateTo changes
   useEffect(() => {
        filterMovementsByDateRange();
    }, [stockMovements, dateFrom, dateTo]);

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

    // Function to filter movements by date range
    const filterMovementsByDateRange = () => {
        if (!dateFrom && !dateTo) {
            // If no date range is selected, show all movements
            setFilteredMovements(stockMovements);
            return;
        }

        const filtered = stockMovements.filter(movement => {
            const movementDate = new Date(movement.created_at);

            // If only start date is provided
            if (dateFrom && !dateTo) {
                return isEqual(startOfDay(movementDate), startOfDay(dateFrom)) || 
                       isAfter(movementDate, startOfDay(dateFrom));
            }

            // If only end date is provided
            if (!dateFrom && dateTo) {
                return isEqual(startOfDay(movementDate), startOfDay(dateTo)) || 
                       isBefore(movementDate, endOfDay(dateTo));
            }

            // If both dates are provided
            if (dateFrom && dateTo) {
                return (
                    (isEqual(startOfDay(movementDate), startOfDay(dateFrom)) || 
                     isAfter(movementDate, startOfDay(dateFrom))) && 
                    (isEqual(startOfDay(movementDate), startOfDay(dateTo)) || 
                     isBefore(movementDate, endOfDay(dateTo)))
                );
            }

            return true;
        });

        setFilteredMovements(filtered);
    };

    // Clear date range filters
    const clearDateFilter = () => {
        setDateFrom(undefined);
        setDateTo(undefined);
    };

    const saveMovementChanges = (updatedMovement: any) => {
        try {
            // Ensure the updated movement has all the necessary properties
            const completeUpdatedMovement = {
                ...updatedMovement,
                // Add any missing properties that might be needed for display
                updated_at: new Date().toISOString(),
            };

            const updatedMovements = stockMovements.map(movement => 
                movement.id === completeUpdatedMovement.id 
                    ? completeUpdatedMovement 
                    : movement
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

        const updatedMovements = stockMovements.filter(movement => movement.id !== id);
        setStockMovements(updatedMovements);
        toast.success(`Stock movement #${id} deleted successfully`);
    };

    const columns: ColumnDef<StockMovement>[] = [
        {
            accessorKey: 'created_at',
            header: ({ column }) => {
                return (
                    <div
                        className="flex items-center cursor-pointer"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Date & Time
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                )
            },
            cell: ({ row }) => formatDate(row.getValue('created_at')),
        },
        {
            accessorKey: 'movement_type',
            header: "Type",
            cell: ({ row }) => {
                const type = row.getValue('movement_type') as string;
                return (
                    <Badge 
                        variant={
                            type === 'in' 
                                ? 'outline' 
                                : type === 'out' 
                                    ? 'destructive' 
                                    : 'secondary'
                        }
                        className={
                            type === 'in' 
                                ? 'text-green-600 border-green-300' 
                                : type === 'out' 
                                    ? '' 
                                    : ''
                        }
                    >
                        {type === 'in' ? 'Stock In' : type === 'out' ? 'Stock Out' : 'Adjustment'}
                    </Badge>
                );
            },
        },
        {
            accessorKey: 'quantity',
            header: ({ column }) => {
                return (
                    <div
                        className="flex items-center cursor-pointer"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Quantity
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                )
            },
            cell: ({ row }) => {
                const type = row.getValue('movement_type') as string;
                const quantity = Math.abs(row.getValue('quantity') as number);
                return (
                    <span className={
                        type === 'in' 
                            ? 'text-green-600 font-medium' 
                            : type === 'out' 
                                ? 'text-red-600 font-medium' 
                                : 'text-blue-600 font-medium'
                    }>
                        {type === 'in' ? '+' : type === 'out' ? '-' : '±'}{quantity}
                    </span>
                );
            },
        },
    ];

    const table = useReactTable({
        data: filteredMovements,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        state: {
            sorting,
            columnFilters,
        },
    });

    const StockStatusBadge = () => {
        if (data.quantity <= 0) {
            return <Badge variant="destructive">Out of Stock</Badge>;
        } else if (data.quantity <= data.reorder_level) {
            return <Badge variant="outline" className="text-amber-600 border-amber-300">Low Stock</Badge>;
        } else {
            return <Badge variant="outline" className="text-green-600 border-green-300">In Stock</Badge>;
        }
    };

    const InfoItem = ({ label, value }: { label: string, value: React.ReactNode }) => (
        <div className="flex justify-between items-center py-2">
            <span className="text-muted-foreground">{label}</span>
            <span className="font-medium">{value}</span>
        </div>
    );

    return (
        <>
            <div className="border-b">
                <div className="flex">
                    <button
                        onClick={() => setActiveTab('details')}
                        className={cn(
                            "px-4 py-2 font-medium text-sm border-b-2 -mb-px",
                            activeTab === 'details' 
                                ? "border-primary text-primary" 
                                : "border-transparent text-muted-foreground hover:text-foreground"
                        )}
                    >
                        Product Details
                    </button>
                    <button
                        onClick={() => setActiveTab('movements')}
                        className={cn(
                            "px-4 py-2 font-medium text-sm border-b-2 -mb-px",
                            activeTab === 'movements' 
                                ? "border-primary text-primary" 
                                : "border-transparent text-muted-foreground hover:text-foreground"
                        )}
                    >
                        Stock Movements
                    </button>
                </div>
            </div>

            {activeTab === 'details' ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                    <div className="lg:col-span-1 space-y-3">
                        {productImage.length > 0 ? (
                            <Card>
                                <CardContent className="p-0 overflow-hidden rounded-md">
                                    <img 
                                        src={productImageFile || ''} 
                                        alt={data.product_name} 
                                        className="w-full h-auto object-contain p-4"
                                        style={{ maxHeight: '240px' }}
                                    />
                                </CardContent>
                            </Card>
                        ) : (
                            <Card>
                                <CardContent className="flex items-center justify-center h-48">
                                    <p className="text-muted-foreground">No image available</p>
                                </CardContent>
                            </Card>
                        )}

                        <Card>
                            <CardHeader>
                                <CardTitle>Inventory Status</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex flex-col space-y-1">
                                        <span className="text-muted-foreground text-sm">Quantity</span>
                                        <span className="text-xl font-bold">{data.quantity}</span>
                                    </div>
                                    <div className="flex flex-col space-y-1">
                                        <span className="text-muted-foreground text-sm">Reorder Level</span>
                                        <span className="text-xl font-bold">{data.reorder_level}</span>
                                    </div>
                                </div>
                                <div className="h-px w-full bg-border my-3" />
                                <InfoItem label="Status" value={<StockStatusBadge />} />
                                <InfoItem label="Last Restocked" value={formatDate(data.last_restocked)} />
                            </CardContent>
                        </Card>
                    </div>

                    <div className="lg:col-span-2 space-y-3">
                        <Card>
                            <CardHeader>
                                <CardTitle>Description</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">{data.product_description || 'No description available'}</p>
                            </CardContent>
                        </Card>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Product Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <InfoItem label="Brand" value={data.product_brand} />
                                    <InfoItem label="Category" value={data.product_category} />
                                    <InfoItem 
                                        label="Price" 
                                        value={`₱ ${typeof data.product_price === 'number' 
                                            ? data.product_price.toLocaleString('fil-PH', { minimumFractionDigits: 2 }) 
                                            : data.product_price}`} 
                                    />
                                    {data.product_size && (
                                        <InfoItem label="Size" value={data.product_size} />
                                    )}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Supplier Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <InfoItem 
                                        label="Name" 
                                        value={supplierInfo.name} 
                                    />
                                    <InfoItem 
                                        label="Email" 
                                        value={supplierInfo.email} 
                                    />
                                    <InfoItem 
                                        label="Phone" 
                                        value={supplierInfo.phone} 
                                    />
                                    <InfoItem 
                                        label="Address" 
                                        value={supplierInfo.address} 
                                    />
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            ) : (
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Stock Movement History</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {filteredMovements && filteredMovements.length > 0 ? (
                            <div>
                                <Card className="mb-4 border-dashed">
                                    <CardContent className="pt-6">
                                        <div className="flex flex-col gap-3">
                                            <h3 className="text-sm font-medium flex items-center">
                                                <Calendar className="h-4 w-4 mr-2" />
                                                Filter Stock Movements by Date
                                            </h3>
                                            <div className="flex flex-col gap-4">
                                                <DateRangePicker
                                                    from={dateFrom}
                                                    to={dateTo}
                                                    setFrom={setDateFrom}
                                                    setTo={setDateTo}
                                                />
                                                
                                                {(dateFrom || dateTo) && (
                                                    <div className="flex justify-end">
                                                        <Button
                                                            variant="outline"
                                                            onClick={clearDateFilter}
                                                            size="sm"
                                                            className="flex items-center"
                                                        >
                                                            <X className="mr-2 h-4 w-4" />
                                                            Clear Filter
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            {dateFrom && dateTo && (
                                                <div className="mt-2 text-xs text-muted-foreground flex items-center">
                                                    <Info className="h-3 w-3 mr-1" /> 
                                                    Showing {filteredMovements.length} movements from {format(dateFrom, "PPP")} to {format(dateTo, "PPP")}.
                                                </div>
                                            )}
                                            {dateFrom && !dateTo && (
                                                <div className="mt-2 text-xs text-muted-foreground flex items-center">
                                                    <Info className="h-3 w-3 mr-1" /> 
                                                    Showing {filteredMovements.length} movements from {format(dateFrom, "PPP")} onwards.
                                                </div>
                                            )}
                                            {!dateFrom && dateTo && (
                                                <div className="mt-2 text-xs text-muted-foreground flex items-center">
                                                    <Info className="h-3 w-3 mr-1" /> 
                                                    Showing {filteredMovements.length} movements up to {format(dateTo, "PPP")}.
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>

                                <div className="py-4">
                                    <div className="flex flex-col gap-3">
                                    </div>
                                </div>

                                <div className="relative mt-2 pl-4 border-l-2 border-border">
                                    {table.getRowModel().rows.map((row, i) => {
                                        const movement = row.original;
                                        const type = row.getValue('movement_type') as string;
                                        const quantity = Math.abs(row.getValue('quantity') as number);
                                        const dateTime = new Date(row.getValue('created_at') as string);
                                        const formattedDate = dateTime.toLocaleDateString(undefined, {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                        });
                                        const formattedTime = dateTime.toLocaleTimeString(undefined, {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        });

                                        // Mock data for demonstration - in production, these would come from backend
                                        const mockUserName = type === 'in' ? 'John Doe' : type === 'out' ? 'Jane Smith' : 'System Admin';
                                        const mockReferenceNumber = `REF-${Math.floor(10000 + Math.random() * 90000)}`;
                                        const mockReferenceType = type === 'in' ? 'purchase_order' : type === 'out' ? 'sales_order' : 'inventory_check';
                                        const mockNotes = type === 'in' 
                                            ? 'Received inventory from supplier' 
                                            : type === 'out' 
                                                ? 'Fulfilled customer order' 
                                                : 'Adjusted inventory after stock count';
                                        const mockPreviousQuantity = Math.max(0, data.quantity - (type === 'in' ? quantity : -quantity));
                                        const mockLocation = 'Main Warehouse';
                                        const mockReasonCode = type === 'in' ? 'PO-RECEIVE' : type === 'out' ? 'SO-FULFILL' : 'ADJ-COUNT';

                                        const getRefLabel = (refType: string) => {
                                            switch(refType) {
                                                case 'purchase_order': return 'Purchase Order';
                                                case 'sales_order': return 'Sales Order';
                                                case 'return': return 'Return';
                                                case 'internal_transfer': return 'Internal Transfer';
                                                case 'inventory_check': return 'Inventory Check';
                                                default: return 'Reference';
                                            }
                                        };

                                        return (
                                            <div key={row.id} className="mb-6 relative">
                                                {/* Timeline dot */}
                                                <div 
                                                    className={cn(
                                                        "absolute w-4 h-4 rounded-full -left-[10px] top-1.5 border-2 border-background",
                                                        type === 'in' ? "bg-green-500" : 
                                                        type === 'out' ? "bg-red-500" : 
                                                        "bg-blue-500"
                                                    )}
                                                />

                                                {/* Content card */}
                                                <div className="ml-4 bg-card border rounded-lg p-4 shadow-sm hover:shadow transition-shadow">
                                                    {/* Header with badges and timestamp */}
                                                    <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                                                        <div className="flex items-center gap-2">
                                                            <Badge 
                                                                variant={
                                                                    type === 'in' ? 'outline' : 
                                                                    type === 'out' ? 'destructive' : 
                                                                    'secondary'
                                                                }
                                                                className={cn(
                                                                    "font-medium",
                                                                    type === 'in' ? 'text-green-600 border-green-300' : 
                                                                    type === 'out' ? '' : 
                                                                    ''
                                                                )}
                                                            >
                                                                {type === 'in' ? 'Stock In' : type === 'out' ? 'Stock Out' : 'Adjustment'}
                                                            </Badge>
                                                            <Badge variant="outline" className="text-muted-foreground">
                                                                ID: {row.original.id}
                                                            </Badge>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex items-center gap-1 text-muted-foreground text-sm">
                                                                <Calendar className="h-3.5 w-3.5 mr-1" />
                                                                {formattedDate}
                                                                <Clock className="h-3.5 w-3.5 mx-1" />
                                                                {formattedTime}
                                                            </div>

                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                        <MoreHorizontal className="h-4 w-4" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <DropdownMenuItem 
                                                                        onClick={() => handleEditMovement(movement)}
                                                                        className="cursor-pointer"
                                                                    >
                                                                        <Pencil className="mr-2 h-4 w-4" />
                                                                        Edit
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem 
                                                                        onClick={() => handleDeleteMovement(movement)}
                                                                        className="cursor-pointer text-destructive focus:text-destructive"
                                                                    >
                                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                                        Delete
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </div>
                                                    </div>

                                                    {/* Primary movement information */}
                                                    <div className="flex items-center mb-4 border-b pb-3">
                                                        {type === 'in' && <ArrowUp className="h-6 w-6 text-green-500 mr-2" />}
                                                        {type === 'out' && <ArrowDown className="h-6 w-6 text-red-500 mr-2" />}
                                                        {type === 'adjustment' && <RefreshCw className="h-6 w-6 text-blue-500 mr-2" />}

                                                        <span className={cn(
                                                            "font-medium text-xl",
                                                            type === 'in' ? 'text-green-600' : 
                                                            type === 'out' ? 'text-red-600' : 
                                                            'text-blue-600'
                                                        )}>
                                                            {type === 'in' ? '+' : type === 'out' ? '-' : '±'}{quantity}
                                                        </span>
                                                        <span className="ml-2 text-muted-foreground">
                                                            units
                                                        </span>

                                                        <div className="ml-auto flex items-center text-sm">
                                                            <span className="text-muted-foreground mr-2">Stock Level:</span>
                                                            <Badge variant="outline" className="font-medium">
                                                                {mockPreviousQuantity} → {type === 'in' ? mockPreviousQuantity + quantity : mockPreviousQuantity - quantity}
                                                            </Badge>
                                                        </div>
                                                    </div>

                                                    {/* Details section */}
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                                        <div className="flex items-start gap-2">
                                                            <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                                                            <div>
                                                                <div className="font-medium">Processed by</div>
                                                                <div className="text-muted-foreground">{mockUserName}</div>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-start gap-2">
                                                            <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                                                            <div>
                                                                <div className="font-medium">{getRefLabel(mockReferenceType)}</div>
                                                                <div className="text-muted-foreground">{mockReferenceNumber}</div>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-start gap-2">
                                                            <Hash className="h-4 w-4 text-muted-foreground mt-0.5" />
                                                            <div>
                                                                <div className="font-medium">Reason Code</div>
                                                                <div className="text-muted-foreground">{mockReasonCode}</div>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-start gap-2">
                                                            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                                                            <div>
                                                                <div className="font-medium">Location</div>
                                                                <div className="text-muted-foreground">{mockLocation}</div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Notes section */}
                                                    {mockNotes && (
                                                        <div className="mt-3 flex items-start gap-2 border-t pt-3 text-sm">
                                                            <Info className="h-4 w-4 text-muted-foreground mt-0.5" />
                                                            <div>
                                                                <div className="font-medium">Notes</div>
                                                                <div className="text-muted-foreground">{mockNotes}</div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Pagination controls would go here if needed */}
                                <div className="flex items-center justify-between py-4">
                                    <div className="text-sm text-muted-foreground">
                                        Showing {table.getRowModel().rows.length} movements
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => table.previousPage()}
                                            disabled={!table.getCanPreviousPage()}
                                            className={cn(
                                                "rounded-md border px-2.5 py-1.5 text-sm font-medium",
                                                !table.getCanPreviousPage() ? "opacity-50 cursor-not-allowed" : "hover:bg-accent"
                                            )}
                                        >
                                            Previous
                                        </button>
                                        <span className="text-sm text-muted-foreground">
                                            Page {table.getState().pagination.pageIndex + 1} of{" "}
                                            {table.getPageCount()}
                                        </span>
                                        <button
                                            onClick={() => table.nextPage()}
                                            disabled={!table.getCanNextPage()}
                                            className={cn(
                                                "rounded-md border px-2.5 py-1.5 text-sm font-medium",
                                                !table.getCanNextPage() ? "opacity-50 cursor-not-allowed" : "hover:bg-accent"
                                            )}
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <Calendar className="h-10 w-10 text-muted-foreground mb-2" />
                                <h3 className="text-lg font-medium">No movements found</h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {dateFrom || dateTo 
                                        ? "No stock movements found in the selected date range." 
                                        : "No stock movements have been recorded yet."}
                                </p>
                                {(dateFrom || dateTo) && (
                                    <Button
                                        variant="outline"
                                        onClick={clearDateFilter}
                                        className="mt-4"
                                    >
                                        Clear Date Filter
                                    </Button>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

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
