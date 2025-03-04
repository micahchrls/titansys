import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { UsersList } from '@/components/users/users-list';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Manage Users',
        href: '/users',
    }
];

export default function Users() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manage Users" />
            <div className="flex h-full flex-1 flex-col p-6">
                <div className="flex items-center justify-between pb-6">
                    <div>
                        <h2 className="text-2xl font-semibold tracking-tight">Manage Users</h2>
                        <p className="text-sm text-muted-foreground mt-1">
                            Manage user accounts, add new users, and view user details.
                        </p>
                    </div>
                </div>
                {/* <UsersList /> */}
            </div>
        </AppLayout>
    );
}
