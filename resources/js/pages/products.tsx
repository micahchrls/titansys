
import { Head, usePage} from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Product } from '@/types';
import ProductsIndex from '@/components/products/products-index';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Manage Products',
        href: '/products',
    }
];

export default function Products() {
    const { products } = usePage<{ products: Product[] }>().props;
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manage Products" />
            <div className="flex h-full flex-1 flex-col p-6">
                <div className="flex items-center justify-between pb-6">
                    <div>
                        <h2 className="text-2xl font-semibold tracking-tight">Manage Products</h2>
                        <p className="text-sm text-muted-foreground mt-1">
                            Manage your product information, add new products, and view product details.
                        </p>
                    </div>
                </div>
                <ProductsIndex products={products} />
            </div>
        </AppLayout>
    );
}