import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { useDebounce } from '@/hooks/use-debounce';
import { Inventory, Sale } from '@/types/index';
import { Link, router, usePage } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { CheckCircle, FileText, Plus } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Toaster, toast } from 'sonner';
import SaleViewDialog from '@/components/sales/sale-view-dialog';

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
    const page = usePage<any>();
    const flash = page.props.flash || {};
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const debouncedSearch = useDebounce(searchTerm, 300);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
    const [selectedSaleId, setSelectedSaleId] = useState<number | null>(null);

    const handleSearch = useCallback((value: string) => {
        setSearchTerm(value);
    }, []);

    const handleView = (sale: Sale) => {
        setSelectedSale(sale);
        setViewDialogOpen(true);
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

    // Show toast when component mounts if there's a success message in URL parameter
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const successParam = urlParams.get('success');
        
        if (successParam === 'true' && urlParams.has('items') && urlParams.has('total')) {
            // Get other details from URL if available
            const itemCount = urlParams.get('items') || '';
            const totalAmount = urlParams.get('total') || '';
            
            // Create a consistent toast ID based on the URL parameters
            const toastId = `sale-success-${itemCount}-${totalAmount}`;
            
            // Check if this specific toast has already been shown in this session
            if (!sessionStorage.getItem(toastId)) {
                toast.success(`Sale order completed successfully!`, {
                    description: itemCount && totalAmount ? 
                        `Total items: ${itemCount} | Amount: ₱${totalAmount}` : 
                        "Your order has been processed successfully.",
                    duration: 5000,
                    icon: <CheckCircle className="h-5 w-5 text-green-500" />,
                    className: "border-green-500 bg-green-50",
                    id: toastId, // Set a unique ID for this toast
                });
                
                // Mark this toast as shown using sessionStorage instead of localStorage
                sessionStorage.setItem(toastId, 'shown');
            }
            
            // Remove success parameter from URL to prevent showing the toast on refresh
            urlParams.delete('success');
            urlParams.delete('items');
            urlParams.delete('total');
            
            const newUrl = window.location.pathname + 
                (urlParams.toString() ? `?${urlParams.toString()}` : '');
                
            window.history.replaceState({}, '', newUrl);
        }
    }, []); // Only run on component mount

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
            header: ({ column }) => <DataTableColumnHeader column={column} title="Processed by" />,
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
                        <Button variant="outline" onClick={() => handleView(sale)} size="sm" className="text-blue-500 hover:bg-blue-500/10 hover:text-blue-500" >
                                <FileText className="mr-1 h-4 w-4" />
                                View Order
                        </Button>
                    </div>
                );
            },
        },
    ];

    return (
        <div className="space-y-6">
            <Toaster />
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

            {/* View Sale Dialog */}
            <SaleViewDialog 
                sale={selectedSale} 
                isOpen={viewDialogOpen} 
                onClose={() => setViewDialogOpen(false)} 
            />
        </div>
    );
}
