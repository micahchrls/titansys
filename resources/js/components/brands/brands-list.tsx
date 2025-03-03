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
import { Tag, Edit, Trash2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface BrandData {
  id?: number;
  name: string;
  slug: string;
  description?: string;
  website?: string;
  logo_url?: string;
}

export function BrandsList() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<BrandData | null>(null);

  const form = useForm<BrandData>({
    name: '',
    slug: '',
    description: '',
    website: '',
    logo_url: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isEditing = !!editingBrand;

    form.post(isEditing ? route('admin.brands.update', editingBrand.id) : route('admin.brands.store'), {
      onSuccess: () => {
        setIsModalOpen(false);
        form.reset();
        setEditingBrand(null);
        toast.success(isEditing ? 'Brand updated successfully' : 'Brand created successfully');
      },
      onError: () => {
        toast.error('Something went wrong');
      },
    });
  };

  const handleEdit = (brand: BrandData) => {
    setEditingBrand(brand);
    form.setData({
      name: brand.name,
      slug: brand.slug,
      description: brand.description || '',
      website: brand.website || '',
      logo_url: brand.logo_url || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = (brandId: number) => {
    if (confirm('Are you sure you want to delete this brand?')) {
      router.delete(route('admin.brands.destroy', brandId), {
        onSuccess: () => {
          toast.success('Brand deleted successfully');
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
        <h3 className="text-lg font-medium">Brands</h3>
        <CrudModal
          trigger={
            <Button onClick={() => setIsModalOpen(true)}>
              <Tag className="mr-2 h-4 w-4" />
              Add Brand
            </Button>
          }
          title={editingBrand ? 'Edit Brand' : 'Add New Brand'}
          description={editingBrand ? 'Edit brand details' : 'Add a new brand to the system'}
          isOpen={isModalOpen}
          onOpenChange={(open) => {
            setIsModalOpen(open);
            if (!open) {
              setEditingBrand(null);
              form.reset();
            }
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Brand Name</Label>
                <Input
                  id="name"
                  value={form.data.name}
                  onChange={e => {
                    form.setData('name', e.target.value);
                    // Auto-generate slug from name
                    form.setData('slug', e.target.value.toLowerCase().replace(/\s+/g, '-'));
                  }}
                  placeholder="Enter brand name"
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
                  placeholder="Enter brand slug"
                />
                {form.errors.slug && (
                  <p className="text-sm text-red-500">{form.errors.slug}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  value={form.data.website}
                  onChange={e => form.setData('website', e.target.value)}
                  placeholder="Enter brand website URL"
                />
                {form.errors.website && (
                  <p className="text-sm text-red-500">{form.errors.website}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="logo_url">Logo URL</Label>
                <Input
                  id="logo_url"
                  type="url"
                  value={form.data.logo_url}
                  onChange={e => form.setData('logo_url', e.target.value)}
                  placeholder="Enter logo URL"
                />
                {form.errors.logo_url && (
                  <p className="text-sm text-red-500">{form.errors.logo_url}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={form.data.description}
                  onChange={e => form.setData('description', e.target.value)}
                  placeholder="Enter brand description"
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
                {editingBrand ? 'Update' : 'Create'}
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
              <TableHead>Website</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Example row - will be replaced with mapped data */}
            <TableRow>
              <TableCell>Example Brand</TableCell>
              <TableCell>example.com</TableCell>
              <TableCell>Example brand description</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit({
                      id: 1,
                      name: 'Example Brand',
                      slug: 'example-brand',
                      website: 'https://example.com',
                      description: 'Example brand description'
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