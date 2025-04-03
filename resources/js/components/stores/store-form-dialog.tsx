import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from '@inertiajs/react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { Store } from '@/types';

const formSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    location_address: z.string().min(1, 'Address is required'),
    contact_number: z.string().optional(),
    email: z.string().email('Invalid email format').optional().or(z.literal('')),
});

interface StoreFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    store?: Store | null;
    onClose?: () => void;
}

export function StoreFormDialog({ open, onOpenChange, store = null, onClose }: StoreFormDialogProps) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: store?.name || '',
            location_address: store?.location_address || '',
            contact_number: store?.contact_number || '',
            email: store?.email || '',
        },
    });

    // Reset form when dialog closes
    useEffect(() => {
        if (!open) {
            form.reset();
            if (onClose) onClose();
        }
    }, [open, form, onClose]);

    function onSubmit(values: z.infer<typeof formSchema>) {
        if (store?.id) {
            router.post(`/stores/${store.id}`, values, {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    form.reset();
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
        } else {
            router.post('/stores', values, {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    form.reset();
                    onOpenChange(false);
                    toast.success('Store created successfully');
                },
                onError: (errors) => {
                    if (errors.message) {
                        toast.error(errors.message);
                    } else {
                        toast.error('Failed to create store.');
                    }
                },
            });
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] top-[5%] translate-y-0">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <DialogHeader>
                            <DialogTitle>{store ? 'Edit Store' : 'Create Store'}</DialogTitle>
                            <DialogDescription>
                                {store 
                                    ? 'Update your store details below.' 
                                    : 'Add a new store to your system.'}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
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
                                        <FormLabel htmlFor="contact_number">Contact Number</FormLabel>
                                        <FormControl>
                                            <Input id="contact_number" placeholder="Enter contact number" {...field} />
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
                                            <Input id="email" placeholder="Enter email address" type="email" {...field} />
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
                            <Button className="hover:cursor-pointer" type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {store ? 'Update' : 'Create'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
