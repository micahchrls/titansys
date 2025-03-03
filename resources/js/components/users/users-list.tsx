import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow 
} from '@/components/ui/table';
import { CrudModal } from '@/components/ui/crud-modal';
import { useForm, router, usePage } from '@inertiajs/react';
import { User, Edit, Trash2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface UserData {
  [key: string]: string | number | undefined;
  id?: number;
  name: string;
  email: string;
  role: string;
  password?: string;
}

interface PageProps {
  [key: string]: unknown;
  users: {
    data: UserData[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export function UsersList() {
  const { users } = usePage<PageProps>().props;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);

  const form = useForm<Record<string, string>>({
    name: '',
    email: '',
    role: 'user',
    password: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isEditing = !!editingUser;

    if (isEditing) {
      router.put(route('admin.users.update', editingUser.id), form.data as Record<string, string>, {
        onSuccess: () => {
          setIsModalOpen(false);
          form.reset();
          setEditingUser(null);
          toast.success('User updated successfully');
        },
        onError: () => {
          toast.error('Something went wrong');
        },
      });
    } else {
      router.post(route('admin.users.store'), form.data as Record<string, string>, {
        onSuccess: () => {
          setIsModalOpen(false);
          form.reset();
          toast.success('User created successfully');
        },
        onError: () => {
          toast.error('Something went wrong');
        },
      });
    }
  };

  const handleEdit = (user: UserData) => {
    setEditingUser(user);
    form.setData({
      name: user.name,
      email: user.email,
      role: user.role,
      password: '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = (userId: number) => {
    if (confirm('Are you sure you want to delete this user?')) {
      router.delete(route('admin.users.destroy', userId), {
        onSuccess: () => {
          toast.success('User deleted successfully');
        },
        onError: () => {
          toast.error('Something went wrong');
        },
      });
    }
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-medium">Users ({users.total})</h3>
        <CrudModal
          trigger={
            <Button onClick={() => setIsModalOpen(true)}>
              <User className="mr-2 h-4 w-4" />
              Add User
            </Button>
          }
          title={editingUser ? 'Edit User' : 'Add New User'}
          description={editingUser ? 'Edit user details' : 'Add a new user to the system'}
          isOpen={isModalOpen}
          onOpenChange={(open) => {
            setIsModalOpen(open);
            if (!open) {
              setEditingUser(null);
              form.reset();
            }
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={form.data.name}
                  onChange={e => form.setData('name', e.target.value)}
                  placeholder="Enter name"
                />
                {form.errors.name && (
                  <p className="text-sm text-red-500">{form.errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.data.email}
                  onChange={e => form.setData('email', e.target.value)}
                  placeholder="Enter email"
                />
                {form.errors.email && (
                  <p className="text-sm text-red-500">{form.errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={form.data.password}
                  onChange={e => form.setData('password', e.target.value)}
                  placeholder={editingUser ? 'Leave blank to keep current password' : 'Enter password'}
                />
                {form.errors.password && (
                  <p className="text-sm text-red-500">{form.errors.password}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <select
                  id="role"
                  value={form.data.role}
                  onChange={e => form.setData('role', e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
                {form.errors.role && (
                  <p className="text-sm text-red-500">{form.errors.role}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={form.processing}>
                {editingUser ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </CrudModal>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.data.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell className="capitalize">{user.role}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(user)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(user.id!)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}