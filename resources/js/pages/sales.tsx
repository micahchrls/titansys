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

interface SalesProps {
    sales: {
        data: Sale[];
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
}

export default function Sales({ sales, filters }: SalesProps) {
    
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
                <SalesIndex 
                    sales={sales.data} 
                    pagination={sales.meta}
                    filters={filters}
                />
            </div>
        </AppLayout>
    );
}
