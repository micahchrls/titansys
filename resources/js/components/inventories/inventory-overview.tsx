import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Box, Package, TrendingUp, AlertTriangle, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: any;
  trend?: "up" | "down" | "none";
  trendIcon?: any;
  iconColor?: string;
}

export function InventoryOverview() {
  const stats: StatCardProps[] = [
    {
      title: "Categories",
      value: "14",
      description: "+2.5% from last week",
      icon: Box,
      trend: "up",
      trendIcon: ArrowUpRight
    },
    {
      title: "Total Products",
      value: "868",
      description: "+12.5% from last week",
      icon: Package,
      trend: "up",
      trendIcon: ArrowUpRight
    },
    {
      title: "Top Selling",
      value: "5",
      description: "+3 from last week",
      icon: TrendingUp,
      trend: "up",
      trendIcon: ArrowUpRight
    },
    {
      title: "Low Stock Items",
      value: "14",
      description: "-2 from last week",
      icon: AlertTriangle,
      trend: "down",
      trendIcon: ArrowDownRight
    }
  ];

  return (
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
              <div className="text-2xl font-semibold tracking-tight">{stat.value}</div>
              {stat.trend && (
                <div className={`flex items-center text-xs font-medium ${
                  stat.trend === "up" ? "text-green-600" : "text-red-600"
                }`}>
                  <stat.trendIcon className="mr-1 h-3.5 w-3.5" />
                  <span>{stat.description}</span>
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
  );
}
