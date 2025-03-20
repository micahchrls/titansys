import { lazy, Suspense } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Inventory, type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

// Lazy load components
const InventoriesIndex = lazy(() => import('@/components/inventories/inventories-index'));
const InventoryOverview = lazy(() => import('@/components/inventories/inventory-overview'));

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Inventory',
        href: '/inventories',
    },
];

// Loading fallbacks
const OverviewSkeleton = () => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-4">
        {[...Array(4)].map((_, i) => (
            <Card key={i} className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-6 w-12" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                </CardContent>
            </Card>
        ))}
    </div>
);

const TableSkeleton = () => (
    <div className="space-y-6">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-9 w-32" />
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="flex justify-between">
                        <Skeleton className="h-10 w-64" />
                        <Skeleton className="h-10 w-32" />
                    </div>
                    <div className="space-y-2">
                        {[...Array(5)].map((_, i) => (
                            <Skeleton key={i} className="h-12 w-full" />
                        ))}
                    </div>
                    <div className="flex items-center justify-between pt-4">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-8 w-32" />
                    </div>
                </div>
            </CardContent>
        </Card>
    </div>
);

interface InventoriesProps {
    inventories: {
        data: Inventory[];
        meta: {
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
    };

    filters?: {
        search?: string;
    };
    categories: any[];
    brands: any[];
    suppliers: any[];
    stores: any[];
}

export default function Inventories({ inventories, filters, categories, brands, suppliers, stores }: InventoriesProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Inventory" />
            <div className="flex h-full flex-1 flex-col p-6">
                <div className="flex items-center justify-between pb-6">
                    <div>
                        <h2 className="text-2xl font-semibold tracking-tight">Inventory Overview</h2>
                        <p className="text-muted-foreground mt-1 text-sm">
                            Monitor stock levels, manage product inventory, and track inventory movements.
                        </p>
                    </div>
                </div>

                <Suspense fallback={<OverviewSkeleton />}>
                    <InventoryOverview />
                </Suspense>

                <Suspense fallback={<TableSkeleton />}>
                    <InventoriesIndex 
                        inventories={inventories} 
                        filters={filters} 
                        categories={categories}
                        brands={brands}
                        suppliers={suppliers}
                        stores={stores}
                    />
                </Suspense>
            </div>
        </AppLayout>
    );
}
