import InventoriesShow from '@/components/inventories/inventories-show';
import AppLayout from '@/layouts/app-layout';
import { Inventory, type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

interface InventoryShowProps {
    inventory: {
        data: {
            id: number;
            product_id: number;
            product_name: string;
            product_sku: string;
            product_description: string;
            product_price: number;
            product_size: string;
            product_category: string;
            product_brand: string;
            supplier_name: string;
            quantity: number;
            reorder_level: number;
            last_restocked: string;
            image_url: string | null;
            created_at: string;
            updated_at: string;
        }
    };
}

export default function InventoryShow({ inventory }: InventoryShowProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Inventory',
            href: '/inventories',
        },
        {
            title: inventory.data.product_name,
            href: `/inventories/${inventory.data.id}`,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Inventory - ${inventory.data.product_name}`} />
            <div className="flex h-full flex-1 flex-col p-6">
                <InventoriesShow inventory={inventory} />
            </div>
        </AppLayout>
    );
}
