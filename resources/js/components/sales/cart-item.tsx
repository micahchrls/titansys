import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { CartItem as CartItemType } from './types';

interface CartItemProps {
    item: CartItemType;
    onAdd: (item: CartItemType) => void;
    onRemove: (itemId: number, removeAll?: boolean) => void;
}

export function CartItem({ item, onAdd, onRemove }: CartItemProps) {
    const { id, name, category_name, price, quantity } = item;
    return (
        <div className="hover:bg-accent/50 flex items-center justify-between rounded-lg border p-3 transition-colors">
            <div className="mr-4 flex-1">
                <p className="font-medium">{name}</p>
                <Badge variant="secondary" className="mt-1 mb-1">
                    {category_name || 'Uncategorized'}
                </Badge>
                <div className="mt-1 flex items-center justify-between">
                    <p className="text-muted-foreground text-sm">
                        ₱{Number(price).toFixed(2)} × {quantity}
                    </p>
                    <p className="font-semibold">₱{(Number(price) * quantity).toFixed(2)}</p>
                </div>
            </div>
            <div className="flex items-center gap-1">
                <Button size="icon" variant="outline" onClick={() => onRemove(item.id)} className="h-7 w-7" title="Remove one item">
                    <Minus className="h-3 w-3" />
                </Button>
                <span className="w-8 text-center font-medium">{quantity}</span>
                <Button size="icon" variant="outline" onClick={() => onAdd(item)} className="h-7 w-7" title="Add one item">
                    <Plus className="h-3 w-3" />
                </Button>
                <Button
                    size="icon"
                    variant="outline"
                    onClick={() => onRemove(id, true)}
                    className="ml-1 h-7 w-7 text-red-500 hover:bg-red-50 hover:text-red-600"
                    title="Remove all"
                >
                    <Trash2 className="h-3 w-3" />
                </Button>
            </div>
        </div>
    );
}
