import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Supplier } from '@/types/index';
import { usePage } from '@inertiajs/react';
import SuppliersIndex from '@/components/suppliers/suppliers-index';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Manage Suppliers',
        href: '/suppliers',
    }
];


export default function Suppliers() {
    const { suppliers } = usePage<{ suppliers: Supplier[] }>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manage Suppliers" />
            <div className="flex h-full flex-1 flex-col p-6">
                <div className="flex items-center justify-between pb-6">
                    <div>
                        <h2 className="text-2xl font-semibold tracking-tight">Manage Suppliers</h2>
                        <p className="text-sm text-muted-foreground mt-1">
                            Manage your supplier information, add new suppliers, and view supplier details.
                        </p>
                    </div>
                </div>
                <SuppliersIndex suppliers={suppliers} />
            </div>
        </AppLayout>    
    );
}