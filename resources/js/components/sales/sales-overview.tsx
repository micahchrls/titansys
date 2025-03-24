import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowDownRight, ArrowUpRight, DollarSign, ShoppingCart, TrendingUp, Users, PesoSign } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { RefreshCw } from 'lucide-react';
import { usePage, router } from "@inertiajs/react";
import { useState } from "react";

interface PageProps {
    sales: {
        total_revenue: number;
        total_orders: number;
        average_order_value: number;
        unique_customers: number;
    };
}


interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: any;
  trend?: "up" | "down" | "none";
  trendIcon?: any;
  iconColor?: string;
}


export function SalesOverview() {
    const { sales } = usePage().props as unknown as PageProps;
    const [isRefreshing, setIsRefreshing] = useState(false);
    
    const handleRefresh = () => {
        setIsRefreshing(true);
        router.reload({ 
            only: ['sales'],
            onSuccess: () => {
                setIsRefreshing(false);
            },
            onError: () => {
                setIsRefreshing(false);
            }
        });
    };
    
    const stats: StatCardProps[] = [
        {
            title: 'Total Revenue',
            value: `$${sales?.total_revenue?.toLocaleString() || '0'}`,
            icon: PesoSign,
            description: '+15.3% from last month',
            trend: 'up',
            trendIcon: ArrowUpRight,
        },
        {
            title: 'Total Orders',
            value: sales?.total_orders?.toLocaleString() || '0',
            icon: ShoppingCart,
            description: '+8.2% from last month',
            trend: 'up',
            trendIcon: ArrowUpRight,
        },
        {
            title: 'Average Order Value',
            value: `$${sales?.average_order_value?.toLocaleString() || '0'}`,
            icon: TrendingUp,
            description: '+5.8% from last month',
            trend: 'up',
            trendIcon: ArrowUpRight,
        },
        {
            title: 'Unique Customers',
            value: sales?.unique_customers?.toLocaleString() || '0',
            icon: Users,
            description: '-2.3% from last month',
            trend: 'down',
            trendIcon: ArrowDownRight,
        },
    ];

    return (
        <div className="space-y-4 mb-4">
            <div className="mb-2 flex items-center justify-end">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing} className="h-8 w-8 p-0">
                                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                                <span className="sr-only">Refresh stats</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Refresh stats</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <Card key={stat.title} className="relative overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-muted-foreground text-sm font-medium">{stat.title}</CardTitle>
                            <div className="bg-muted/20 h-8 w-8 rounded-full p-1.5">
                                <stat.icon className="text-primary h-full w-full" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div className="text-2xl font-semibold tracking-tight">{stat.value}</div>
                                <div className={`flex items-center text-xs font-medium ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                                    <stat.trendIcon className="mr-1 h-3.5 w-3.5" />
                                    <span>{stat.description}</span>
                                </div>
                            </div>
                        </CardContent>
                        <div className={`absolute bottom-0 left-0 h-1 w-full ${stat.trend === 'up' ? 'bg-green-500' : 'bg-red-500'} opacity-20`} />
                    </Card>
                ))}
            </div>
        </div>
    );
}
