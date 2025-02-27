import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, ShoppingCart, TrendingUp, Users, ArrowUpRight, ArrowDownRight } from "lucide-react";

export function SalesOverview() {
  const stats = [
    {
      title: "Total Revenue",
      value: "$85,432.89",
      icon: DollarSign,
      description: "+15.3% from last month",
      trend: "up",
      trendIcon: ArrowUpRight
    },
    {
      title: "Total Orders",
      value: "432",
      icon: ShoppingCart,
      description: "+8.2% from last month",
      trend: "up",
      trendIcon: ArrowUpRight
    },
    {
      title: "Average Order Value",
      value: "$197.76",
      icon: TrendingUp,
      description: "+5.8% from last month",
      trend: "up",
      trendIcon: ArrowUpRight
    },
    {
      title: "Unique Customers",
      value: "245",
      icon: Users,
      description: "-2.3% from last month",
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
              <div className="text-2xl font-semibold tracking-tight">{stat.value}</div>
              <div className={`flex items-center text-xs font-medium ${
                stat.trend === "up" ? "text-green-600" : "text-red-600"
              }`}>
                <stat.trendIcon className="mr-1 h-3.5 w-3.5" />
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
