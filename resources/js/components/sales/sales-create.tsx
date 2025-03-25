import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package } from 'lucide-react';
import { Product, CartItem } from './types';
import { sampleProducts } from './sample-data';
import { ProductFilter } from './product-filter';
import { ProductGrid } from './product-grid';
import { ShoppingCart } from './shopping-cart';

export default function SalesCreate() {
  const [products, setProducts] = useState<Product[]>(sampleProducts);
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  
  // Get unique categories
  const categories = ['All', ...new Set(products.map(product => product.category))];
  
  // Filter products based on search term and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === '' || categoryFilter === 'All' || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });
  
  // Add product to cart
  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 } 
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };
  
  // Remove product from cart
  const removeFromCart = (productId: number) => {
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem && existingItem.quantity > 1) {
      setCart(cart.map(item => 
        item.id === productId 
          ? { ...item, quantity: item.quantity - 1 } 
          : item
      ));
    } else {
      setCart(cart.filter(item => item.id !== productId));
    }
  };
  
  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-12rem)] gap-4">
      {/* Left Panel - Product List */}
      <Card className="flex-grow">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Package className="mr-2 h-5 w-5" />
            Available Products
          </CardTitle>
          <ProductFilter 
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            categoryFilter={categoryFilter}
            onCategoryChange={setCategoryFilter}
            categories={categories}
          />
        </CardHeader>
        <CardContent>
          <ProductGrid 
            products={filteredProducts}
            onAddToCart={addToCart}
          />
        </CardContent>
      </Card>

      {/* Right Panel - Cart */}
      <ShoppingCart 
        cartItems={cart} 
        onAddToCart={addToCart} 
        onRemoveFromCart={removeFromCart} 
      />
    </div>
  );
}
