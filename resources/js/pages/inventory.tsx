import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { InventoryOverview } from '@/components/inventory/inventory-overview';
import { ProductsTable } from '@/components/inventory/products-table';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Inventory',
        href: '/inventory',
    },
];

export default function Inventory() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Inventory" />
            <div className="flex h-full flex-1 flex-col p-6">
                <div className="flex items-center justify-between pb-6">
                    <h2 className="text-2xl font-semibold tracking-tight">Inventory Overview</h2>
                </div>

                <InventoryOverview />
                
                <div className="mt-6">
                    <ProductsTable />
                </div>
            </div>
        </AppLayout>
    );
}
