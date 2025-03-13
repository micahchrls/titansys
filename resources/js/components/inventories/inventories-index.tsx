import { useDebounce } from '@/hooks/use-debounce';
import { Inventory } from '@/types';
import { router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { useCallback, useEffect, useState } from 'react';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, FileText, Hash } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Toaster } from 'sonner';
import InventoriesFormDialog from "@/components/inventories/inventories-form-dialog";
import InventoryDelete from "@/components/inventories/inventory-delete";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from 'lucide-react';
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
    };
    categories?: any[];
    brands?: any[];
    suppliers?: any[];
}

export default function InventoriesIndex({ inventories, filters = {}, categories, brands, suppliers }: InventoriesIndexProps) {
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const debouncedSearch = useDebounce(searchTerm, 300);
    const [formDialogOpen, setFormDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedInventoryId, setSelectedInventoryId] = useState<number | null>(null);

    const handleSearch = useCallback((value: string) => {
        setSearchTerm(value);
    }, []);

    const handleEdit = (inventory: Inventory) => {
        setSelectedInventoryId(inventory.id);
        setEditDialogOpen(true);
    };

    const handleDelete = (inventory: Inventory) => {
        setSelectedInventoryId(inventory.id);
        setDeleteDialogOpen(true);
    };

    const handleView = (inventory: Inventory) => {
        router.visit(route('inventories.show', inventory.id));
    };

    useEffect(() => {
        if (debouncedSearch === filters?.search) return;

        const params = new URLSearchParams(window.location.search);

        if (debouncedSearch) {
            params.set('search', debouncedSearch);
        } else {
            params.delete('search');
        }
        params.delete('page');

        router.visit(`${window.location.pathname}?${params.toString()}`, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    }, [debouncedSearch, filters?.search]);

    const columns: ColumnDef<Inventory>[] = [
        {
            accessorKey: 'product_sku',
            header: ({ column }) => <DataTableColumnHeader column={column} title="SKU" />,
            enableSorting: true,
        },
        {
            accessorKey: 'product_name',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
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
            id: "actions",
            cell: ({ row }) => {
                const inventory = row.original
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild className="hover:cursor-pointer">
                            <Button variant="outline" size="sm" className="h-8">
                                <span className="text-xs">Actions</span>
                                <MoreHorizontal className="h-4 w-4 ml-1" />
                                <span className="sr-only">Open menu</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" >
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                                onClick={() => navigator.clipboard.writeText(inventory.product_sku)}
                                className="hover:cursor-pointer"
                            >
                                <Hash className="h-4 w-4 mr-2" />
                                Copy SKU
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleView(inventory)} className="hover:cursor-pointer">
                                <FileText className="h-4 w-4 mr-2" />
                                View details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(inventory)} className="text-red-600 hover:text-red-700 focus:text-red-700 hover:cursor-pointer">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
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
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xl font-bold">Inventory Items</CardTitle>
                    <Button size="sm" onClick={() => setFormDialogOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Inventory
                    </Button>
                </CardHeader>
                <CardContent>
                    <DataTable 
                        columns={columns} 
                        data={inventories.data} 
                        pagination={paginationData}
                        searchKey="product_name"
                        searchValue={searchTerm}
                        onSearchChange={handleSearch}
                    />
                </CardContent>
            </Card>

            {/* Uncomment when components are implemented */}
            <InventoriesFormDialog 
                open={formDialogOpen} 
                onOpenChange={setFormDialogOpen} 
                categories={categories}
                brands={brands}
                suppliers={suppliers}
            />
            
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
