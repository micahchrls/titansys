import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';

import { Sale } from '@/types';

interface SalesShowPageProps {
  sale: Sale;
}

export default function Show({ sale }: SalesShowPageProps) {
  return (
    <>
      <Head title={`Order #${sale.sale_code}`} />
      {/* <SalesShow /> */}
    </>
  );
}

Show.layout = (page: React.ReactNode) => <AppLayout children={page} />;
