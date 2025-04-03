import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { router } from '@inertiajs/react';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().optional(),
});

interface BrandFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function BrandFormDialog({ open, onOpenChange }: BrandFormDialogProps) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            description: '',
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        router.post(route('brands.store'), values, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                onOpenChange(false);
                toast.success('Brand created successfully');
            },
            onError: (errors) => {
                if (errors.message) {
                    toast.error(errors.message);
                } else {
                    toast.error('Failed to create brand.');
                }
            },
        });
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] top-[5%] translate-y-0">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <DialogHeader>
                            <DialogTitle>Create Brand</DialogTitle>
                            <DialogDescription>Add a new brand to your system.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel htmlFor="name">Name</FormLabel>
                                        <FormControl>
                                            <Input id="name" placeholder="Enter brand name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel htmlFor="description">Description</FormLabel>
                                        <FormControl>
                                            <Textarea id="description" placeholder="Enter brand description" {...field} />
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
                                Create
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
