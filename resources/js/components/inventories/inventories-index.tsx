import { useDebounce } from '@/hooks/use-debounce';
import { Inventory } from '@/types';
import { router, Link, useForm } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { useCallback, useEffect, useRef, useState } from 'react';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, FileText, Hash, X, AlertTriangle, CheckCircle2, Copy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Toaster } from 'sonner';
import InventoriesFormDialog from "@/components/inventories/inventories-form-dialog";
import InventoryDelete from "@/components/inventories/inventory-delete";
import { Badge } from '@/components/ui/badge';
import { InventoryFilters } from './inventory-filters';
import { toast } from "sonner";

interface InventoriesIndexProps {
    inventories: {
        data: Inventory[];
        meta?: {
            current_page: number;
            last_page: number;
            per_page: number;
            total: number;
            links: Array<{
                url: string | null;
                label: string;
                active: boolean;
            }>;
        }
    };
    filters?: {
        search?: string;
        brand?: string;
        category?: string;
        status?: string;
    };
    categories?: any[];
    brands?: any[];
    suppliers?: any[];
    stores?: any[];
}

export default function InventoriesIndex({ inventories, filters = {}, categories, brands, suppliers, stores }: InventoriesIndexProps) {
    // Use Inertia's useForm hook for better form state management
    const { data: filterData, setData, get, processing } = useForm({
        search: filters?.search || '',
        brand: filters?.brand || 'all',
        category: filters?.category || 'all',
        status: filters?.status || 'all',
    });
    
    // Reference to track if this is the initial mount
    const initialMount = useRef(true);
    
    // Local state for UI interaction
    const [formDialogOpen, setFormDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedInventoryId, setSelectedInventoryId] = useState<number | null>(null);

    // Debounced values for filters
    const debouncedSearch = useDebounce(filterData.search, 500);
    const debouncedBrand = useDebounce(filterData.brand, 500);
    const debouncedCategory = useDebounce(filterData.category, 500);
    const debouncedStatus = useDebounce(filterData.status, 500);

    // Handlers for filter changes using Inertia's setData
    const handleSearch = useCallback((value: string) => {
        setData('search', value);
    }, [setData]);

    const handleBrandChange = useCallback((value: string) => {
        setData('brand', value);
    }, [setData]);

    const handleCategoryChange = useCallback((value: string) => {
        setData('category', value);
    }, [setData]);

    const handleStatusChange = useCallback((value: string) => {
        setData('status', value);
    }, [setData]);

    const handleResetFilters = useCallback(() => {
        setData({
            search: '',
            brand: 'all',
            category: 'all',
            status: 'all',
        });
    }, [setData]);

    const handleEdit = (inventory: Inventory) => {
        setSelectedInventoryId(inventory.id);
        setEditDialogOpen(true);
    };

    const handleDelete = (inventory: Inventory) => {
        setSelectedInventoryId(inventory.id);
        setDeleteDialogOpen(true);
    };

    // Effect to handle debounced filter updates using Inertia's get method
    useEffect(() => {
        // Skip on initial mount
        if (initialMount.current) {
            initialMount.current = false;
            return;
        }

        // Skip if processing
        if (processing) return;

        // Skip if values match current URL params
        const currentSearch = filters?.search || '';
        const currentBrand = filters?.brand || 'all';
        const currentCategory = filters?.category || 'all';
        const currentStatus = filters?.status || 'all';
        
        if (
            debouncedSearch === currentSearch && 
            debouncedBrand === currentBrand && 
            debouncedCategory === currentCategory && 
            debouncedStatus === currentStatus
        ) {
            return;
        }

        // Use Inertia's get method with proper options
        get(route('inventories.index'), {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            only: ['inventories', 'filters'],
        });
    }, [debouncedSearch, debouncedBrand, debouncedCategory, debouncedStatus, processing, get]);

    const columns: ColumnDef<Inventory>[] = [
        {
            accessorKey: 'product_sku',
            header: ({ column }) => <DataTableColumnHeader column={column} title="SKU" />,
            enableSorting: true,
        },
        {
            accessorKey: 'part_number',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Part Number" />,
            enableSorting: true,
        },
        {
            accessorKey: 'vehicle',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Vehicle" />,
            enableSorting: true,
        },
        {
            accessorKey: 'code',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Code" />,
            enableSorting: true,
        },
        {
            accessorKey: 'product_brand',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Brand" />,
            enableSorting: true,
        },
        {
            accessorKey: 'product_category',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Category" />,
            enableSorting: true,
        },
        {
            accessorKey: 'quantity',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Quantity" />,
            enableSorting: true,
        },
        {
            accessorKey: 'reorder_level',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Reorder Level" />,
            enableSorting: true,
        },
        {
            id: "stock_status",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Stock Status" />,
            cell: ({ row }) => {
                const inventory = row.original;
                const quantity = inventory.quantity;
                const reorderLevel = inventory.reorder_level;
                
                // Define status based on quantity and reorder level
                let status;
                let className;
                let icon = null;
                
                if (quantity <= 0) {
                    status = "Out of Stock";
                    className = "bg-red-100 text-red-800 border-red-200";
                    icon = <X className="h-3.5 w-3.5 mr-1.5" />;
                } else if (quantity <= reorderLevel) {
                    status = "Low Stock";
                    className = "bg-amber-100 text-amber-800 border-amber-200";
                    icon = <AlertTriangle className="h-3.5 w-3.5 mr-1.5" />;
                } else {
                    status = "In Stock";
                    className = "bg-green-100 text-green-800 border-green-200";
                    icon = <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />;
                }
                
                return (
                    <div className="flex items-center">
                        <Badge variant="outline" className={`flex items-center px-2.5 py-0.5 ${className}`}>
                            {icon}
                            <span>{status}</span>
                        </Badge>
                    </div>
                );
            },
            enableSorting: false,
        },
        {
            id: "actions",
            header: () => <div className="text-right">Actions</div>,
            cell: ({ row }) => {
                const inventory = row.original;
                
                return (
                    <div className="flex justify-end gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                                navigator.clipboard.writeText(inventory.product_sku);
                                toast.success("SKU copied to clipboard");
                            }}
                            className="h-8 w-8"
                            title="Copy SKU"
                        >
                            <Copy className="h-4 w-4" />
                            <span className="sr-only">Copy SKU</span>
                        </Button>
                        {/* Use Inertia Link instead of manual router.visit */}
                        <Link
                            href={route('inventories.show', inventory.id)}
                            className="inline-flex items-center justify-center rounded-md h-8 w-8 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                            title="View details"
                        >
                            <FileText className="h-4 w-4" />
                            <span className="sr-only">View details</span>
                        </Link>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(inventory)}
                            className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                            title="Delete"
                        >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                        </Button>
                    </div>
                );
            },
        },
    ];

    // Extract pagination data from meta
    const paginationData = inventories.meta ? {
        current_page: inventories.meta.current_page,
        last_page: inventories.meta.last_page,
        per_page: inventories.meta.per_page,
        total: inventories.meta.total,
        links: inventories.meta.links,
    } : undefined;

    return (
        <div className="space-y-6">
            <Card className="shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                    <div className="space-y-1">
                        <CardTitle className="text-xl font-bold">Inventory Items</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Manage your inventory items across all locations
                        </p>
                    </div>
                    <Button 
                        size="sm" 
                        onClick={() => setFormDialogOpen(true)}
                        className="h-9 gap-1"
                    >
                        <Plus className="h-4 w-4" />
                        Add Inventory
                    </Button>
                </CardHeader>
                <CardContent className="space-y-5">
                    <InventoryFilters 
                        searchValue={filterData.search}
                        brandValue={filterData.brand}
                        categoryValue={filterData.category}
                        statusValue={filterData.status}
                        brands={brands}
                        categories={categories}
                        onSearchChange={handleSearch}
                        onBrandChange={handleBrandChange}
                        onCategoryChange={handleCategoryChange}
                        onStatusChange={handleStatusChange}
                        onResetFilters={handleResetFilters}
                    />
                    <div className="rounded-md border">
                        <DataTable 
                            columns={columns} 
                            data={inventories.data} 
                            pagination={paginationData}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Form Dialog */}
            <InventoriesFormDialog 
                open={formDialogOpen} 
                onOpenChange={setFormDialogOpen} 
                categories={categories}
                brands={brands}
                suppliers={suppliers}
                stores={stores}
            />
            
            {/* Delete Dialog */}
            <InventoryDelete 
                open={deleteDialogOpen} 
                onOpenChange={setDeleteDialogOpen} 
                inventories={inventories.data} 
                selectedInventoryId={selectedInventoryId} 
            />
            <Toaster />
        </div>
    );
}
