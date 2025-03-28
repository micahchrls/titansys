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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Supplier } from "@/types";
import { router } from "@inertiajs/react";
import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";

interface SupplierEditProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    suppliers: Supplier[];
    selectedSupplierId: number | null;
}

export function SupplierEdit({ open, onOpenChange, suppliers, selectedSupplierId }: SupplierEditProps) {
    const [name, setName] = useState("");
    const [contactName, setContactName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [address, setAddress] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (open && selectedSupplierId) {
            const supplier = suppliers.find((s) => s.id === selectedSupplierId);
            if (supplier) {
                setName(supplier.name);
                setContactName(supplier.contact_name);
                setPhone(supplier.phone);
                setEmail(supplier.email);
                setAddress(supplier.address);
            }
        }
    }, [open, selectedSupplierId, suppliers]);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        router.put(
            `/suppliers/${selectedSupplierId}`,
            {
                name,
                contact_name: contactName,
                phone,
                email,
                address,
            },
            {
                onSuccess: () => {
                    onOpenChange(false);
                    toast.success("Supplier updated successfully");
                    setIsSubmitting(false);
                },
                onError: (errors) => {
                    console.error(errors);
                    toast.error("Failed to update supplier");
                    setIsSubmitting(false);
                },
            }
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Edit Supplier</DialogTitle>
                        <DialogDescription>
                            Make changes to the supplier here. Click save when you're done.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                Name
                            </Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="contact_name" className="text-right">
                                Contact Name
                            </Label>
                            <Input
                                id="contact_name"
                                value={contactName}
                                onChange={(e) => setContactName(e.target.value)}
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="phone" className="text-right">
                                Phone
                            </Label>
                            <Input
                                id="phone"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="email" className="text-right">
                                Email
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="address" className="text-right">
                                Address
                            </Label>
                            <Textarea
                                id="address"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                className="col-span-3"
                                required
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Saving..." : "Save changes"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
