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
import { useForm } from '@inertiajs/react';
import { Store, Edit, Trash2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface StoreData {
  id?: number;
  name: string;
  address: string;
  contact: string;
  description?: string;
}

export function StoresList() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<StoreData | null>(null);

  const form = useForm<StoreData>({
    name: '',
    address: '',
    contact: '',
    description: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isEditing = !!editingStore;

    form.post(isEditing ? route('admin.stores.update', editingStore.id) : route('admin.stores.store'), {
      onSuccess: () => {
        setIsModalOpen(false);
        form.reset();
        setEditingStore(null);
        toast.success(isEditing ? 'Store updated successfully' : 'Store created successfully');
      },
      onError: () => {
        toast.error('Something went wrong');
      },
    });
  };

  const handleEdit = (store: StoreData) => {
    setEditingStore(store);
    form.setData({
      name: store.name,
      address: store.address,
      contact: store.contact,
      description: store.description || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = (storeId: number) => {
    if (confirm('Are you sure you want to delete this store?')) {
      router.delete(route('admin.stores.destroy', storeId), {
        onSuccess: () => {
          toast.success('Store deleted successfully');
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
        <h3 className="text-lg font-medium">Stores</h3>
        <CrudModal
          trigger={
            <Button onClick={() => setIsModalOpen(true)}>
              <Store className="mr-2 h-4 w-4" />
              Add Store
            </Button>
          }
          title={editingStore ? 'Edit Store' : 'Add New Store'}
          description={editingStore ? 'Edit store details' : 'Add a new store to the system'}
          isOpen={isModalOpen}
          onOpenChange={(open) => {
            setIsModalOpen(open);
            if (!open) {
              setEditingStore(null);
              form.reset();
            }
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Store Name</Label>
                <Input
                  id="name"
                  value={form.data.name}
                  onChange={e => form.setData('name', e.target.value)}
                  placeholder="Enter store name"
                />
                {form.errors.name && (
                  <p className="text-sm text-red-500">{form.errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={form.data.address}
                  onChange={e => form.setData('address', e.target.value)}
                  placeholder="Enter store address"
                />
                {form.errors.address && (
                  <p className="text-sm text-red-500">{form.errors.address}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact">Contact</Label>
                <Input
                  id="contact"
                  value={form.data.contact}
                  onChange={e => form.setData('contact', e.target.value)}
                  placeholder="Enter contact information"
                />
                {form.errors.contact && (
                  <p className="text-sm text-red-500">{form.errors.contact}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={form.data.description}
                  onChange={e => form.setData('description', e.target.value)}
                  placeholder="Enter store description"
                  rows={3}
                />
                {form.errors.description && (
                  <p className="text-sm text-red-500">{form.errors.description}</p>
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
                {editingStore ? 'Update' : 'Create'}
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
              <TableHead>Address</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Example row - will be replaced with mapped data */}
            <TableRow>
              <TableCell>Main Store</TableCell>
              <TableCell>123 Main St</TableCell>
              <TableCell>+1 234 567 890</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit({
                      id: 1,
                      name: 'Main Store',
                      address: '123 Main St',
                      contact: '+1 234 567 890',
                      description: 'Main retail location'
                    })}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(1)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
