import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Category } from '@/types';
import CategoriesIndex from '@/components/categories/categories-index';
import { useState } from 'react';
import { router } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Manage Categories',
        href: '/categories',
    },
];

interface CategoriesProps {
  categories: {
    data: Category[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: Array<{
      url: string | null;
      label: string;
      active: boolean;
    }>;
  };
  filters?: {
    search?: string;
  };
}

export default function Categories({ categories, filters }: CategoriesProps) {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Manage Categories" />
      <div className="flex h-full flex-1 flex-col p-6">
        <div className="flex items-center justify-between pb-6">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Manage Categories</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your category information, add new categories, and view category details.
            </p>
          </div>
        </div>
        <CategoriesIndex categories={categories} filters={filters} />
      </div>
    </AppLayout>
  )
}
