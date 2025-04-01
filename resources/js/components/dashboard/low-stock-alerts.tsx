import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, RefreshCw } from "lucide-react";
import { usePage } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";

interface LowStockItem {
  name: string;
  sku: string;
  currentStock: number;
  minRequired: number;
  status: string;
}

interface LowStockData {
  title: string;
  value: string;
  items: LowStockItem[];
  description: string;
  trend: string;
}

interface PageProps {
  lowStockItems: LowStockData;
  [key: string]: any;
}

export function LowStockAlerts() {
  const { lowStockItems } = usePage<PageProps>().props;
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [stockData, setStockData] = useState<LowStockData>(lowStockItems);

  const refreshData = async (): Promise<void> => {
    setIsRefreshing(true);
    try {
      const response = await axios.get<LowStockData>(route('dashboard.low-stock-items'));
      setStockData(response.data);
      toast.success('Low stock data refreshed');
    } catch (error) {
      toast.error('Failed to refresh low stock data');
      console.error('Error refreshing low stock data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div className="flex items-center space-x-2">
          <AlertCircle className="h-5 w-5 text-yellow-500" />
          <div>
            <CardTitle className="text-xl font-semibold tracking-tight mb-1">Low Stock Alerts</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              {stockData.description}
            </CardDescription>
          </div>
        </div>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={refreshData} 
          disabled={isRefreshing}
          className="h-8 gap-1"
          aria-label="Refresh low stock data"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="sr-only sm:not-sr-only sm:inline-block">
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </span>
        </Button>
      </CardHeader>
      <CardContent className="flex-1">
        {isRefreshing ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="flex items-center justify-between pb-3 border-b last:border-0">
                <div className="space-y-1">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-6 w-12" />
              </div>
            ))}
          </div>
        ) : stockData.items.length > 0 ? (
          <div className="space-y-4">
            {stockData.items.map((item) => (
              <div
                key={item.sku}
                className="flex items-center justify-between border-b pb-3 last:border-0"
              >
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-muted-foreground">SKU: {item.sku}</p>
                </div>
                <div className="text-right">
                  <Badge
                    variant={item.status === "Critical" ? "destructive" : "warning"}
                    className="px-2 py-1"
                  >
                    {item.currentStock}/{item.minRequired}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">No low stock items found</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
