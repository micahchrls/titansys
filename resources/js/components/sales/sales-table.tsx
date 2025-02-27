import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { TableActions } from './table-actions'; // Import the new TableActions component

interface SaleStatus {
    value: 'completed' | 'pending' | 'cancelled';
    label: string;
}

interface Sale {
    id: string;
    date: Date;
    customer: string;
    items: number;
    total: string;
    status: SaleStatus;
}

const sales: Sale[] = [
    {
        id: 'ORD-2024-001',
        date: new Date('2024-02-27T08:30:00'),
        customer: 'John Smith',
        items: 3,
        total: '$245.99',
        status: { value: 'completed', label: 'Completed' },
    },
    {
        id: 'ORD-2024-002',
        date: new Date('2024-02-27T09:15:00'),
        customer: 'Sarah Johnson',
        items: 2,
        total: '$189.50',
        status: { value: 'pending', label: 'Pending' },
    },
    {
        id: 'ORD-2024-003',
        date: new Date('2024-02-27T10:00:00'),
        customer: 'Mike Brown',
        items: 5,
        total: '$567.25',
        status: { value: 'completed', label: 'Completed' },
    },
    {
        id: 'ORD-2024-004',
        date: new Date('2024-02-27T10:45:00'),
        customer: 'Emily Davis',
        items: 1,
        total: '$89.99',
        status: { value: 'cancelled', label: 'Cancelled' },
    },
    {
        id: 'ORD-2024-005',
        date: new Date('2024-02-27T11:30:00'),
        customer: 'David Wilson',
        items: 4,
        total: '$432.75',
        status: { value: 'completed', label: 'Completed' },
    },
];

const getStatusColor = (status: string) => {
    switch (status) {
        case 'completed':
            return 'bg-green-100 text-green-800';
        case 'pending':
            return 'bg-yellow-100 text-yellow-800';
        case 'cancelled':
            return 'bg-red-100 text-red-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

export function SalesTable() {
    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold">Recent Sales</CardTitle>
                    <TableActions
                        searchPlaceholder="Search sales..."
                        onSearch={(value) => console.log('Search:', value)}
                        onFilter={() => console.log('Filter clicked')}
                        onDownload={() => console.log('Export clicked')}
                        onAdd={() => console.log('Add clicked')}
                        addButtonText="New Sale"
                    />
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow className="text-xs">
                            <TableHead className="font-medium">Order ID</TableHead>
                            <TableHead className="font-medium">Date</TableHead>
                            <TableHead className="font-medium">Customer</TableHead>
                            <TableHead className="font-medium">Items</TableHead>
                            <TableHead className="font-medium">Total</TableHead>
                            <TableHead className="font-medium">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sales.map((sale) => (
                            <TableRow key={sale.id} className="text-sm">
                                <TableCell className="font-medium">{sale.id}</TableCell>
                                <TableCell className="text-muted-foreground">{format(sale.date, 'MMM d, yyyy h:mm a')}</TableCell>
                                <TableCell>{sale.customer}</TableCell>
                                <TableCell>{sale.items}</TableCell>
                                <TableCell className="font-medium">{sale.total}</TableCell>
                                <TableCell>
                                    <Badge variant="secondary" className={`${getStatusColor(sale.status.value)}`}>
                                        {sale.status.label}
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
