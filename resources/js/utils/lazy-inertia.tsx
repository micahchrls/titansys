import React, { lazy, Suspense } from 'react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

// Default loading component for Inertia pages
const PageLoading = () => (
  <div className="container py-6">
    <Card className="p-6">
      <Skeleton className="h-8 w-1/3 mb-6" />
      <Skeleton className="h-4 w-full mb-3" />
      <Skeleton className="h-4 w-3/4 mb-3" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 mt-6">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
      <Skeleton className="h-64 w-full" />
    </Card>
  </div>
);

/**
 * Creates a lazy-loaded Inertia page component
 * 
 * @param importFn - The dynamic import function for the page
 * @param fallback - Optional custom loading component
 * @returns A lazy-loaded Inertia page component
 */
export function lazyPage(
  importFn: () => Promise<any>,
  fallback = <PageLoading />
) {
  const LazyComponent = lazy(importFn);
  
  return (props: any) => (
    <Suspense fallback={fallback}>
      <LazyComponent {...props} />
    </Suspense>
  );
}

/**
 * Helper function to lazily import a page by name
 * For use with Inertia's page resolution
 * 
 * @param name - The page name
 * @returns A function that returns a Promise with the component module
 */
export function lazyImport(name: string) {
  // Use Vite's dynamic import with glob
  return () => import(`../pages/${name}.tsx`);
}

/**
 * Create a page registry object with lazily loaded pages
 * This can be used with Inertia's createInertiaApp
 */
export const LazyPages = {
  // Inventory pages - these are large and benefit from lazy loading
  Brands: lazyPage(() => import('@/pages/brands')),
  Categories: lazyPage(() => import('@/pages/categories')),
  Products: lazyPage(() => import('@/pages/products')),
  Suppliers: lazyPage(() => import('@/pages/suppliers')),
  Inventories: lazyPage(() => import('@/pages/inventories')),
  'Inventories/Show': lazyPage(() => import('@/pages/inventories/show')),
  
  // Other large pages
  Users: lazyPage(() => import('@/pages/users')),
  Sales: lazyPage(() => import('@/pages/sales')),
  Stores: lazyPage(() => import('@/pages/stores')),
  
  // Authentication pages can load immediately - they're smaller
  'Auth/Login': () => import('@/pages/auth/login'),
  'Auth/Register': () => import('@/pages/auth/register'),
  'Auth/ForgotPassword': () => import('@/pages/auth/forgot-password'),
  'Auth/ResetPassword': () => import('@/pages/auth/reset-password'),
  'Auth/VerifyEmail': () => import('@/pages/auth/verify-email'),
  'Auth/ConfirmPassword': () => import('@/pages/auth/confirm-password'),
  
  // Settings pages - moderate size
  'Settings/Profile': lazyPage(() => import('@/pages/settings/profile')),
  'Settings/Password': lazyPage(() => import('@/pages/settings/password')),
  'Settings/Appearance': lazyPage(() => import('@/pages/settings/appearance')),
  
  // Dashboard is often the first page loaded, so no lazy loading
  Dashboard: () => import('@/pages/dashboard'),
  Welcome: () => import('@/pages/welcome'),
};
