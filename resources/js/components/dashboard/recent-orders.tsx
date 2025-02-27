import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const orders = [
  {
    id: "ORD-2024-001",
    customer: "John Auto Shop",
    items: 5,
    total: "$1,245.00",
    status: "Completed",
    date: "2024-02-26",
  },
  {
    id: "ORD-2024-002",
    customer: "Mike's Garage",
    items: 3,
    total: "$567.50",
    status: "Processing",
    date: "2024-02-26",
  },
  {
    id: "ORD-2024-003",
    customer: "Quick Fix Auto",
    items: 8,
    total: "$2,890.00",
    status: "Pending",
    date: "2024-02-25",
  },
  {
    id: "ORD-2024-004",
    customer: "Elite Motors",
    items: 2,
    total: "$456.00",
    status: "Completed",
    date: "2024-02-25",
  },
  {
    id: "ORD-2024-005",
    customer: "Car Care Center",
    items: 4,
    total: "$890.00",
    status: "Processing",
    date: "2024-02-25",
  },
];

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "completed":
      return "success";
    case "processing":
      return "warning";
    case "pending":
      return "secondary";
    default:
      return "default";
  }
};

export function RecentOrders() {
  return (
    <Card className="col-span-4">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-medium">Recent Orders</CardTitle>
      </CardHeader>
      <CardContent className="px-2">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-medium">Order ID</TableHead>
              <TableHead className="font-medium">Customer</TableHead>
              <TableHead className="font-medium">Items</TableHead>
              <TableHead className="font-medium">Total</TableHead>
              <TableHead className="font-medium">Status</TableHead>
              <TableHead className="font-medium">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.id}</TableCell>
                <TableCell>{order.customer}</TableCell>
                <TableCell>{order.items}</TableCell>
                <TableCell>{order.total}</TableCell>
                <TableCell>
                  <Badge variant={getStatusColor(order.status)}>
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell>{order.date}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
