import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { BrandsList } from '@/components/brands/brands-list';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin',
        href: '/admin',
    },
    {
        title: 'Manage Brands',
        href: '/admin/brands',
    },
];

export default function Brands() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manage Brands" />
            <div className="flex h-full flex-1 flex-col p-6">
                <div className="flex items-center justify-between pb-6">
                    <h2 className="text-2xl font-semibold tracking-tight">Manage Brands</h2>
                </div>
                <BrandsList />
            </div>
        </AppLayout>
    );
}