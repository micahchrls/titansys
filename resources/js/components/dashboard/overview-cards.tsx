import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePage } from '@inertiajs/react';
import { AlertTriangle, ArrowDownRight, ArrowUpRight, DollarSign, Package, ShoppingCart } from 'lucide-react';

interface DashboardProps {
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
            product_name: string;
            quantity: number;
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
}

export function OverviewCards() {
    const { totalRevenue, totalSales, lowStockItems, totalInventoryValue } = usePage<{
        totalRevenue: DashboardProps['totalRevenue'];
        totalSales: DashboardProps['totalSales'];
        lowStockItems: DashboardProps['lowStockItems'];
        totalInventoryValue: DashboardProps['totalInventoryValue'];
    }>().props;
    
    const stats = [
        {
            id: 'revenue',
            title: totalRevenue.title,
            value: totalRevenue.value,
            icon: DollarSign,
            description: totalRevenue.description,
            trend: totalRevenue.trend,
            trendIcon: totalRevenue.trend === 'up' ? ArrowUpRight : ArrowDownRight,
        },
        {
            id: 'sales',
            title: totalSales.title,
            value: totalSales.value,
            icon: ShoppingCart,
            description: totalSales.description,
            trend: totalSales.trend,
            trendIcon: totalSales.trend === 'up' ? ArrowUpRight : ArrowDownRight,
        },
        {
            id: 'inventory-value',
            title: totalInventoryValue.title,
            value: totalInventoryValue.value,
            icon: Package,
            description: totalInventoryValue.description,
            trend: totalInventoryValue.trend,
            trendIcon: totalInventoryValue.trend === 'up' ? ArrowUpRight : ArrowDownRight,
        },
        {
            id: 'low-stock',
            title: lowStockItems.title,
            value: lowStockItems.value,
            icon: AlertTriangle,
            description: lowStockItems.description,
            trend: lowStockItems.trend,
            trendIcon: lowStockItems.trend === 'up' ? ArrowUpRight : ArrowDownRight,
        },
    ];

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
                <Card key={stat.id} className="relative overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-muted-foreground text-sm font-medium">{stat.title}</CardTitle>
                        <div className="bg-muted/20 h-8 w-8 rounded-full p-1.5">
                            <stat.icon className="text-primary h-full w-full" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div className="text-2xl font-bold tracking-tight">{stat.value}</div>
                            <div className={`flex items-center text-sm font-medium ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                                <stat.trendIcon className="mr-1 h-3.5 w-3.5" />
                                <span>{stat.description}</span>
                            </div>
                        </div>
                    </CardContent>
                    <div className={`absolute bottom-0 left-0 h-1 w-full ${stat.trend === 'up' ? 'bg-green-500' : 'bg-red-500'} opacity-25`} />
                </Card>
            ))}
        </div>
    );
}
