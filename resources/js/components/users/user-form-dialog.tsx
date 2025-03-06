import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from '@inertiajs/react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

const formSchema = z
    .object({
        first_name: z.string().min(1, 'First name is required'),
        middle_name: z.string().optional(),
        last_name: z.string().min(1, 'Last name is required'),
        username: z.string().min(3, 'Username must be at least 3 characters'),
        email: z.string().email('Invalid email address'),
        password: z.string().min(8, 'Password must be at least 8 characters'),
        password_confirmation: z.string(),
        role: z.enum(['admin', 'staff'], { required_error: 'Role is required' }),
    })
    .refine((data) => data.password === data.password_confirmation, {
        message: "Passwords don't match",
        path: ['password_confirmation'],
    });

interface UserFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function UserFormDialog({ open, onOpenChange }: UserFormDialogProps) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            first_name: '',
            middle_name: '',
            last_name: '',
            username: '',
            email: '',
            password: '',
            password_confirmation: '',
            role: '',
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        router.post(route('users.store'), values, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                onOpenChange(false);
                toast.success('User created successfully');
            },
            onError: (errors) => {
                console.error('Form submission errors:', errors);

                // Handle field-specific validation errors
                Object.keys(errors).forEach((key) => {
                    if (key in form.formState.defaultValues) {
                        form.setError(key as any, {
                            type: 'manual',
                            message: errors[key] as string,
                        });
                    }
                });

                // Display general error message if there's a message property
                if (errors.message) {
                    toast.error(errors.message as string);
                } else {
                    toast.error('Failed to create user. Please check the form for errors.');
                }
            },
        });
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <DialogHeader>
                            <DialogTitle>Create User</DialogTitle>
                            <DialogDescription>Add a new user to your system.</DialogDescription>
                        </DialogHeader>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                            <FormField
                                control={form.control}
                                name="first_name"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col h-[85px] relative">
                                        <FormLabel htmlFor="first_name">First Name</FormLabel>
                                        <FormControl>
                                            <Input id="first_name" placeholder="Enter first name" {...field} />
                                        </FormControl>
                                        <div className="min-h-[20px]">
                                            <FormMessage className="text-red-500 text-xs font-medium absolute" />
                                        </div>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="middle_name"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col h-[85px] relative">
                                        <FormLabel htmlFor="middle_name">Middle Name</FormLabel>
                                        <FormControl>
                                            <Input id="middle_name" placeholder="Enter middle name" {...field} />
                                        </FormControl>
                                        <div className="min-h-[20px]">
                                            <FormMessage className="text-red-500 text-xs font-medium absolute" />
                                        </div>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="last_name"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col h-[85px] relative">
                                        <FormLabel htmlFor="last_name">Last Name</FormLabel>
                                        <FormControl>
                                            <Input id="last_name" placeholder="Enter last name" {...field} />
                                        </FormControl>
                                        <div className="min-h-[20px]">
                                            <FormMessage className="text-red-500 text-xs font-medium absolute" />
                                        </div>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="username"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col h-[85px] relative">
                                        <FormLabel htmlFor="username">Username</FormLabel>
                                        <FormControl>
                                            <Input id="username" placeholder="Enter username" {...field} />
                                        </FormControl>
                                        <div className="min-h-[20px]">
                                            <FormMessage className="text-red-500 text-xs font-medium absolute" />
                                        </div>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col h-[85px] relative">
                                        <FormLabel htmlFor="email">Email</FormLabel>
                                        <FormControl>
                                            <Input id="email" type="email" placeholder="Enter email address" {...field} />
                                        </FormControl>
                                        <div className="min-h-[20px]">
                                            <FormMessage className="text-red-500 text-xs font-medium absolute" />
                                        </div>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="role"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col h-[85px] relative">
                                        <FormLabel htmlFor="role">Role</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger id="role">
                                                    <SelectValue placeholder="Select a role" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="admin">Admin</SelectItem>
                                                <SelectItem value="staff">Staff</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <div className="min-h-[20px]">
                                            <FormMessage className="text-red-500 text-xs font-medium absolute" />
                                        </div>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col h-[85px] relative">
                                        <FormLabel htmlFor="password">Password</FormLabel>
                                        <FormControl>
                                            <Input id="password" type="password" placeholder="Enter password" {...field} />
                                        </FormControl>
                                        <div className="min-h-[20px]">
                                            <FormMessage className="text-red-500 text-xs font-medium absolute" />
                                        </div>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password_confirmation"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col h-[85px] relative">
                                        <FormLabel htmlFor="password_confirmation">Confirm Password</FormLabel>
                                        <FormControl>
                                            <Input id="password_confirmation" type="password" placeholder="Confirm password" {...field} />
                                        </FormControl>
                                        <div className="min-h-[20px]">
                                            <FormMessage className="text-red-500 text-xs font-medium absolute" />
                                        </div>
                                    </FormItem>
                                )}
                            />
                        </div>
                        <DialogFooter className="mt-6 flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                Create
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
