import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { router } from "@inertiajs/react";
import { useState } from "react";
import { toast } from "sonner";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";

interface SupplierFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const formSchema = z.object({
    name: z.string().min(1, "Name is required"),
    contact_name: z.string().min(1, "Contact name is required"),
    phone: z.string().min(1, "Phone number is required"),
    email: z.string().email("Please enter a valid email address"),
    address: z.string().min(1, "Address is required"),
});

type FormValues = z.infer<typeof formSchema>;

export function SupplierFormDialog({ open, onOpenChange }: SupplierFormDialogProps) {
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            contact_name: "",
            phone: "",
            email: "",
            address: "",
        },
    });

    function onSubmit(values: FormValues) {
        router.post(
            "/suppliers",
            values,
            {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    form.reset();
                    onOpenChange(false);
                    toast.success("Supplier created successfully");
                },
                onError: (errors) => {
                    if (errors.message) {
                        toast.error(errors.message);
                    } else {
                        toast.error("Failed to create supplier.");
                    }
                },
            }
        );
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[625px] top-[5%] translate-y-0">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <DialogHeader>
                            <DialogTitle>Create Supplier</DialogTitle>
                            <DialogDescription>Add a new supplier to your system.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel htmlFor="name">Name</FormLabel>
                                        <FormControl>
                                            <Input id="name" placeholder="Enter supplier name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="contact_name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel htmlFor="contact_name">Contact Name</FormLabel>
                                        <FormControl>
                                            <Input id="contact_name" placeholder="Enter contact person's name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel htmlFor="phone">Phone Number</FormLabel>
                                        <FormControl>
                                            <Input id="phone" placeholder="Enter phone number" {...field} />
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
                                        <FormLabel htmlFor="email">Email Address</FormLabel>
                                        <FormControl>
                                            <Input type="email" id="email" placeholder="Enter email address" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="address"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel htmlFor="address">Address</FormLabel>
                                        <FormControl>
                                            <Textarea 
                                                id="address" 
                                                placeholder="Enter business address" 
                                                {...field}
                                            />
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
                                Create
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}