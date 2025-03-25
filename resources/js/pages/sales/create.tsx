import { type BreadcrumbItem } from '@/types';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import SalesCreate from '@/components/sales/sales-create';

export default function SaleCreate() {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Sales',
            href: '/sales',
        },
        {
            title: 'New Order',
            href: '/sales/create',
        },
    ];
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create New Order" />
            <div className="flex h-full flex-1 flex-col p-6">
                <div className="flex items-center justify-between pb-6">
                    <div>
                        <h2 className="text-2xl font-semibold tracking-tight">Create New Order</h2>
                        <p className="text-muted-foreground mt-1 text-sm">Create a new sales order by selecting products and quantities.</p>
                    </div>
                </div>
                <SalesCreate />
            </div>
        </AppLayout>
    );
}
