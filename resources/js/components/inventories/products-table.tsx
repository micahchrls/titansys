import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TableActions } from './table-actions';

interface Product {
    name: string;
    buyingPrice: number;
    quantity: string;
    threshold: string;
    expiryDate: string;
    availability: 'In- stock' | 'Out of stock' | 'Low stock';
}

const products: Product[] = [
    {
        name: 'Maggi',
        buyingPrice: 430,
        quantity: '43 Packets',
        threshold: '12 Packets',
        expiryDate: '11/12/22',
        availability: 'In- stock',
    },
    {
        name: 'Bru',
        buyingPrice: 257,
        quantity: '22 Packets',
        threshold: '12 Packets',
        expiryDate: '21/12/22',
        availability: 'Out of stock',
    },
    {
        name: 'Red Bull',
        buyingPrice: 405,
        quantity: '36 Packets',
        threshold: '9 Packets',
        expiryDate: '5/12/22',
        availability: 'In- stock',
    },
    {
        name: 'Bourn Vita',
        buyingPrice: 502,
        quantity: '14 Packets',
        threshold: '6 Packets',
        expiryDate: '8/12/22',
        availability: 'Out of stock',
    },
    {
        name: 'Horlicks',
        buyingPrice: 530,
        quantity: '5 Packets',
        threshold: '5 Packets',
        expiryDate: '9/1/23',
        availability: 'In- stock',
    },
];

const getAvailabilityColor = (availability: Product['availability']) => {
    switch (availability) {
        case 'In- stock':
            return 'bg-green-100 text-green-800';
        case 'Out of stock':
            return 'bg-red-100 text-red-800';
        case 'Low stock':
            return 'bg-orange-100 text-orange-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

export function ProductsTable() {
    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold">Products</CardTitle>
                    <TableActions
                        searchPlaceholder="Search products..."
                        onSearch={(value) => console.log('Search:', value)}
                        onFilter={() => console.log('Filter clicked')}
                        onDownload={() => console.log('Download clicked')}
                        onAdd={() => console.log('Add clicked')}
                    />
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Products</TableHead>
                            <TableHead>Buying Price</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Threshold Value</TableHead>
                            <TableHead>Expiry Date</TableHead>
                            <TableHead>Availability</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products.map((product) => (
                            <TableRow key={product.name} className="hover:bg-muted/50 cursor-pointer">
                                <TableCell className="font-medium">{product.name}</TableCell>
                                <TableCell>₹{product.buyingPrice}</TableCell>
                                <TableCell>{product.quantity}</TableCell>
                                <TableCell>{product.threshold}</TableCell>
                                <TableCell>{product.expiryDate}</TableCell>
                                <TableCell>
                                    <Badge variant="secondary" className={getAvailabilityColor(product.availability)}>
                                        {product.availability}
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
