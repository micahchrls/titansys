import { Plus, Pencil, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

import DataTable from '@/components/datatable';
import { SearchFilter } from "@/components/search-filter";

interface Supplier {
    id: string;
    name: string;
    contactPerson: string;
    email: string;
    phone: string;
    address: string;
}

const suppliers: Supplier[] = [
    {
        id: '1',
        name: 'Auto Parts Co.',
        contactPerson: 'John Doe',
        email: 'john@autoparts.com',
        phone: '044-653578',
        address: '123 Main St, Coimbatore, 631403'
    },
    {
        id: '2',
        name: 'Quality Spares Ltd.',
        contactPerson: 'Jane Smith',
        email: 'jane@qualityspares.com',
        phone: '044-653763',
        address: '456 Oak Rd, Coimbatore, 631352'
    },
    {
        id: '3',
        name: 'Reliable Motors Supplies',
        contactPerson: 'Mike Johnson',
        email: 'mike@reliablemotors.com',
        phone: '044-653590',
        address: '789 Pine Ave, Coimbatore, 631404'
    }
];

const columns = [
    { key: 'name', header: 'Name' },
    { key: 'contactPerson', header: 'Contact Person' },
    { key: 'email', header: 'Email' },
    { key: 'phone', header: 'Phone' },
    { key: 'address', header: 'Address' },
    {
        key: 'actions',
        header: 'Actions',
        render: () => (
            <div className="text-right">
                <Button variant="ghost" size="sm">
                    <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                    <Trash className="h-4 w-4" />
                </Button>
            </div>
        ),
    },
];

export function SuppliersList() {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-end space-y-0 pb-2">
                <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Supplier
                </Button>
            </CardHeader>
            <CardContent>
                <SearchFilter
                    onSearch={(value) => console.log('Search:', value)}
                    onFilter={() => console.log('Filter clicked')}
                />
                <DataTable data={suppliers} columns={columns} />
            </CardContent>
        </Card>
    );
}
