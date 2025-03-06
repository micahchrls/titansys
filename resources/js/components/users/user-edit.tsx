import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User } from '@/types/index';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from '@inertiajs/react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

const formSchema = z.object({
    first_name: z.string().min(1, 'First name is required'),
    middle_name: z.string().optional(),
    last_name: z.string().min(1, 'Last name is required'),
    username: z.string().min(3, 'Username must be at least 3 characters'),
    email: z.string().email('Invalid email address'),
    role: z.enum(['admin', 'staff'], { required_error: 'Role is required' }),
    password: z.string().optional(),
    password_confirmation: z.string().optional(),
}).refine((data) => !data.password || data.password === data.password_confirmation, {
    message: "Passwords don't match",
    path: ['password_confirmation'],
});

interface UserEditProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    users: User[];
    selectedUserId: number | null;
}

export function UserEdit({ open, onOpenChange, users, selectedUserId }: UserEditProps) {
    const selectedUser = users.find((user) => user.id === selectedUserId);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            first_name: selectedUser?.first_name || '',
            middle_name: selectedUser?.middle_name || '',
            last_name: selectedUser?.last_name || '',
            username: selectedUser?.username || '',
            email: selectedUser?.email || '',
            role: selectedUser?.role || '',
            password: '',
            password_confirmation: '',
        },
    });

    // Reset form when dialog opens/closes or selected user changes
    useEffect(() => {
        if (selectedUserId !== null) {
            const selectedUser = users.find((user) => user.id === selectedUserId);
            if (selectedUser) {
                form.reset({
                    first_name: selectedUser.first_name,
                    middle_name: selectedUser.middle_name || '',
                    last_name: selectedUser.last_name,
                    username: selectedUser.username,
                    email: selectedUser.email,
                    role: selectedUser.role,
                    password: '',
                    password_confirmation: '',
                });
            }
        }
    }, [selectedUserId, open]);

    function onSubmit(values: z.infer<typeof formSchema>) {
        if (!selectedUserId) return;

        // If password is empty, remove it from the values
        const formData = { ...values };
        if (!formData.password) {
            delete formData.password;
            delete formData.password_confirmation;
        }

        router.put(route('users.update', selectedUserId), formData, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                onOpenChange(false);
                toast.success('User updated successfully');
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
                    toast.error('Failed to update user. Please check the form for errors.');
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
                            <DialogTitle>Edit User</DialogTitle>
                            <DialogDescription>Make changes to this user.</DialogDescription>
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
                                        <FormLabel htmlFor="password">Password (Leave blank to keep current)</FormLabel>
                                        <FormControl>
                                            <Input id="password" type="password" placeholder="Enter new password" {...field} />
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
                                            <Input id="password_confirmation" type="password" placeholder="Confirm new password" {...field} />
                                        </FormControl>
                                        <div className="min-h-[20px]">
                                            <FormMessage className="text-red-500 text-xs font-medium absolute" />
                                        </div>
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
