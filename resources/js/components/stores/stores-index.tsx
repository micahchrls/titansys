import { Store, StoreImage } from '@/types';
import { useCallback, useEffect, useState } from 'react';
import { useDebounce } from '@/hooks/use-debounce';
import { router } from '@inertiajs/react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Plus, Search, X, Pencil, Trash, Phone, Mail, Store as StoreIcon, MapPin, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTablePagination } from '@/components/ui/data-table-pagination-simple';
import { Toaster } from 'sonner';
import StoreFormDialog from '@/components/stores/store-form-dialog';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

interface StoresIndexProps {
    stores: {
        data: Store[];
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
    initialSearch?: string;
}

export default function StoresIndex({ stores, initialSearch }: StoresIndexProps) {
    const [searchTerm, setSearchTerm] = useState(initialSearch || '');
    const debouncedSearchTerm = useDebounce(searchTerm, 300);
    const [formDialogOpen, setFormDialogOpen] = useState(false);
    const [editingStore, setEditingStore] = useState<Store | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null);

    const handleSearch = useCallback((value: string) => {
        setSearchTerm(value);
    }, []);

    const handleEdit = (store: Store) => {
        setSelectedStoreId(store.id);
        setEditingStore(store);
        setFormDialogOpen(true);
    };

    const handleDelete = (store: Store) => {
        setSelectedStoreId(store.id);
        setDeleteDialogOpen(true);
    };

    const handlePageChange = (page: number) => {
        router.get(
            '/stores',
            { 
                page,
                search: searchTerm || undefined 
            },
            {
                preserveState: true,
                replace: true,
                only: ['stores'],
            }
        );
    };

    const clearSearch = () => {
        setSearchTerm('');
    };

    useEffect(() => {
        if (debouncedSearchTerm !== undefined) {
            router.get(
                '/stores',
                { search: debouncedSearchTerm },
                {
                    preserveState: true,
                    replace: true,
                    only: ['stores'],
                }
            );
        }
    }, [debouncedSearchTerm]);

    // Helper function to highlight search matches
    const highlightMatch = (text: string, searchTerm: string) => {
        if (!searchTerm || !text) return text;
        
        try {
            const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
            return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800 rounded-sm px-0.5">$1</mark>');
        } catch (e) {
            return text;
        }
    };

    // Helper function to get the store image URL
    const getStoreImageUrl = (store: Store) => {
        // store_image is a single object, not an array
        if (store.store_image && store.store_image.file_path) {
            return `${window.location.origin}/storage/${store.store_image.file_path}`;
        }
        return null;
    };

