import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle } from "lucide-react";

const lowStockItems = [
  {
    name: "Timing Belt",
    sku: "TB-6060",
    currentStock: 5,
    minRequired: 15,
    status: "Critical",
  },
  {
    name: "Alternator",
    sku: "ALT-7070",
    currentStock: 8,
    minRequired: 20,
    status: "Low",
  },
  {
    name: "Radiator",
    sku: "RAD-8080",
    currentStock: 7,
    minRequired: 12,
    status: "Low",
  },
  {
    name: "Fuel Pump",
    sku: "FP-9090",
    currentStock: 3,
    minRequired: 10,
    status: "Critical",
  },
];

export function LowStockAlerts() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center space-x-2">
        <AlertCircle className="h-5 w-5 text-yellow-500" />
        <CardTitle className="text-xl font-semibold tracking-tight">Low Stock Alerts</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {lowStockItems.map((item) => (
            <div
              key={item.sku}
              className="flex items-center justify-between border-b pb-2 last:border-0"
            >
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-muted-foreground">SKU: {item.sku}</p>
              </div>
              <div className="text-right">
                <Badge
                  variant={item.status === "Critical" ? "destructive" : "warning"}
                >
                  {item.currentStock}/{item.minRequired}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
