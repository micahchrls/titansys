import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const topProducts = [
  {
    name: "Brake Pads",
    sku: "BP-2024",
    sold: 145,
    revenue: "$7,250",
  },
  {
    name: "Oil Filter",
    sku: "OF-1010",
    sold: 132,
    revenue: "$2,640",
  },
  {
    name: "Air Filter",
    sku: "AF-3030",
    sold: 128,
    revenue: "$3,200",
  },
  {
    name: "Spark Plugs",
    sku: "SP-4040",
    sold: 120,
    revenue: "$1,800",
  },
  {
    name: "Battery",
    sku: "BAT-5050",
    sold: 98,
    revenue: "$9,800",
  },
];

export function TopProducts() {
  return (
    <Card className="col-span-2">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-semibold tracking-tight">Top Selling Products</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-medium">Product</TableHead>
              <TableHead className="font-medium">SKU</TableHead>
              <TableHead className="font-medium">Units Sold</TableHead>
              <TableHead className="text-right font-medium">Revenue</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topProducts.map((product) => (
              <TableRow key={product.sku} className="text-[15px]">
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell className="text-muted-foreground">{product.sku}</TableCell>
                <TableCell>{product.sold}</TableCell>
                <TableCell className="text-right font-medium">{product.revenue}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
