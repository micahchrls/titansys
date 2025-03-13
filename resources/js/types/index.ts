import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    url: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    first_name: string;
    middle_name: string;
    last_name: string;
    username: string;
    role: string;
    email: string;
    auth: Auth;
    [key: string]: unknown;
}

export interface User {
    id: number;
    first_name: string;
    middle_name: string;
    last_name: string;
    username: string;
    email: string;
    role: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}

export interface Brand {
    id: number;
    name: string;
    description: string;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
}


export interface Supplier {
    id: number;
    name: string;
    contact_name: string;
    phone: string;
    email: string;
    address: string;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
}

export interface Category {
    id: number;
    name: string;
    description: string;
    parent_id: number | null;
    children?: Category[];
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
}

export interface User {
    id: number;
    first_name: string;
    middle_name: string;
    last_name: string;
    username: string;
    email: string;
    role: string;
    created_at: string;
    updated_at: string;
}

export interface Product {
    id: number; 
    sku: string;
    name: string;
    description: string;
    price: number;
    size: string;
    product_brand_id: number;
    product_brand_name: string;
    product_category_id: number;
    product_category_name: string;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
}

export interface StockMovement {
    id: number;
    quantity: number;
    movement_type: 'in' | 'out' | 'adjustment';
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
}

export interface ProductImage {
    id: number;
    product_id: number;
    file_name: string;
    file_path: string;
    file_extension: string;
    file_size: number;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
}

export interface Inventory {
    id: number;
    product_id: number;
    product_sku: string;
    product_name: string;
    product_description: string;
    product_price: number;
    product_size: string;
    product_category: string;
    product_brand: string;
    product_image: ProductImage[];
    supplier: Supplier[];
    reorder_level: number;
    last_restocked: string;
    quantity: number;
    stock_movement: StockMovement[];
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
}


export interface Store {
    id: number;
    name: string;
    location_address: string;
    contact_number: string;
    email: string;
    store_image: StoreImage | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
}

export interface StoreImage {
    id: number;
    store_id: number;
    file_name: string;
    file_path: string;
    file_extension: string;
    file_size: number;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
}