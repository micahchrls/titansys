import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Store } from '@/types/index';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from '@inertiajs/react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

const formSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    location_address: z.string().min(1, 'Address is required'),
    contact_number: z.string().optional(),
    email: z.string().email('Invalid email format').optional().or(z.literal('')),
});

interface StoreEditProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    stores: Store[];
    selectedStoreId: number | null;
}

export function StoreEdit({ open, onOpenChange, stores, selectedStoreId }: StoreEditProps) {
    const selectedStore = stores.find((store) => store.id === selectedStoreId);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: selectedStore?.name || '',
            location_address: selectedStore?.location_address || '',
            contact_number: selectedStore?.contact_number || '',
            email: selectedStore?.email || '',
        },
    });

    // Reset form when dialog opens/closes or selected store changes
    useEffect(() => {
        if (selectedStoreId !== null) {
            const selectedStore = stores.find((store) => store.id === selectedStoreId);
            if (selectedStore) {
                form.reset({
                    name: selectedStore.name,
                    location_address: selectedStore.location_address || '',
                    contact_number: selectedStore.contact_number || '',
                    email: selectedStore.email || '',
                });
            }
        }
    }, [selectedStoreId, open, stores, form]);

    function onSubmit(values: z.infer<typeof formSchema>) {
        if (!selectedStoreId) return;

        router.put(route('stores.update', selectedStoreId), values, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                onOpenChange(false);
                toast.success('Store updated successfully');
            },
            onError: (errors) => {
                if (errors.message) {
                    toast.error(errors.message);
                } else {
                    toast.error('Failed to update store.');
                }
            },
        });
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <DialogHeader>
                            <DialogTitle>Edit Store</DialogTitle>
                            <DialogDescription>Make changes to this store.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter store name" {...field} />
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
                                        <FormLabel>Address</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Enter store address" {...field} />
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
                                        <FormLabel>Contact Number</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter contact number" {...field} />
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
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter email address" type="email" {...field} />
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
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                Save Changes
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
