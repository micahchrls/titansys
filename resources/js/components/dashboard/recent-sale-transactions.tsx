import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ReceiptIcon, RefreshCw } from "lucide-react";
import { usePage } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";

interface SaleTransaction {
  id: string;
  customer: string;
  items: number;
  total: string;
  status: string;
  date: string;
}

interface PageProps {
  recentSaleTransactions: SaleTransaction[];
  [key: string]: any;
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "completed":
      return "success";
    case "processing":
      return "warning";
    case "pending":
      return "secondary";
    case "cancelled":
      return "destructive";
    default:
      return "default";
  }
};

export function RecentSaleTransactions() {
  const { recentSaleTransactions } = usePage<PageProps>().props;
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [transactions, setTransactions] = useState<SaleTransaction[]>(recentSaleTransactions);

  const refreshData = async (): Promise<void> => {
    setIsRefreshing(true);
    try {
      const response = await axios.get<SaleTransaction[]>(route('dashboard.recent-sale-transactions'));
      setTransactions(response.data);
      toast.success('Sale transactions refreshed');
    } catch (error) {
      toast.error('Failed to refresh sale transactions');
      console.error('Error refreshing sale transactions:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div className="flex items-center space-x-2">
          <ReceiptIcon className="h-5 w-5 text-blue-500" />
          <div>
            <CardTitle className="text-xl font-semibold tracking-tight mb-1">Recent Sale Transactions</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Latest {transactions.length} sales transactions
            </CardDescription>
          </div>
        </div>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={refreshData} 
          disabled={isRefreshing}
          className="h-8 gap-1"
          aria-label="Refresh sale transactions"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="sr-only sm:not-sr-only sm:inline-block">
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </span>
        </Button>
      </CardHeader>
      <CardContent className="flex-1">
        {isRefreshing ? (
          <div className="space-y-2">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-medium w-[110px]">Order ID</TableHead>
                    <TableHead className="font-medium">Customer</TableHead>
                    <TableHead className="font-medium text-center w-[70px]">Items</TableHead>
                    <TableHead className="font-medium text-right w-[100px]">Total</TableHead>
                    <TableHead className="font-medium w-[120px]">Status</TableHead>
                    <TableHead className="font-medium w-[100px]">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[1, 2, 3, 4, 5].map((item) => (
                    <TableRow key={item}>
                      <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                      <TableCell className="text-center"><Skeleton className="h-5 w-8 mx-auto" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        ) : transactions.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-medium w-[110px]">Order ID</TableHead>
                  <TableHead className="font-medium">Customer</TableHead>
                  <TableHead className="font-medium text-center w-[70px]">Items</TableHead>
                  <TableHead className="font-medium text-right w-[100px]">Total</TableHead>
                  <TableHead className="font-medium w-[120px]">Status</TableHead>
                  <TableHead className="font-medium w-[100px]">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium">{transaction.id}</TableCell>
                    <TableCell>{transaction.customer}</TableCell>
                    <TableCell className="text-center">{transaction.items}</TableCell>
                    <TableCell className="text-right">{transaction.total}</TableCell>
                    <TableCell>
                      <Badge
                        variant={getStatusColor(transaction.status)}
                        className="px-2 py-1"
                      >
                        {transaction.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{transaction.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="py-8 text-center border rounded-md">
            <p className="text-muted-foreground">No recent sale transactions found</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
