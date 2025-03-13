import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { FileUpload } from '@/components/ui/file-upload';
import { Label } from '@/components/ui/label';
import { Loader2, Trash } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { Store } from '@/types';

const formScheme = z.object({
    name: z.string().min(1, 'Name is required'),
    location_address: z.string().min(1, 'Address is required'),
    contact_number: z.string().optional(),
    email: z.string().email('Invalid email format').optional().or(z.literal('')),
    store_image: z.any().optional(),
});

interface StoreFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    store?: Store | null;
    onClose?: () => void;
}

export default function StoreFormDialog({ open, onOpenChange, store = null, onClose }: StoreFormDialogProps) {
    const [loading, setLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const isEditing = !!store;

    const form = useForm<z.infer<typeof formScheme>>({
        resolver: zodResolver(formScheme),
        defaultValues: {
            name: '',
            location_address: '',
            contact_number: '',
            email: '',
            store_image: undefined,
        },
    });

    useEffect(() => {
        if (store) {
            form.reset({
                name: store.name || '',
                location_address: store.location_address || '',
                contact_number: store.contact_number || '',
                email: store.email || '',
                store_image: undefined,
            });
            
            if (store.store_image?.image_url) {
                setImagePreview(store.store_image.image_url);
            }
        }
    }, [store, form]);

    useEffect(() => {
        if (!open) {
            form.reset();
            setImagePreview(null);
            setImageFile(null);
            if (onClose) onClose();
        }
    }, [open, form, onClose]);

    const handleImageChange = (files: File[]) => {
        if (files.length > 0) {
            const file = files[0];
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const clearImage = () => {
        setImageFile(null);
        setImagePreview(null);
    };

    const onSubmit = async (values: z.infer<typeof formScheme>) => {
        setLoading(true);
        
        const formData = new FormData();
        formData.append('name', values.name);
        formData.append('location_address', values.location_address);
        
        if (values.contact_number) {
            formData.append('contact_number', values.contact_number);
        }
        
        if (values.email) {
            formData.append('email', values.email);
        }
        
        if (imageFile) {
            formData.append('store_image', imageFile);
        }
        
        if (isEditing && store?.id) {
            formData.append('_method', 'PUT');
            router.post(`/stores/${store.id}`, formData, {
                onSuccess: () => {
                    setLoading(false);
                    onOpenChange(false);
                    toast.success('Store updated successfully');
                },
                onError: (errors) => {
                    setLoading(false);
                    Object.keys(errors).forEach((key) => {
                        form.setError(key as any, {
                            type: 'manual',
                            message: errors[key],
                        });
                    });
                    toast.error('Failed to update store');
                },
            });
        } else {
            router.post('/stores', formData, {
                onSuccess: () => {
                    setLoading(false);
                    onOpenChange(false);
                    toast.success('Store created successfully');
                },
                onError: (errors) => {
                    setLoading(false);
                    Object.keys(errors).forEach((key) => {
                        form.setError(key as any, {
                            type: 'manual',
                            message: errors[key],
                        });
                    });
                    toast.error('Failed to create store');
                },
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[525px]">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" encType="multipart/form-data">
                        <DialogHeader>
                            <DialogTitle>{isEditing ? 'Edit Store' : 'Add New Store'}</DialogTitle>
                            <DialogDescription>
                                {isEditing 
                                    ? 'Update your store details below.' 
                                    : 'Add a new store location to your account.'}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-4">
                                <Label htmlFor="image">Store Image (Optional)</Label>
                                {!imagePreview ? (
                                    <div className="mx-auto w-full max-w-2xl rounded-lg border border-dashed border-neutral-200 bg-white p-2 dark:border-neutral-800 dark:bg-black">
                                        <FileUpload onChange={handleImageChange} />
                                    </div>
                                ) : (
                                    <div className="mt-2 flex flex-col items-center justify-between gap-3">
                                        <Card className="overflow-hidden">
                                            <CardContent className="p-2">
                                                <img src={imagePreview} alt="Store preview" className="h-64 w-full rounded-sm object-contain" />
                                            </CardContent>
                                        </Card>
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="sm"
                                            onClick={clearImage}
                                            className="flex w-fit items-center gap-1"
                                        >
                                            <Trash className="h-4 w-4" /> Remove Image
                                        </Button>
                                    </div>
                                )}
                            </div>

                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel htmlFor="name">Name</FormLabel>
                                        <FormControl>
                                            <Input id="name" placeholder="Enter store name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="location_address"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel htmlFor="location_address">Address</FormLabel>
                                        <FormControl>
                                            <Textarea id="location_address" placeholder="Enter store address" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="contact_number"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel htmlFor="contact_number">Phone</FormLabel>
                                        <FormControl>
                                            <Input id="contact_number" placeholder="Enter store phone" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel htmlFor="email">Email</FormLabel>
                                        <FormControl>
                                            <Input id="email" placeholder="Enter store email" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button className="hover:cursor-pointer" type="submit" disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isEditing ? 'Update' : 'Create'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
