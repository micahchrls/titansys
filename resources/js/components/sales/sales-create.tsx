import { ProductFilter } from '@/components/sales/product-filter';
import { ProductGrid } from '@/components/sales/product-grid';
import { ShoppingCart } from '@/components/sales/shopping-cart';
import { CartItem } from '@/components/sales/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Category, Product } from '@/types';
import { usePage } from '@inertiajs/react';
import { Package } from 'lucide-react';
import { useState } from 'react';

export default function SalesCreate() {
    const pageProps = usePage().props as any;

    // Safely access products and categories, ensuring they're arrays
    // Handle both direct array and Laravel Resource collection format
    let productsData = pageProps.products || [];
    // Check if products is a Laravel Resource collection with data property
    if (productsData && typeof productsData === 'object' && 'data' in productsData) {
        productsData = productsData.data;
    }

    const products = Array.isArray(productsData) ? productsData : [];
    const categoriesData = Array.isArray(pageProps.categories) ? (pageProps.categories as Category[]) : [];

    // Format categories for the filter component - add "All" option
    const categories = ['All', ...categoriesData.map((category: Category) => category.name || '')].filter(Boolean);

    const [cart, setCart] = useState<CartItem[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<string>('All');

    // Filter products based on search term and category
    const filteredProducts = products.filter((product) => {
        // Skip filtering if product data is invalid
        if (!product || typeof product !== 'object') return false;

        // Search term filtering
        const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false;

        // Category filtering logic
        let matchesCategory = true;

        if (categoryFilter !== 'All') {
            // Get the category id from the selected filter name
            const selectedCategory = categoriesData.find((cat) => cat.name === categoryFilter);

            if (selectedCategory) {
                // Match on category_id not category_name
                matchesCategory = product.category_id === selectedCategory.id;
            } else {
                matchesCategory = false;
            }
        }

        return matchesSearch && matchesCategory;
    });

    // Add product to cart
    const addToCart = (product: Product, quantity: number = 1) => {
        console.log('SalesCreate: Adding to cart:', product, 'quantity:', quantity);

        try {
            // Check if product already exists in cart
            const existingItem = cart.find((item) => item.id === product.id);

            if (existingItem) {
                // Update quantity if already in cart
                setCart(cart.map((item) => (
                    item.id === product.id 
                        ? { ...item, quantity: item.quantity + quantity } 
                        : item
                )));

                console.log(`${product.name} quantity increased to ${existingItem.quantity + quantity}`);
            } else {
                // Add new item to cart
                const newCartItem: CartItem = { ...product, quantity: quantity };
                setCart((prevCart) => [...prevCart, newCartItem]);

                console.log(`${product.name} added to your cart`);
            }
        } catch (error) {
            console.error('Error adding product to cart:', error);
        }
    };

    // Remove product from cart
    const removeFromCart = (productId: number, removeAll?: boolean) => {
        console.log('SalesCreate: Removing from cart, product ID:', productId, removeAll ? '(removing all)' : '');

        try {
            const existingItem = cart.find((item) => item.id === productId);
            
            if (!existingItem) return;

            // If removeAll is true or quantity is 1, remove the item completely
            if (removeAll || existingItem.quantity <= 1) {
                setCart(cart.filter((item) => item.id !== productId));
                console.log(`${existingItem.name} removed from your cart`);
            } else {
                // Otherwise just reduce the quantity by 1
                setCart(cart.map((item) => 
                    item.id === productId ? { ...item, quantity: item.quantity - 1 } : item
                ));
                console.log(`${existingItem.name} quantity decreased to ${existingItem.quantity - 1}`);
            }
        } catch (error) {
            console.error('Error removing product from cart:', error);
        }
    };

    return (
        <div className="flex h-[calc(100vh-12rem)] flex-col gap-4 md:flex-row">
            {/* Left Panel - Product List */}
            <Card className="flex-grow md:min-w-[65%] md:max-w-[65%]">
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Package className="mr-2 h-5 w-5" />
                        Available Products ({filteredProducts.length})
                    </CardTitle>
                    <ProductFilter
                        searchTerm={searchTerm}
                        onSearchChange={setSearchTerm}
                        categoryFilter={categoryFilter}
                        onCategoryChange={setCategoryFilter}
                        categories={categories}
                    />
                </CardHeader>
                
                <CardContent className="overflow-auto">
                    {products.length === 0 ? (
                        <div className="p-6 text-center">
                            <p>Loading products...</p>
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="p-6 text-center">
                            <p>No products match your filters.</p>
                            <p className="text-muted-foreground mt-2 text-sm">Try adjusting your search criteria.</p>
                        </div>
                    ) : (
                        <ProductGrid products={filteredProducts} onAddToCart={addToCart} cartItems={cart} />
                    )}
                </CardContent>
            </Card>

            {/* Right Panel - Cart */}
            <ShoppingCart cartItems={cart} onAddToCart={addToCart} onRemoveFromCart={removeFromCart} />
        </div>
    );
}
