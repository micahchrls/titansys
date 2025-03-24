import SalesIndex from '@/components/sales/sales-index';
import { SalesOverview } from '@/components/sales/sales-overview';
import AppLayout from '@/layouts/app-layout';
import { Sale, type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Sales',
        href: '/sales',
    },
];

export default function Sales() {
    const { sales } = usePage<{ sales: Sale[] }>().props;
    console.log(sales);
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manage Sales" />
            <div className="flex h-full flex-1 flex-col p-6">
                <div className="flex items-center justify-between pb-6">
                    <div>
                        <h2 className="text-2xl font-semibold tracking-tight">Manage Sales</h2>
                        <p className="text-muted-foreground mt-1 text-sm">Manage your sales information, add new sales, and view sales details.</p>
                    </div>
                </div>
                <SalesOverview />
                <SalesIndex sales={sales} />
            </div>
        </AppLayout>
    );
}
