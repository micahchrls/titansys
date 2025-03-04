import { Plus, Pencil, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import DataTable from '@/components/datatable';
import { SearchFilter } from "@/components/search-filter";

interface Brand {
    id: number;
    name: string;
    description: string;
}

const brands: Brand[] = [
    { id: 1, name: 'Bosch', description: 'German multinational engineering and technology company' },
    { id: 2, name: 'NGK', description: 'Japanese manufacturer of spark plugs and automotive components' },
    { id: 3, name: 'Denso', description: 'Japanese automotive parts manufacturer' },
    { id: 4, name: 'Continental', description: 'German automotive parts manufacturing company' },
    { id: 5, name: 'Valeo', description: 'French automotive supplier' },
];

const columns = [
    { accessorKey: 'name', header: 'Brand Name' },
    { accessorKey: 'description', header: 'Description' },
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


export default function BrandsList() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-end space-y-0 pb-2">
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Brand
        </Button>
      </CardHeader>
      <CardContent>
        <SearchFilter
          onSearch={(value) => console.log('Search:', value)}
          onFilter={() => console.log('Filter clicked')}
        />
        <DataTable data={brands} columns={columns} />
      </CardContent>
    </Card>
  )
}
