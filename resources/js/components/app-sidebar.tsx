import { NavMain } from '@/components/nav-main';
import { NavManage } from '@/components/nav-manage';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { BookOpen, Boxes, Folder, LayoutGrid, Store, TrendingUp, Layers, Tag, Users, Truck } from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        url: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Inventory',
        url: '/inventory',
        icon: Boxes,
    },
    {
        title: 'Sales',
        url: '/sales',
        icon: TrendingUp,
    },
];

const mainNavItemsManage: NavItem[] = [
    {
        title: 'Manage Stores',
        url: '/stores',
        icon: Store,
    },
    {
        title: 'Manage Categories',
        url: '/categories',
        icon: Layers, // Represents categorized items
    },
    {
        title: 'Manage Brands',
        url: '/brands',
        icon: Tag, // Represents registered brands
    },
    {
        title: 'Manage Users',
        url: '/users',
        icon: Users, // Represents registered brands
    },
    {
        title: 'Manage Suppliers',
        url: '/suppliers',
        icon: Truck, // Represents registered brands
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        url: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        url: 'https://laravel.com/docs/starter-kits',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset" className="text-base">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild className="py-4">
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="text-[15px]">
                <NavMain items={mainNavItems} />
                <NavManage items={mainNavItemsManage} />
            </SidebarContent>

            <SidebarFooter>
                {/* <NavFooter items={footerNavItems} className="mt-auto text-sm" /> */}
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
