import { BrandDelete } from '@/components/brands/brand-delete';
import { BrandEdit } from '@/components/brands/brand-edit';
import { BrandFormDialog } from '@/components/brands/brand-form-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { useDebounce } from '@/hooks/use-debounce';
import { Brand } from '@/types/index';
import { router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { Pencil, Plus, Trash } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Toaster } from 'sonner';

interface BrandsIndexProps {
    brands: {
        data: Brand[];
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

export default function BrandsIndex({ brands, filters = {} }: BrandsIndexProps) {
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const debouncedSearch = useDebounce(searchTerm, 300);
    const [formDialogOpen, setFormDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedBrandId, setSelectedBrandId] = useState<number | null>(null);

    const handleSearch = useCallback((value: string) => {
        setSearchTerm(value);
    }, []);

    const handleEdit = (brand: Brand) => {
        setSelectedBrandId(brand.id);
        setEditDialogOpen(true);
    };

    const handleDelete = (brand: Brand) => {
        setSelectedBrandId(brand.id);
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

    const columns: ColumnDef<Brand>[] = [
        {
            accessorKey: 'name',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
            enableSorting: true,
        },
        {
            accessorKey: 'description',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Description" />,
            enableSorting: true,
        },
        {
            id: 'actions',
            cell: ({ row }) => {
                const brand = row.original;
                return (
                    <div className="space-x-2 text-right">
                        <Button
                            variant="outline"
                            size="sm"
                            className="text-primary hover:bg-primary/10 hover:text-primary"
                            onClick={() => handleEdit(brand)}
                        >
                            <Pencil className="mr-1 h-4 w-4" />
                            Edit
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => handleDelete(brand)}
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
                    <CardTitle className="text-xl font-bold">Brands</CardTitle>
                    <Button size="sm" onClick={() => setFormDialogOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Brand
                    </Button>
                </CardHeader>
                <CardContent>
                    <DataTable
                        columns={columns}
                        data={brands.data}
                        pagination={brands}
                        searchKey="name"
                        searchValue={searchTerm}
                        onSearchChange={handleSearch}
                    />
                </CardContent>
            </Card>

            <BrandFormDialog open={formDialogOpen} onOpenChange={setFormDialogOpen} />

            <BrandEdit open={editDialogOpen} onOpenChange={setEditDialogOpen} brands={brands.data} selectedBrandId={selectedBrandId} />

            <BrandDelete open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} brands={brands.data} selectedBrandId={selectedBrandId} />

            <Toaster />
        </div>
    );
}
