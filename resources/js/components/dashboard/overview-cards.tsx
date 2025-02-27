import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Package, ShoppingCart, AlertTriangle, TrendingUp, Users, ArrowUpRight, ArrowDownRight } from "lucide-react";

export function OverviewCards() {
  const stats = [
    {
      title: "Total Revenue",
      value: "$45,231.89",
      icon: DollarSign,
      description: "+20.1% from last month",
      trend: "up",
      trendIcon: ArrowUpRight
    },
    {
      title: "Total Sales",
      value: "258",
      icon: ShoppingCart,
      description: "+12.5% from last month",
      trend: "up",
      trendIcon: ArrowUpRight
    },
    {
      title: "Active Customers",
      value: "1,234",
      icon: Users,
      description: "+5.2% from last month",
      trend: "up",
      trendIcon: ArrowUpRight
    },
    {
      title: "Low Stock Items",
      value: "15",
      icon: AlertTriangle,
      description: "-2 items from last week",
      trend: "down",
      trendIcon: ArrowDownRight
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className={`flex items-center text-sm ${
                stat.trend === "up" ? "text-green-600" : "text-red-600"
              }`}>
                <stat.trendIcon className="mr-1 h-4 w-4" />
                <span>{stat.description}</span>
              </div>
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
