import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { User } from '@/types/index';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';

interface UserDeleteProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    users: User[];
    selectedUserId: number | null;
}

export function UserDelete({ open, onOpenChange, users, selectedUserId }: UserDeleteProps) {
    const selectedUser = users.find((user) => user.id === selectedUserId);

    // Format full name for display
    const formatFullName = (user?: User) => {
        if (!user) return '';
        const middleInitial = user.middle_name ? ` ${user.middle_name.charAt(0)}. ` : ' ';
        return `${user.first_name}${middleInitial}${user.last_name}`;
    };

    const handleDelete = () => {
        if (!selectedUserId) return;

        router.delete(route('users.destroy', selectedUserId), {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                onOpenChange(false);
                toast.success('User deleted successfully');
            },
            onError: (errors) => {
                console.error('Delete error:', errors);
                if (errors.message) {
                    toast.error(errors.message as string);
                } else {
                    toast.error('Failed to delete user. Please try again.');
                }
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Delete User</DialogTitle>
                    <DialogDescription>
                        This action cannot be undone. This will permanently delete the user{" "}
                        <strong>{formatFullName(selectedUser)}</strong> and remove the data from our servers.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button type="button" variant="destructive" onClick={handleDelete}>
                        Delete
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
