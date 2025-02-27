import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { OverviewCards } from '@/components/dashboard/overview-cards';
import { SalesChart } from '@/components/dashboard/sales-chart';
import { TopProducts } from '@/components/dashboard/top-products';
import { LowStockAlerts } from '@/components/dashboard/low-stock-alerts';
import { CategorySales } from '@/components/dashboard/category-sales';
import { RevenueDistribution } from '@/components/dashboard/revenue-distribution';
import { RecentOrders } from '@/components/dashboard/recent-orders';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function Dashboard() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <OverviewCards />
                
                <div className="grid gap-6">
                    <SalesChart />
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    <CategorySales />
                    <RevenueDistribution />
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                        <RecentOrders />
                    </div>
                    <div>
                        <LowStockAlerts />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