    // Helper function to get store initials
    const getStoreInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                    <div>
                        <CardTitle className="text-xl font-bold">Stores</CardTitle>
                        <CardDescription>Manage your store locations and details</CardDescription>
                    </div>
                    <Button className="hover:cursor-pointer" size="sm" onClick={() => setFormDialogOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Store
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="mb-4 flex items-center gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search stores..."
                                className="w-full pl-8 pr-8"
                                value={searchTerm}
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                            {searchTerm && (
                                <Button
                                    variant="ghost"
                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                    onClick={clearSearch}
                                >
                                    <X className="h-4 w-4 text-muted-foreground" />
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="space-y-4">
                        {stores.data.length === 0 ? (
                            <div className="flex h-[200px] w-full items-center justify-center rounded-md border border-dashed">
                                <div className="text-center">
                                    <div className="flex justify-center mb-4">
                                        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                                            <StoreIcon className="h-8 w-8 text-muted-foreground" />
                                        </div>
                                    </div>
                                    <p className="text-lg font-medium mb-1">No stores found</p>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        {searchTerm 
                                            ? `No stores match the search term "${searchTerm}"`
                                            : "You haven't added any stores yet"}
                                    </p>
                                    <Button 
                                        className="hover:cursor-pointer" 
                                        onClick={() => setFormDialogOpen(true)}
                                    >
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add Your First Store
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            stores.data.map((store) => {
                                const imageUrl = getStoreImageUrl(store);
                                return (
                                    <div 
                                        key={store.id} 
                                        className={`flex items-start gap-5 rounded-lg border p-5 transition-all hover:shadow-md ${
                                            searchTerm && 
                                            (store.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                            (store.location_address && store.location_address.toLowerCase().includes(searchTerm.toLowerCase())))
                                                ? 'border-primary/50 bg-primary/5'
                                                : 'hover:bg-accent/5'
                                        }`}
                                    >
                                        <div className="h-36 w-36 flex-shrink-0 rounded-lg bg-muted flex items-center justify-center overflow-hidden shadow-sm border group relative">
                                            {imageUrl ? (
                                                <>
                                                    <img 
                                                        src={imageUrl} 
                                                        alt={store.name} 
                                                        className="h-full w-full object-cover transition-all group-hover:scale-105"
                                                        onError={(e) => {
                                                            // Fallback to initials if image fails to load
                                                            const target = e.target as HTMLImageElement;
                                                            target.style.display = 'none';
                                                            
                                                            // Make sure parent is a flex container
                                                            const parent = target.parentElement;
                                                            if (parent) {
                                                                // Remove any existing fallback span to avoid duplicates
                                                                const existingSpan = parent.querySelector('.store-initials-fallback');
                                                                if (existingSpan) {
                                                                    parent.removeChild(existingSpan);
                                                                }
                                                                
                                                                // Create and add the fallback span
                                                                const span = document.createElement('span');
                                                                span.className = 'text-4xl font-bold text-muted-foreground store-initials-fallback';
                                                                span.textContent = getStoreInitials(store.name);
                                                                parent.appendChild(span);
                                                            }
                                                        }}
                                                    />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <Button 
                                                            variant="secondary" 
                                                            size="sm" 
                                                            className="text-white bg-black/50 hover:bg-black/70"
                                                            onClick={() => handleEdit(store)}
                                                        >
                                                            View Details
                                                        </Button>
                                                    </div>
                                                </>
                                            ) : (
                                                <span className="text-4xl font-bold text-muted-foreground store-initials-fallback">
                                                    {getStoreInitials(store.name)}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 
                                                            className="text-lg font-medium"
                                                            dangerouslySetInnerHTML={{ 
                                                                __html: highlightMatch(store.name, searchTerm) 
                                                            }}
                                                        />
                                                        <Badge variant="outline" className="text-xs font-normal">
                                                            Active
                                                        </Badge>
                                                    </div>
                                                    {store.location_address && (
                                                        <p 
                                                            className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1"
                                                        >
                                                            <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                                                            <span dangerouslySetInnerHTML={{ 
                                                                __html: highlightMatch(store.location_address, searchTerm) 
                                                            }} />
                                                        </p>
                                                    )}
                                                    <div className="mt-3 flex flex-col gap-2">
                                                        {store.contact_number && (
                                                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                                                                <Phone className="h-4 w-4 flex-shrink-0" />
                                                                {store.contact_number}
                                                            </p>
                                                        )}
                                                        {store.email && (
                                                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                                                                <Mail className="h-4 w-4 flex-shrink-0" />
                                                                {store.email}
                                                            </p>
                                                        )}
                                                        <p className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                                                            <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                                                            Added {formatDistanceToNow(new Date(store.created_at), { addSuffix: true })}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex space-x-2">
                                                    <Button 
                                                        variant="outline" 
                                                        size="sm" 
                                                        className="text-primary hover:bg-primary/10 hover:text-primary"
                                                        onClick={() => handleEdit(store)}
                                                    >
                                                        <Pencil className="h-4 w-4 mr-1" />
                                                        Edit
                                                    </Button>
                                                    <Button 
                                                        variant="outline" 
                                                        size="sm" 
                                                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                        onClick={() => handleDelete(store)}
                                                    >
                                                        <Trash className="h-4 w-4 mr-1" />
                                                        Delete
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {stores.last_page > 1 && (
                        <div className="mt-6">
                            <div className="text-sm text-muted-foreground mb-4">
                                Showing {(stores.current_page - 1) * stores.per_page + 1} to {Math.min(stores.current_page * stores.per_page, stores.total)} of {stores.total} entries
                            </div>
                            <DataTablePagination
                                currentPage={stores.current_page}
                                totalPages={stores.last_page}
                                onPageChange={handlePageChange}
                                totalItems={stores.total}
                                pageSize={stores.per_page}
                            />
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Store Form Dialog */}
            <StoreFormDialog
                open={formDialogOpen}
                onOpenChange={setFormDialogOpen}
                store={editingStore}
                onClose={() => {
                    setEditingStore(null);
                    setSelectedStoreId(null);
                }}
            />

            {/* <StoreEdit open={editDialogOpen} onOpenChange={setEditDialogOpen} stores={stores.data} selectedStoreId={selectedStoreId} />

            <StoreDelete open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} stores={stores.data} selectedStoreId={selectedStoreId} /> */}

            <Toaster />
        </div>
    );
}
