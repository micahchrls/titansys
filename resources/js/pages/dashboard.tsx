import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { OverviewCards } from '@/components/dashboard/overview-cards';
import { SalesChart } from '@/components/dashboard/sales-chart';
import { LowStockAlerts } from '@/components/dashboard/low-stock-alerts';
import { CategorySales } from '@/components/dashboard/category-sales';
import { RevenueDistribution } from '@/components/dashboard/revenue-distribution';
import { RecentSaleTransactions } from '@/components/dashboard/recent-sale-transactions';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

interface DashboardProps {
    recentSales: {
        sale_code: string;
        store_name: string;
        processed_by: string;
        items_count: number;
        total_price: string;
        status: string;
        created_at: string;
    }[];
    totalRevenue: {
        title: string;
        value: string;
        description: string;
        trend: string;
    };
    totalSales: {
        title: string;
        value: string;
        description: string;
        trend: string;
    };
    lowStockItems: {
        title: string;
        value: string;
        items: {
            name: string;
            sku: string;
            currentStock: number;
            minRequired: number;
            status: string;
        }[];
        description: string;
        trend: string;
    };
    totalInventoryValue: {
        title: string;
        value: string;
        description: string;
        trend: string;
    };
    salesChartData: {
        name: string;
        sales: number;
        orders: number;
        profit: number;
    }[];
    recentSaleTransactions: {
        id: string;
        customer: string;
        items: number;
        total: string;
        status: string;
        date: string;
    }[];
}

export default function Dashboard() {
    const { recentSales, totalRevenue, totalSales, lowStockItems, totalInventoryValue, salesChartData, recentSaleTransactions } = usePage<{
        recentSales: DashboardProps['recentSales'];
        totalRevenue: DashboardProps['totalRevenue'];
        totalSales: DashboardProps['totalSales'];
        lowStockItems: DashboardProps['lowStockItems'];
        totalInventoryValue: DashboardProps['totalInventoryValue'];
        salesChartData: DashboardProps['salesChartData'];
        recentSaleTransactions: DashboardProps['recentSaleTransactions'];
    }>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 p-6">
                <OverviewCards />

                <div className="grid gap-4">
                    <SalesChart />
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="h-full">
                        <RecentSaleTransactions />
                    </div>
                    <div className="h-full">
                        <LowStockAlerts />
                    </div>
                </div>

                {/* <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="h-full">
                        <CategorySales />
                    </div>
                    <div className="h-full">
                        <RevenueDistribution />
                    </div>
                </div> */}
            </div>
        </AppLayout>
    );
}
