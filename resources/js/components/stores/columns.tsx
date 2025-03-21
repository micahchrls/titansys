import { Button } from '@/components/ui/button';
import { Store } from '@/types';
import { ColumnDef } from '@tanstack/react-table';
import { formatDistanceToNow } from 'date-fns';
import { Pencil, Trash } from 'lucide-react';

export const getColumns = (onEdit: (store: Store) => void, onDelete: (store: Store) => void): ColumnDef<Store>[] => {
    return [
        {
            accessorKey: 'name',
            header: 'Name',
            cell: ({ row }) => <div className="font-medium">{row.getValue('name')}</div>,
        },
        {
            accessorKey: 'location_address',
            header: 'Address',
            cell: ({ row }) => <div className="max-w-[300px] truncate">{row.getValue('location_address') || '-'}</div>,
        },
        {
            accessorKey: 'contact_number',
            header: 'Contact Number',
            cell: ({ row }) => <div>{row.getValue('contact_number') || '-'}</div>,
        },
        {
            accessorKey: 'email',
            header: 'Email',
            cell: ({ row }) => <div>{row.getValue('email') || '-'}</div>,
        },
        {
            accessorKey: 'created_at',
            header: 'Created',
            cell: ({ row }) => {
                const date = row.getValue('created_at') as string;
                return <div>{formatDistanceToNow(new Date(date), { addSuffix: true })}</div>;
            },
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => {
                const store = row.original;
                return (
                    <div className="space-x-2 text-right">
                        <Button
                            variant="outline"
                            size="sm"
                            className="text-primary hover:bg-primary/10 hover:text-primary"
                            onClick={() => onEdit(store)}
                        >
                            <Pencil className="mr-1 h-4 w-4" />
                            Edit
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => onDelete(store)}
                        >
                            <Trash className="mr-1 h-4 w-4" />
                            Delete
                        </Button>
                    </div>
                );
            },
        },
    ];
};
