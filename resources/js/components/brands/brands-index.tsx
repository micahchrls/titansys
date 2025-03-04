import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Brand } from '@/types/index';
import { Pencil, Plus, Trash } from 'lucide-react';
import DataTable from '@/components/datatable';
import { SearchFilter } from "@/components/search-filter";
import DataTablePagination from "@/components/pagination";
import { router } from '@inertiajs/react';
import { useCallback, useEffect, useState } from 'react';
import { useDebounce } from "@/hooks/use-debounce";
import { BrandFormDialog } from '@/components/brands/brand-form-dialog';
import { BrandEdit } from '@/components/brands/brand-edit';
import { BrandDelete } from '@/components/brands/brand-delete';
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
            replace: true
        });
    }, [debouncedSearch, filters?.search]);

    const columns = [
        { key: 'name' as keyof Brand, header: 'Name' },
        { key: 'description' as keyof Brand, header: 'Description' },
        {
            key: 'actions' as keyof Brand,
            header: 'Actions',
            render: (_, row: Brand) => (
                <div className="text-right space-x-2">
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
                        Add Brand
                    </Button>
                </CardHeader>
                <CardContent>
                    <SearchFilter
                        value={searchTerm}
                        onChange={handleSearch}
                        placeholder="Search brands..."
                    />
                    <DataTable data={brands.data} columns={columns} />
                    <DataTablePagination data={brands} />
                </CardContent>
            </Card>

            <BrandFormDialog
                open={formDialogOpen}
                onOpenChange={setFormDialogOpen}
            />

            <BrandEdit
                open={editDialogOpen}
                onOpenChange={setEditDialogOpen}
                brands={brands.data}
                selectedBrandId={selectedBrandId}
            />

            <BrandDelete
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                brands={brands.data}
                selectedBrandId={selectedBrandId}
            />

            <Toaster />
        </>
    );
}
