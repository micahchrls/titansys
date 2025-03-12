import React, { lazy, Suspense, ComponentType } from 'react';
import { Card } from './ui/card';
import { Skeleton } from './ui/skeleton';

// Loading component to show while lazy loading
const LoadingComponent = () => (
  <Card className="p-4">
    <Skeleton className="h-8 w-full mb-4" />
    <Skeleton className="h-32 w-full mb-2" />
    <Skeleton className="h-4 w-2/3 mb-2" />
    <Skeleton className="h-4 w-3/4 mb-2" />
    <Skeleton className="h-4 w-1/2" />
  </Card>
);

// Type for lazy loaded component options
interface LazyOptions {
  fallback?: React.ReactNode;
}

/**
 * Creates a lazy-loaded component with suspense
 * 
 * @param importFn - Function that imports the component
 * @param options - Options for the lazy component
 * @returns A lazy-loaded component
 */
export function lazyLoad<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: LazyOptions = {}
) {
  const LazyComponent = lazy(importFn);
  const { fallback = <LoadingComponent /> } = options;

  return (props: React.ComponentProps<T>) => (
    <Suspense fallback={fallback}>
      <LazyComponent {...props} />
    </Suspense>
  );
}
