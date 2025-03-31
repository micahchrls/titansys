import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Sale, SaleItem, SaleLog } from '@/types';
import { format, parseISO } from 'date-fns';
import { Calendar, Receipt, ShoppingBag, Store, User } from 'lucide-react';

interface SaleViewDialogProps {
    sale: Sale | null;
    isOpen: boolean;
    onClose: () => void;
}

export default function SaleViewDialog({ sale, isOpen, onClose }: SaleViewDialogProps) {
    if (!sale) return null;

    // Helper function for badge variant based on status
    const getStatusVariant = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed':
                return 'success';
            case 'pending':
                return 'warning';
            case 'cancelled':
                return 'destructive';
            default:
                return 'secondary';
        }
    };

    console.log(sale);

    // Format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'PHP',
        }).format(amount);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-h-[90vh] max-w-5xl gap-0 overflow-hidden p-0">
                <div className="sticky top-0 z-10 bg-black text-white">
                    <DialogHeader className="flex flex-row items-center justify-between px-6 py-4">
                        <div className="flex items-center gap-3">
                            <ShoppingBag className="h-5 w-5" />
                            <div>
                                <DialogTitle className="text-lg font-medium">Order #{sale?.sale_code}</DialogTitle>
                                {sale && <p className="mt-0.5 text-sm text-gray-400">{format(parseISO(sale.created_at), 'MMMM do, yyyy')}</p>}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {sale && (
                                <Badge variant={getStatusVariant(sale.status)} className="px-3 py-1 capitalize">
                                    {sale.status}
                                </Badge>
                            )}
                        </div>
                    </DialogHeader>
                </div>

                <ScrollArea className="h-[calc(90vh-120px)]">
                    <div className="p-6">
                        {/* Order Summary */}
                        <div className="mb-6 flex flex-wrap justify-between gap-4">
                            <div className="bg-muted/30 min-w-[200px] flex-1 rounded-lg p-3">
                                <h3 className="text-muted-foreground mb-2 flex items-center gap-2 text-xs font-medium">
                                    <Store className="h-3.5 w-3.5" />
                                    Store
                                </h3>
                                <div className="flex items-center gap-2">
                                    <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-full">
                                        <Store className="text-primary h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">{sale.store_name}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-muted/30 min-w-[200px] flex-1 rounded-lg p-3">
                                <h3 className="text-muted-foreground mb-2 flex items-center gap-2 text-xs font-medium">
                                    <User className="h-3.5 w-3.5" />
                                    Processed By
                                </h3>
                                <div className="flex items-center gap-2">
                                    <Avatar className="h-8 w-8">
                                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                            {sale.user_name.substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-sm font-medium">{sale.user_name}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Order Items */}
                        <div className="space-y-4">
                            <h3 className="flex items-center gap-2 text-sm font-medium">
                                <Receipt className="text-muted-foreground h-4 w-4" />
                                Order Items
                            </h3>

                            <div className="overflow-hidden rounded-lg border">
                                <Table>
                                    <TableHeader className="bg-muted/50">
                                        <TableRow>
                                            <TableHead>Product</TableHead>
                                            <TableHead className="hidden md:table-cell">Details</TableHead>
                                            <TableHead className="text-right">Price</TableHead>
                                            <TableHead className="text-center">Qty</TableHead>
                                            <TableHead className="text-right">Total</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {sale?.items &&
                                            sale.items.map((item: SaleItem) => (
                                                <TableRow key={item.id}>
                                                    <TableCell>
                                                        <div className="flex items-center gap-3">
                                                            <Avatar className="h-10 w-10 rounded-md">
                                                                <AvatarFallback className="bg-primary/10 text-primary rounded-md">
                                                                    {item.product.name.substring(0, 2).toUpperCase()}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <p className="leading-none font-medium">{item.product.name}</p>
                                                                <p className="text-muted-foreground mt-1 text-xs">{item.product.sku}</p>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="hidden md:table-cell">
                                                        <div className="flex flex-col gap-1.5">
                                                            <div className="flex items-center gap-1">
                                                                <span className="text-xs text-muted-foreground">Brand:</span>
                                                                <Badge variant="outline" className="h-5 px-1.5 text-xs font-normal">
                                                                    {item.product.product_brand_name || 'N/A'}
                                                                </Badge>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <span className="text-xs text-muted-foreground">Category:</span>
                                                                <Badge variant="secondary" className="h-5 px-1.5 text-xs font-normal">
                                                                    {item.product.product_category_name || 'Uncategorized'}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right font-mono">{formatCurrency(item.unit_price)}</TableCell>
                                                    <TableCell className="text-center font-medium">
                                                        <span className="bg-muted rounded px-2 py-0.5 text-sm">{item.quantity}</span>
                                                    </TableCell>
                                                    <TableCell className="text-right font-mono font-medium">
                                                        {formatCurrency(item.unit_price * item.quantity)}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        {(!sale?.items || sale.items.length === 0) && (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-muted-foreground py-8 text-center italic">
                                                    No items in this order
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            <div className="flex flex-col items-end space-y-2">
                                <div className="bg-muted/50 flex w-full items-center justify-between rounded-md px-4 py-2 md:w-64">
                                    <span className="font-medium">Total Amount:</span>
                                    <span className="font-mono font-bold">{sale?.total_price}</span>
                                </div>
                            </div>
                        </div>

                        {/* Order Timeline - Simplified & Optional */}
                        {sale?.logs && sale.logs.length > 0 && (
                            <div className="mt-6 space-y-3">
                                <h3 className="flex items-center gap-2 text-sm font-medium">
                                    <Calendar className="text-muted-foreground h-4 w-4" />
                                    Order Timeline
                                </h3>
                                <div className="bg-muted/20 max-h-28 overflow-y-auto rounded-lg p-3">
                                    <div className="space-y-2">
                                        {sale.logs.map((log: SaleLog) => (
                                            <div key={log.id} className="border-muted flex items-start gap-2 border-b pb-2 last:border-0 last:pb-0">
                                                <div className="bg-primary mt-1.5 h-2 w-2 flex-shrink-0 rounded-full" />
                                                <div className="flex-grow">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <span className="text-xs font-medium">{log.action_type}</span>
                                                        <span className="text-muted-foreground text-xs">
                                                            {format(parseISO(log.created_at), 'MM/dd/yyyy')}
                                                        </span>
                                                    </div>
                                                    <p className="text-muted-foreground mt-0.5 line-clamp-1 text-xs">{log.description}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>

                <div className="bg-background sticky bottom-0 flex justify-end border-t p-4">
                    <Button variant="outline" onClick={onClose}>
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
