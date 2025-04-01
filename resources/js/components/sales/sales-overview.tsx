import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowDownRight, ArrowUpRight, DollarSign, ShoppingCart, TrendingUp, LineChart } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { RefreshCw } from 'lucide-react';
import { usePage, router } from "@inertiajs/react";
import { useState } from "react";

interface SalesStat {
  value: number;
  change_percentage: number;
  trend: 'up' | 'down' | 'none';
}

interface SalesTrendData {
  value: number;
  change_percentage: number;
  trend: 'up' | 'down' | 'none';
}

interface PageProps {
  stats: {
    total_revenue: SalesStat;
    total_orders: SalesStat;
    average_order_value: SalesStat;
    sales_trend: SalesTrendData;
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
  const { stats } = usePage().props as unknown as PageProps;
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const handleRefresh = () => {
    setIsRefreshing(true);
    router.reload({ 
      only: ['stats'],
      onSuccess: () => {
        setIsRefreshing(false);
      },
      onError: () => {
        setIsRefreshing(false);
      }
    });
  };
  
  const statCards: StatCardProps[] = [
    {
      title: 'Total Revenue',
      value: `₱${stats.total_revenue?.value?.toLocaleString() || '0'}`,
      icon: DollarSign,
      description: `${stats.total_revenue?.change_percentage > 0 ? '+' : ''}${stats.total_revenue?.change_percentage || 0}% from last month`,
      trend: stats.total_revenue?.trend || 'none',
      trendIcon: stats.total_revenue?.trend === 'up' ? ArrowUpRight : ArrowDownRight,
    },
    {
      title: 'Total Orders',
      value: stats.total_orders?.value?.toLocaleString() || '0',
      icon: ShoppingCart,
      description: `${stats.total_orders?.change_percentage > 0 ? '+' : ''}${stats.total_orders?.change_percentage || 0}% from last month`,
      trend: stats.total_orders?.trend || 'none',
      trendIcon: stats.total_orders?.trend === 'up' ? ArrowUpRight : ArrowDownRight,
    },
    {
      title: 'Average Order Value',
      value: `₱${stats.average_order_value?.value?.toLocaleString() || '0'}`,
      icon: TrendingUp,
      description: `${stats.average_order_value?.change_percentage > 0 ? '+' : ''}${stats.average_order_value?.change_percentage || 0}% from last month`,
      trend: stats.average_order_value?.trend || 'none',
      trendIcon: stats.average_order_value?.trend === 'up' ? ArrowUpRight : ArrowDownRight,
    },
    {
      title: 'This Month Sales',
      value: `₱${stats.sales_trend?.value?.toLocaleString() || '0'}`,
      icon: LineChart,
      description: `${stats.sales_trend?.change_percentage > 0 ? '+' : ''}${stats.sales_trend?.change_percentage || 0}% from last month`,
      trend: stats.sales_trend?.trend || 'none',
      trendIcon: stats.sales_trend?.trend === 'up' ? ArrowUpRight : ArrowDownRight,
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
        {statCards.map((stat) => (
          <Card key={stat.title} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-muted-foreground text-sm font-medium">{stat.title}</CardTitle>
              <div className="bg-muted/20 h-8 w-8 rounded-full p-1.5">
                <stat.icon className="text-primary h-full w-full" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-semibold tracking-tight">
                  {isRefreshing ? (
                    <div className="h-8 w-16 bg-muted/30 animate-pulse rounded"></div>
                  ) : (
                    stat.value
                  )}
                </div>
                {stat.trend && stat.trend !== "none" && (
                  <div className={`flex items-center text-xs font-medium ${
                    stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {isRefreshing ? (
                      <div className="h-4 w-24 bg-muted/30 animate-pulse rounded"></div>
                    ) : (
                      <>
                        <stat.trendIcon className="mr-1 h-3.5 w-3.5" />
                        <span>{stat.description}</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
            <div className={`absolute bottom-0 left-0 h-1 w-full ${
              stat.trend === 'up' ? 'bg-green-500' : 'bg-red-500'
            } opacity-20`} />
          </Card>
        ))}
      </div>
    </div>
  );
}

export default SalesOverview;
