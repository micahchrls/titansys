import { Button } from '@/components/ui/button';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { Card, CardTitle, CardContent, CardHeader } from '@/components/ui/card';
import { useDebounce } from '@/hooks/use-debounce';
import { Product } from '@/types/index';
import { router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { Pencil, Plus, Trash } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { Toaster } from 'sonner';

interface ProductsIndexProps {
    products: {
        data: Product[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        links: Array<{
            url: string | null;
            label: string;
            active: boolean;
        }>;
    };
    filters?: {
        search?: string;
    };
}
export default function ProductsIndex({ products, filters = {} }: ProductsIndexProps) {
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const debouncedSearch = useDebounce(searchTerm, 300);
    const [formDialogOpen, setFormDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedProductId, setSelectedProductId] = useState<number | null>(null);

    const handleSearch = useCallback((value: string) => {
        setSearchTerm(value);
    }, []);

    const handleEdit = (product: Product) => {
        setSelectedProductId(product.id);
        setEditDialogOpen(true);
    };

    const handleDelete = (product: Product) => {
        setSelectedProductId(product.id);
        setDeleteDialogOpen(true);
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

    const columns: ColumnDef<Product>[] = [
        {
            accessorKey: 'sku',
            header: ({ column }) => <DataTableColumnHeader column={column} title="SKU" />,
            enableSorting: true,
        },
        {
            accessorKey: 'name',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
            enableSorting: true,
        },
        {
            accessorKey: 'product_brand',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Brand" />,
            enableSorting: true,
            cell: ({ row }) => {
                const product = row.original;
                return <div>{product.brand?.name}</div>;
            },
        },
        {
            accessorKey: 'product_category',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Category" />,
            enableSorting: true,
            cell: ({ row }) => {
                const product = row.original;
                return <div>{product.category?.name}</div>;
            },
        },
        {
            accessorKey: 'description',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Description" />,
            enableSorting: true,
        },
        {
            accessorKey: 'price',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Price" />,
            enableSorting: true,
        },
        {
            accessorKey: 'size',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Size" />,
            enableSorting: true,
        },
        {
            id: 'actions',
            cell: ({ row }) => {
                const product = row.original;
                return (
                    <div className="space-x-2 text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(product)}>
                            <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(product)}>
                            <Trash className="h-4 w-4" />
                        </Button>
                    </div>
                );
            },
        },
    ];
    return <div className="space-y-6">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl font-bold">Products</CardTitle>
                <Button size="sm" onClick={() => setFormDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Product
                </Button>
            </CardHeader>
            <CardContent>
                <DataTable
                    columns={columns}
                    data={products.data}
                    pagination={products}
                    searchKey="name"
                    searchValue={searchTerm}
                    onSearchChange={handleSearch}
                />
            </CardContent>
        </Card>
    </div>;
}
