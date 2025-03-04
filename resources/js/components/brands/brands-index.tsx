import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Brand } from '@/pages/brands';
import { Pencil, Plus, Trash } from 'lucide-react';
import DataTable from '@/components/datatable';
import { SearchFilter } from "@/components/search-filter";
import DataTablePagination from "@/components/pagination";
import { router } from '@inertiajs/react';
import { useCallback, useEffect, useState } from 'react';
import { useDebounce } from "@/hooks/use-debounce";

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

const columns = [
    { key: 'name', header: 'Name' },
    { key: 'description', header: 'Description' },
    {
        key: 'actions',
        header: 'Actions',
        render: () => (
            <div className="text-right">
                <Button variant="ghost" size="sm">
                    <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                    <Trash className="h-4 w-4" />
                </Button>
            </div>
        ),
    },
];

export default function BrandsIndex({ brands, filters = {} }: BrandsIndexProps) {
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const debouncedSearch = useDebounce(searchTerm, 300);
    
    const handleSearch = useCallback((value: string) => {
        setSearchTerm(value);
    }, []);

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
        
        router.visit(`${window.location.pathname}?${params.toString()}`, {
            preserveState: true,
            preserveScroll: true,
            replace: true
        });
    }, [debouncedSearch, filters?.search]);

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-end space-y-0 pb-2">
                <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Supplier
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
    );
}
