import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { Store } from '@/types';
import StoresIndex from '@/components/stores/stores-index';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Manage Store',
        href: '/stores',
    },
];

interface StoresPageProps {
    stores: {
        data: Store[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        links: { url: string | null; label: string; active: boolean; }[];
    };
    filters: {
        search?: string;
    };
    [key: string]: any;
}

export default function Stores() {
    const { stores, filters } = usePage<StoresPageProps>().props;

    
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manage Store" />
            <div className="flex h-full flex-1 flex-col p-6">
                <div className="flex items-center justify-between pb-6">
                    <div>
                        <h2 className="text-2xl font-semibold tracking-tight">Manage Store</h2>
                        <p className="text-sm text-muted-foreground mt-1">
                            Manage your store information, add new stores, and view store details.
                        </p>
                    </div>
                </div>
                <StoresIndex stores={stores} filters={filters} />
            </div>
        </AppLayout>
    );
}
