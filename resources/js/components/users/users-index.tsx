import { UserDelete } from '@/components/users/user-delete';
import { UserEdit } from '@/components/users/user-edit';
import { UserFormDialog } from '@/components/users/user-form-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardTitle, CardContent, CardHeader } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { useDebounce } from '@/hooks/use-debounce';
import { User } from '@/types';
import { router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { Pencil, Plus, Trash } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Toaster } from 'sonner';
import { Badge } from '@/components/ui/badge';

interface UsersIndexProps {
    users: {
        data: User[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        links: Array<{
            url: string | null;
            label: string;
            active: boolean;
        }>;
    };
    filters?: {
        search?: string;
    };
}

export default function UsersIndex({ users, filters = {} }: UsersIndexProps) {
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const debouncedSearch = useDebounce(searchTerm, 300);
    const [formDialogOpen, setFormDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

    const handleSearch = useCallback((value: string) => {
        setSearchTerm(value);
    }, []);

    const handleEdit = (user: User) => {
        setSelectedUserId(user.id);
        setEditDialogOpen(true);
    };

    const handleDelete = (user: User) => {
        setSelectedUserId(user.id);
        setDeleteDialogOpen(true);
    };

    useEffect(() => {
        if (debouncedSearch === filters?.search) return;

        const params = new URLSearchParams(window.location.search);

        if (debouncedSearch) {
            params.set('search', debouncedSearch);
        } else {
            params.delete('search');
        }
        params.delete('page');

        router.visit(`${window.location.pathname}?${params.toString()}`, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    }, [debouncedSearch, filters?.search]);

    // Format full name from first, middle, and last name
    const formatFullName = (user: User) => {
        const middleInitial = user.middle_name ? ` ${user.middle_name.charAt(0)}. ` : ' ';
        return `${user.first_name}${middleInitial}${user.last_name}`;
    };

    // Format role with capitalized first letter
    const formatRole = (role: string) => {
        return role.charAt(0).toUpperCase() + role.slice(1);
    };

    const columns: ColumnDef<User>[] = [
        {
            accessorKey: 'name',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
            cell: ({ row }) => formatFullName(row.original),
            enableSorting: true,
        },
        {
            accessorKey: 'email',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
            enableSorting: true,
        },
        {
            accessorKey: 'role',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Role" />,
            cell: ({ row }) => {
                const role = row.original.role;
                const formattedRole = formatRole(role);
                
                return (
                    <Badge 
                        variant={role === 'admin' ? 'default' : 'secondary'}
                        className="font-medium"
                    >
                        {formattedRole}
                    </Badge>
                );
            },
            enableSorting: true,
        },
        {
            id: 'actions',
            cell: ({ row }) => {
                const user = row.original;
                return (
                    <div className="space-x-2 text-right">
                        <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-primary hover:bg-primary/10 hover:text-primary" 
                            onClick={() => handleEdit(user)} 
                        >
                            <Pencil className="h-4 w-4 mr-1" />
                            Edit
                        </Button>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive" 
                            onClick={() => handleDelete(user)} 
                        >
                            <Trash className="h-4 w-4 mr-1" />
                            Delete
                        </Button>
                    </div>
                );
            },
        },
    ];
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xl font-bold">Users</CardTitle>
                    <Button size="sm" onClick={() => setFormDialogOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add User
                    </Button>
                </CardHeader>
                <CardContent>
                    <DataTable
                        columns={columns}
                        data={users.data}
                        pagination={users}
                        searchKey="name"
                        searchValue={searchTerm}
                        onSearchChange={handleSearch}
                    />
                </CardContent>
            </Card>

            <UserFormDialog open={formDialogOpen} onOpenChange={setFormDialogOpen} />

            <UserEdit open={editDialogOpen} onOpenChange={setEditDialogOpen} users={users.data} selectedUserId={selectedUserId} />

            <UserDelete open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} users={users.data} selectedUserId={selectedUserId} />

            <Toaster />
        </div>
    );
}
