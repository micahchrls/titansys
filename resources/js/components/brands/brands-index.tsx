import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Brand } from '@/pages/brands';
import { Pencil, Plus, Trash } from 'lucide-react';
import DataTable from '@/components/datatable';
import { SearchFilter } from "@/components/search-filter";
import DataTablePagination from "@/components/pagination";
import { useCallback, useEffect, useState } from 'react';
import { useDebounce } from "@/hooks/use-debounce";
import { BrandFormDialog } from '@/components/brands/brand-form-dialog';
import { DeleteBrandDialog } from '@/components/brands/delete-brand-dialog';
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
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedBrand, setSelectedBrand] = useState<Brand | undefined>();
    
    const handleSearch = useCallback((value: string) => {
        setSearchTerm(value);
    }, []);

    const handleEdit = (brand: Brand) => {
        setSelectedBrand(brand);
        setFormDialogOpen(true);
    };

    const handleDelete = (brand: Brand) => {
        setSelectedBrand(brand);
        setDeleteDialogOpen(true);
    };

    // Handle the debounced search term
    useEffect(() => {
        if (debouncedSearch === filters?.search) return;
        
        const params = new URLSearchParams(window.location.search);
        
        if (debouncedSearch) {
            params.set('search', debouncedSearch);
        } else {
            params.delete('search');
        }
        params.delete('page');
        
        // router.get(window.location.pathname, {
        //     data: Object.fromEntries(params),
        //     preserveState: true,
        //     preserveScroll: true,
        //     replace: true
        // });
    }, [debouncedSearch, filters?.search]);

    const columns = [
        { key: 'name', header: 'Name' },
        { key: 'description', header: 'Description' },
        {
            key: 'actions',
            header: 'Actions',
            render: (brand: Brand) => (
                <div className="text-right space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(brand)}>
                        <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(brand)}>
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
                onOpenChange={(open) => {
                    setFormDialogOpen(open);
                    if (!open) setSelectedBrand(undefined);
                }}
                brand={selectedBrand}
            />

            {selectedBrand && (
                <DeleteBrandDialog
                    open={deleteDialogOpen}
                    onOpenChange={(open) => {
                        setDeleteDialogOpen(open);
                        if (!open) setSelectedBrand(undefined);
                    }}
                    brand={selectedBrand}
                />
            )}

            <Toaster />
        </>
    );
}
