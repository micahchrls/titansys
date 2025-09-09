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

export interface Product {
    id: number;
    sku: string;
    name: string;
    description: string;
    price: number;
    selling_price: number;
    size: string;
    product_brand_id: number;
    product_brand_name: string;
    product_category_id: number;
    product_category_name: string;
    quantity: number;
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
    part_number: string;
    vehicle: string;
    product_description: string;
    code: string;
    product_size: string;
    product_category: string;
    product_brand: string;
    product_category_id: number;
    product_brand_id: number;
    supplier_id: number;
    supplier_name: string;
    store_id: number;
    store_name: string;
    product_image: ProductImage;
    image_url: string | null;
    reorder_level: number;
    last_restocked: string;
    quantity: number;
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

export interface Sale {
    id: number;
    sale_code: string;
    store_id: number;
    store_name: string;
    user_id: number;
    user_name: string;
    total_price: number;
    status: string;
    created_at: string;
    updated_at: string;
    items?: SaleItem[];
    [key: string]: unknown;
}

export interface SaleItem {
    id: number;
    sale_id: number;
    product_id: number;
    quantity: number;
    unit_price: number;
    product: {
        id: number;
        name: string;
        sku: string;
        product_brand_id: number;
        product_category_id: number;
        product_brand_name: string;
        product_category_name: string;
    };
    [key: string]: unknown;
}

export interface SaleLog {
    id: number;
    sale_id: number;
    action_type: string;
    description: string;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
}