import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { SalesOverview } from "@/components/sales/sales-overview";
import { SalesTable } from "@/components/sales/sales-table";

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Sales',
    href: '/sales',
  },
];

export default function Sales() {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Sales" />
      <div className="flex h-full flex-1 flex-col p-6">
        <div className="flex items-center justify-between pb-6">
          <h2 className="text-2xl font-semibold tracking-tight">Sales Overview</h2>
        </div>

        <SalesOverview />
        
        <div className="mt-6">
          <SalesTable />
        </div>
      </div>
    </AppLayout>
  );
}
