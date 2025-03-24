import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Box, Package, TrendingUp, AlertTriangle, ArrowUpRight, ArrowDownRight, RefreshCw } from "lucide-react";
import { usePage, router } from "@inertiajs/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: any;
  trend?: "up" | "down" | "none";
  trendIcon?: any;
  iconColor?: string;
}

interface PageProps {
  low_stock_alerts: {
    count: number;
    critical_count: number;
    warning_count: number;
    change: number;
    trend: "up" | "down";
  };
  inventory_value_summary: {
    categories: {
      count: number;
      change_percentage: number;
      trend: "up" | "down";
    };
    products: {
      count: number;
      change_percentage: number;
      trend: "up" | "down";
    };
    top_selling: {
      count: number;
      change: number;
      trend: "up" | "down";
    };
  };
}

export function InventoryOverview() {
  const { low_stock_alerts, inventory_value_summary } = usePage().props as unknown as PageProps;
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const handleRefresh = () => {
    setIsRefreshing(true);
    router.reload({ 
      only: ['low_stock_alerts', 'inventory_value_summary'],
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
      title: "Categories",
      value: inventory_value_summary?.categories?.count || 0,
      description: `${inventory_value_summary?.categories?.change_percentage > 0 ? '+' : ''}${inventory_value_summary?.categories?.change_percentage || 0}% from last week`,
      icon: Box,
      trend: inventory_value_summary?.categories?.trend || "none",
      trendIcon: inventory_value_summary?.categories?.trend === "up" ? ArrowUpRight : ArrowDownRight
    },
    {
      title: "Total Products",
      value: inventory_value_summary?.products?.count || 0,
      description: `${inventory_value_summary?.products?.change_percentage > 0 ? '+' : ''}${inventory_value_summary?.products?.change_percentage || 0}% from last week`,
      icon: Package,
      trend: inventory_value_summary?.products?.trend || "none",
      trendIcon: inventory_value_summary?.products?.trend === "up" ? ArrowUpRight : ArrowDownRight
    },
    {
      title: "Top Selling",
      value: inventory_value_summary?.top_selling?.count || 0,
      description: `${inventory_value_summary?.top_selling?.change > 0 ? '+' : ''}${inventory_value_summary?.top_selling?.change || 0} from last month`,
      icon: TrendingUp,
      trend: inventory_value_summary?.top_selling?.trend || "none",
      trendIcon: inventory_value_summary?.top_selling?.trend === "up" ? ArrowUpRight : ArrowDownRight
    },
    {
      title: "Low Stock Items",
      value: low_stock_alerts?.count || 0,
      description: `${low_stock_alerts?.change <= 0 ? '-' : '+'}${Math.abs(low_stock_alerts?.change || 0)} from last week`,
      icon: AlertTriangle,
      trend: low_stock_alerts?.trend || "none",
      trendIcon: low_stock_alerts?.trend === "up" ? ArrowUpRight : ArrowDownRight
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-end items-center mb-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh} 
                disabled={isRefreshing}
                className="h-8 w-8 p-0"
              >
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
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className="h-8 w-8 rounded-full bg-muted/20 p-1.5">
                <stat.icon className="h-full w-full text-primary" />
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
                    stat.trend === "up" ? "text-green-600" : "text-red-600"
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
              stat.trend === "up" ? "bg-green-500" : "bg-red-500"
            } opacity-20`} />
          </Card>
        ))}
      </div>
    </div>
  );
}

// Add default export for lazy loading
export default InventoryOverview;
