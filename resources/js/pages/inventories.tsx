import { InventoryOverview } from '@/components/inventories/inventory-overview';
import AppLayout from '@/layouts/app-layout';
import { Head, usePage } from '@inertiajs/react';
import { Inventory, type BreadcrumbItem } from '@/types';
import InventoriesIndex from '@/components/inventories/inventories-index';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Inventory',
        href: '/inventories',
    },
];

interface PageProps {
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
        }
    };
    filters?: {
        search?: string;
    }
}

export default function Inventories() {
    const { inventories, filters } = usePage<PageProps>().props;
    
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Inventory" />
            <div className="flex h-full flex-1 flex-col p-6">
                <div className="flex items-center justify-between pb-6">
                    <div>
                        <h2 className="text-2xl font-semibold tracking-tight">Inventory Overview</h2>
                        <p className="text-muted-foreground mt-1 text-sm">Monitor stock levels, manage product inventory, and track inventory movements.</p>
                    </div>
                </div>

                <InventoryOverview />

                <InventoriesIndex inventories={inventories} filters={filters} />
            </div>
        </AppLayout>
    );
}
