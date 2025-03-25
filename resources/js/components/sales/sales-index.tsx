import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { useDebounce } from '@/hooks/use-debounce';
import { Sale } from '@/types/index';
import { Link, router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { Pencil, Plus, Trash } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

interface SalesIndexProps {
    sales: Sale[];
    pagination: {
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

export default function SalesIndex({ sales, pagination, filters = {} }: SalesIndexProps) {
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const debouncedSearch = useDebounce(searchTerm, 300);
    const [formDialogOpen, setFormDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedSaleId, setSelectedSaleId] = useState<number | null>(null);

    const handleSearch = useCallback((value: string) => {
        setSearchTerm(value);
    }, []);

    const handleEdit = (sale: Sale) => {
        setSelectedSaleId(sale.id);
        setEditDialogOpen(true);
    };

    const handleDelete = (sale: Sale) => {
        setSelectedSaleId(sale.id);
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

    const columns: ColumnDef<Sale>[] = [
        {
            accessorKey: 'sale_code',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Sale Code" />,
            enableSorting: true,
        },
        {
            accessorKey: 'store_name',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Store" />,
            enableSorting: true,
        },
        {
            accessorKey: 'user_name',
            header: ({ column }) => <DataTableColumnHeader column={column} title="User" />,
            enableSorting: true,
        },
        {
            accessorKey: 'total_price',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Total Price" />,
            enableSorting: true,
        },
        {
            accessorKey: 'status',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
            enableSorting: true,
        },
        {
            id: 'actions',
            cell: ({ row }) => {
                const sale = row.original;
                return (
                    <div className="space-x-2 text-right">
                        <Button
                            variant="outline"
                            size="sm"
                            className="text-primary hover:bg-primary/10 hover:text-primary"
                            onClick={() => handleEdit(sale)}
                        >
                            <Pencil className="mr-1 h-4 w-4" />
                            Edit
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => handleDelete(sale)}
                        >
                            <Trash className="mr-1 h-4 w-4" />
                            Delete
                        </Button>
                    </div>
                );
            },
        },
    ];
    
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xl font-bold">Sales</CardTitle>

                    <Button variant="default" size="sm" asChild>
                        <Link href="/sales/create" className="flex items-center">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Order
                        </Link>
                    </Button>
                </CardHeader>
                <CardContent>
                    <DataTable
                        columns={columns}
                        data={sales}
                        pagination={pagination}
                        searchKey="sale_code"
                        searchValue={searchTerm}
                        onSearchChange={handleSearch}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
