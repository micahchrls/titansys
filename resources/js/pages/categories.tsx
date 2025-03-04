import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Manage Categories',
        href: '/categories',
    },
];

export default function Categories() {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Manage Categories" />
      <div className="flex h-full flex-1 flex-col p-6">
        <div className="flex items-center justify-between pb-6">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Manage Categories</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your category information, add new categories, and view category details.
            </p>
          </div>
        </div>
        {/* <CategoriesList /> */}
      </div>
    </AppLayout>
  )
}
