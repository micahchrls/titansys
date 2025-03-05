import { Button } from '@/components/ui/button';
import { useDebounce } from '@/hooks/use-debounce';
import { Supplier } from '@/types';
import { router } from '@inertiajs/react';
import { Pencil, Plus, Trash } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { SupplierFormDialog } from '@/components/suppliers/supplier-form-dialog';
import { SupplierEdit } from '@/components/suppliers/supplier-edit';
import { SupplierDelete } from '@/components/suppliers/supplier-delete';
import { Toaster } from 'sonner';

interface SuppliersIndexProps {
    suppliers: {
        data: Supplier[];
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

export default function SuppliersIndex({ suppliers, filters = {} }: SuppliersIndexProps) {
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const debouncedSearch = useDebounce(searchTerm, 300);
    const [formDialogOpen, setFormDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedSupplierId, setSelectedSupplierId] = useState<number | null>(null);

    const handleSearch = useCallback((value: string) => {
        setSearchTerm(value);
    }, []);

    const handleEdit = (supplier: Supplier) => {
        setSelectedSupplierId(supplier.id);
        setEditDialogOpen(true);
    };

    const handleDelete = (supplier: Supplier) => {
        setSelectedSupplierId(supplier.id);
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

    const columns: ColumnDef<Supplier>[] = [
        {
            accessorKey: 'name',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
            enableSorting: true,
        },
        {
            accessorKey: 'contact_name',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Contact Name" />,
            enableSorting: true,
        },
        {
            accessorKey: 'phone',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Phone" />,
            enableSorting: true,
        },
        {
            accessorKey: 'email',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
            enableSorting: true,
        },
        {
            id: 'actions',
            cell: ({ row }) => {
                const supplier = row.original;
                return (
                    <div className="space-x-2 text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(supplier)}>
                            <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(supplier)}>
                            <Trash className="h-4 w-4" />
                        </Button>
                    </div>
                );
            },
        },
    ];

    return (
        <>
            <Card>
                <CardHeader className="flex flex-row items-center justify-end space-y-0 pb-2">
                    <Button size="sm" onClick={() => setFormDialogOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Supplier
                    </Button>
                </CardHeader>
                <CardContent>
                    <DataTable 
                        columns={columns} 
                        data={suppliers.data} 
                        pagination={suppliers}
                        searchKey="name"
                        searchValue={searchTerm}
                        onSearchChange={handleSearch}
                    />
                </CardContent>
            </Card>

            <SupplierFormDialog
                open={formDialogOpen}
                onOpenChange={setFormDialogOpen}
            />

            <SupplierEdit
                open={editDialogOpen}
                onOpenChange={setEditDialogOpen}
                suppliers={suppliers.data}
                selectedSupplierId={selectedSupplierId}
            />

            <SupplierDelete
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                suppliers={suppliers.data}
                selectedSupplierId={selectedSupplierId}
            />

            <Toaster />
        </>
    );
}
