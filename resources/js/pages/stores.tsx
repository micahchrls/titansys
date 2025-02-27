import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { StoresList } from '@/components/stores/stores-list';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Manage Store',
        href: '/stores',
    },
];

export default function Stores() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manage Store" />
            <div className="flex h-full flex-1 flex-col p-6">
                <div className="flex items-center justify-between pb-6">
                    <h2 className="text-2xl font-semibold tracking-tight">Manage Store</h2>
                </div>
                <StoresList />
            </div>
        </AppLayout>
    );
}
