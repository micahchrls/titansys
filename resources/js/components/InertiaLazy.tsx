import React, { lazy, Suspense, ComponentType } from 'react';
import { Loading } from './ui/loading';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';

interface LazyProps {
  resolved: any;
  props?: any;
}

export const InertiaLazy = ({ resolved, props = {} }: LazyProps) => {
  const LazyComponent = lazy(() => Promise.resolve(resolved));
  
  return (
    <Suspense fallback={<Loading />}>
      <LazyComponent {...props} />
    </Suspense>
  );
};

/**
 * Helper function to create a lazy-loaded component from an Inertia page
 */
export const createLazyPage = (name: string, pages: Record<string, () => Promise<any>>) => {
  return resolvePageComponent(`./pages/${name}.tsx`, pages)
    .then((module) => {
      return (props: any) => <InertiaLazy resolved={module} props={props} />;
    });
};
