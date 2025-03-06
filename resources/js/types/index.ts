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

export interface Inventory {
    id: number;
    product_id: number;
    product_sku: string;
    product_name: string;
    product_price: number;
    product_size: string;
    product_category: string;
    product_brand: string;
    reorder_level: number;
    last_restocked: string;
    quantity: number;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
}
