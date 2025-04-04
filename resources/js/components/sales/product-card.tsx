import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Product } from '@/types/index';
import { Check, ImageIcon, ShoppingCart, Tag } from 'lucide-react';
import { CartItem } from './types';

interface ProductCardProps {
    product: Product & {
        category_name?: string;
        brand_name?: string;
        image?: { file_path: string } | null;
    };
    onAddToCart: (product: Product) => void;
    cartItems: CartItem[];
}

export function ProductCard({ product, onAddToCart, cartItems }: ProductCardProps) {
    // Get stock quantity
    const stockQuantity = product.quantity || 0;

    // Check if product is in cart
    const productInCart = cartItems.find((item) => item.id === product.id);
    const quantityInCart = productInCart ? productInCart.quantity : 0;

    // Get image URL
    const imageUrl = product.image && product.image.file_path ? 
        `${window.location.origin}/storage/${product.image.file_path}` : null;
    // Safely get category and brand names
    const categoryName = product.category_name || 'Uncategorized';
    const brandName = product.brand_name || '';

    // Handle the add to cart click
    const handleAddToCart = () => {
        try {
            // Call the parent component's onAddToCart function
            onAddToCart(product);
        } catch (error) {
            console.error('Error adding product to cart:', error);
        }
    };

    // Determine stock badge variant
    const stockBadgeVariant = stockQuantity > 10 ? 'success' : stockQuantity > 0 ? 'warning' : 'destructive';

    return (
        <div className="h-auto">
            <Card className="h-full overflow-hidden border shadow-sm transition-all hover:shadow-md">
                {/* Product Image */}
                <div className="bg-muted relative h-44">
                    {imageUrl ? (
                        <img
                            src={imageUrl}
                            alt={product.name}
                            className="h-full w-full object-contain"
                            onError={(e) => {
                                // Fallback to placeholder if image fails to load
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.parentElement!.querySelector('div')!.style.display = 'flex';
                            }}
                        />
                    ) : (
                        <div className="bg-muted flex h-full w-full items-center justify-center">
                            <ImageIcon className="text-muted-foreground h-12 w-12 opacity-50" />
                        </div>
                    )}
                    <Badge variant={stockBadgeVariant} className="absolute top-2 right-2 text-xs font-medium">
                        {stockQuantity > 0 ? `${stockQuantity - quantityInCart} in stock` : 'Out of stock'}
                    </Badge>
                </div>

                {/* Product Details */}
                <CardContent className="flex h-[calc(100%-11rem)] flex-col p-4">
                    {/* Product Name */}
                    <h3 className="text-foreground mb-1 truncate font-medium">{product.name}</h3>

                    {/* Category Badge */}
                    <Badge variant="secondary" className="mb-2 w-fit text-xs">
                        {categoryName}
                    </Badge>

                    {/* Product Metadata */}
                    <div className="text-muted-foreground mb-auto flex flex-col gap-1 text-xs">
                        <div className="flex items-center">
                            <Tag className="mr-1 h-3 w-3" />
                            <span>SKU: {product.sku || 'N/A'}</span>
                        </div>
                        {brandName && <span className="font-medium">{brandName}</span>}
                        {product.size && <span>Size: {product.size}</span>}
                    </div>

                    {/* Price and Add to Cart Button */}
                    <div className="mt-3">
                        <div className="mb-2 flex items-baseline">
                            <span className="text-lg font-bold">₱{Number(product.price).toFixed(2)}</span>
                        </div>
                        <Button
                            className="hover:bg-primary/50 w-full cursor-pointer hover:text-black"
                            size="sm"
                            variant={quantityInCart > 0 ? 'outline' : 'default'}
                            onClick={handleAddToCart}
                            disabled={stockQuantity === 0}
                        >
                            {stockQuantity === 0 ? (
                                <>
                                    <ShoppingCart className="mr-2 h-4 w-4" />
                                    Out of Stock
                                </>
                            ) : quantityInCart > 0 ? (
                                <>
                                    <Check className="mr-2 h-4 w-4" />
                                    <span className="flex-1">In Cart</span>
                                    <Badge variant="secondary" className="ml-1">
                                        {quantityInCart}
                                    </Badge>
                                </>
                            ) : (
                                <>
                                    <ShoppingCart className="mr-2 h-4 w-4" />
                                    Add to Cart
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
