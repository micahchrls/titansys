import React from 'react';
import { Skeleton } from './skeleton';
import { Card } from './card';

interface LoadingProps {
  variant?: 'default' | 'skeleton' | 'spinner';
}

export function Loading({ variant = 'default' }: LoadingProps) {
  if (variant === 'skeleton') {
    return (
      <Card className="p-4">
        <Skeleton className="h-8 w-full mb-4" />
        <Skeleton className="h-32 w-full mb-2" />
        <Skeleton className="h-4 w-2/3 mb-2" />
        <Skeleton className="h-4 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2" />
      </Card>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-[200px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );
}
