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
import { Layers, Edit, Trash2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface CategoryData {
  id?: number;
  name: string;
  slug: string;
  description?: string;
  parent_id?: number;
}

export function CategoriesList() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryData | null>(null);

  const form = useForm<CategoryData>({
    name: '',
    slug: '',
    description: '',
    parent_id: undefined,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isEditing = !!editingCategory;

    form.post(isEditing ? route('admin.categories.update', editingCategory.id) : route('admin.categories.store'), {
      onSuccess: () => {
        setIsModalOpen(false);
        form.reset();
        setEditingCategory(null);
        toast.success(isEditing ? 'Category updated successfully' : 'Category created successfully');
      },
      onError: () => {
        toast.error('Something went wrong');
      },
    });
  };

  const handleEdit = (category: CategoryData) => {
    setEditingCategory(category);
    form.setData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      parent_id: category.parent_id,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (categoryId: number) => {
    if (confirm('Are you sure you want to delete this category?')) {
      router.delete(route('admin.categories.destroy', categoryId), {
        onSuccess: () => {
          toast.success('Category deleted successfully');
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
        <h3 className="text-lg font-medium">Categories</h3>
        <CrudModal
          trigger={
            <Button onClick={() => setIsModalOpen(true)}>
              <Layers className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          }
          title={editingCategory ? 'Edit Category' : 'Add New Category'}
          description={editingCategory ? 'Edit category details' : 'Add a new category to the system'}
          isOpen={isModalOpen}
          onOpenChange={(open) => {
            setIsModalOpen(open);
            if (!open) {
              setEditingCategory(null);
              form.reset();
            }
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Category Name</Label>
                <Input
                  id="name"
                  value={form.data.name}
                  onChange={e => {
                    form.setData('name', e.target.value);
                    // Auto-generate slug from name
                    form.setData('slug', e.target.value.toLowerCase().replace(/\s+/g, '-'));
                  }}
                  placeholder="Enter category name"
                />
                {form.errors.name && (
                  <p className="text-sm text-red-500">{form.errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={form.data.slug}
                  onChange={e => form.setData('slug', e.target.value)}
                  placeholder="Enter category slug"
                />
                {form.errors.slug && (
                  <p className="text-sm text-red-500">{form.errors.slug}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={form.data.description}
                  onChange={e => form.setData('description', e.target.value)}
                  placeholder="Enter category description"
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
                {editingCategory ? 'Update' : 'Create'}
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
              <TableHead>Slug</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Example row - will be replaced with mapped data */}
            <TableRow>
              <TableCell>Electronics</TableCell>
              <TableCell>electronics</TableCell>
              <TableCell>Electronic products and accessories</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit({
                      id: 1,
                      name: 'Electronics',
                      slug: 'electronics',
                      description: 'Electronic products and accessories'
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