import { Store } from '@/types';
import { useCallback, useEffect, useState } from 'react';
import { useDebounce } from '@/hooks/use-debounce';
import { router } from '@inertiajs/react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Trash } from 'lucide-react';
import { Pencil } from 'lucide-react';

interface StoresIndexProps {
    stores: {
        data: Store[];
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

export default function StoresIndex({ stores, filters = {} }: StoresIndexProps) {
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const debouncedSearch = useDebounce(searchTerm, 300);
    const [formDialogOpen, setFormDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null);

    const handleSearch = useCallback((value: string) => {
        setSearchTerm(value);
    }, []);

    const handleEdit = (store: Store) => {
        setSelectedStoreId(store.id);
        setEditDialogOpen(true);
    };

    const handleDelete = (store: Store) => {
        setSelectedStoreId(store.id);
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

    const columns: ColumnDef<Store>[] = [
        {
            accessorKey: 'name',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
            enableSorting: true,
        },
        {
            accessorKey: 'location_address',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Location Address" />,
            enableSorting: true,
        },
        {
            accessorKey: 'contact_number',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Contact Number" />,
            enableSorting: true,
        },
        {
            id: 'actions',
            cell: ({ row }) => {
                const store = row.original;
                return (
                    <div className="space-x-2 text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(store)}>
                            <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(store)}>
                            <Trash className="h-4 w-4" />
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
                    <CardTitle className="text-xl font-bold">Stores</CardTitle>
                    <Button size="sm" onClick={() => setFormDialogOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Store
                    </Button>
                </CardHeader>
                <CardContent>
                    <DataTable
                        columns={columns}
                        data={stores.data}
                        pagination={stores}
                        searchKey="name"
                        searchValue={searchTerm}
                        onSearchChange={handleSearch}
                    />
                </CardContent>
            </Card>

            {/* <StoreFormDialog open={formDialogOpen} onOpenChange={setFormDialogOpen} />

            <StoreEdit open={editDialogOpen} onOpenChange={setEditDialogOpen} stores={stores.data} selectedStoreId={selectedStoreId} />

            <StoreDelete open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} stores={stores.data} selectedStoreId={selectedStoreId} />

            <Toaster /> */}
        </div>
    );
}
