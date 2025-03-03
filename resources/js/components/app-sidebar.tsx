import { NavMain } from '@/components/nav-main';
import { NavManage } from '@/components/nav-manage';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { BookOpen, Container, Boxes, Folder, LayoutGrid, Store, TrendingUp, Layers, Tag, Users, Settings } from 'lucide-react';
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
        title: 'Manage Store',
        url: '/admin/stores',
        icon: Store,
    },
    {
        title: 'Manage Category',
        url: '/admin/categories',
        icon: Layers, // Represents categorized items
    },
    {
        title: 'Manage Brand',
        url: '/admin/brands',
        icon: Tag, // Represents registered brands
    },
    {
        title: 'Manage Suppliers',
        url: '/admin/suppliers',
        icon: Container, // Represents categorized items
    },

    {
        title: 'Manage Users',
        url: '/admin/users',
        icon: Users, // Represents registered brands
    },
    {
        title: 'Settings',
        url: '/settings/profile',
        icon: Settings,
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
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
