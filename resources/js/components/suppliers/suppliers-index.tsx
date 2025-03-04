import { Button } from '@/components/ui/button';
import { useDebounce } from '@/hooks/use-debounce';
import { Supplier } from '@/types';
import { router } from '@inertiajs/react';
import { Pencil, Plus, Trash } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { SearchFilter } from '@/components/search-filter';
import DataTable from '@/components/datatable';
import DataTablePagination from '@/components/pagination';

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

    const columns = [
        { key: 'name' as keyof Supplier, header: 'Name' },
        { key: 'description' as keyof Supplier, header: 'Description' },
        {
            key: 'actions' as keyof Supplier,
            header: 'Actions',
            render: (_, row: Supplier) => (
                <div className="space-x-2 text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(row)}>
                        <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(row)}>
                        <Trash className="h-4 w-4" />
                    </Button>
                </div>
            ),
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
                    <SearchFilter value={searchTerm} onChange={handleSearch} placeholder="Search suppliers..." />
                    {/* <DataTable data={suppliers.data} columns={columns} />
                    <DataTablePagination data={suppliers} /> */}
                </CardContent>
            </Card>
        </>
    );
}
