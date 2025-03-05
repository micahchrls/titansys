import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { router } from '@inertiajs/react';
import { Pencil, Plus, Trash } from 'lucide-react';
import React, { useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { useDebounce } from '@/hooks/use-debounce';
import { Category } from '@/types';
import { ColumnDef } from '@tanstack/react-table';
import { Toaster } from 'sonner';
import CategoryCreate from './category-create';
import { CategoryDelete } from './category-delete';
import { CategoryEdit } from './category-edit';

interface CategoriesIndexProps {
    categories: {
        data: Category[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
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

export default function CategoriesIndex({ categories, filters = {} }: CategoriesIndexProps) {
    const [searchTerm, setSearchTerm] = useState(filters?.search ? decodeURIComponent(filters.search) : '');
    const debouncedSearch = useDebounce(searchTerm, 300);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [subcategoryDialogOpen, setSubcategoryDialogOpen] = useState(false);
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
    const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());
    const [processedData, setProcessedData] = useState<Category[]>([]);

    // Helper function to check if a string contains the search query
    const matchesSearch = (text: string | null | undefined) => {
        if (!searchTerm || searchTerm.trim() === '' || !text) return false;
        return text.toLowerCase().includes(searchTerm.toLowerCase());
    };

    // Process data to include subcategories when expanded or when searching
    useEffect(() => {
        const processed: Category[] = [];
        
        categories.data.forEach(category => {
            const categoryMatches = matchesSearch(category.name) || matchesSearch(category.description);
            const hasSubcategoryMatches = category.children?.some(
                subcategory => matchesSearch(subcategory.name) || matchesSearch(subcategory.description)
            );
            
            // Add the parent category
            processed.push({
                ...category,
                hasChildren: category.children && category.children.length > 0,
                isExpanded: expandedCategories.has(category.id) || (searchTerm && hasSubcategoryMatches),
                matchesSearch: categoryMatches
            });
            
            // Add children if expanded or if searching and there's a match
            if ((expandedCategories.has(category.id) || (searchTerm && hasSubcategoryMatches)) && 
                category.children && category.children.length > 0) {
                category.children.forEach(subcategory => {
                    const subcategoryMatches = matchesSearch(subcategory.name) || matchesSearch(subcategory.description);
                    if (!searchTerm || subcategoryMatches) {
                        processed.push({
                            ...subcategory,
                            isSubcategory: true,
                            parentId: category.id,
                            matchesSearch: subcategoryMatches
                        });
                    }
                });
            }
        });
        
        setProcessedData(processed);
    }, [categories.data, expandedCategories, searchTerm]);

    const handleSearch = (value: string) => {
        setSearchTerm(value);
    };

    useEffect(() => {
        if (debouncedSearch === (filters?.search ? decodeURIComponent(filters.search) : '')) return;

        const params = new URLSearchParams(window.location.search);

        if (debouncedSearch) {
            params.set('search', encodeURIComponent(debouncedSearch));
        } else {
            params.delete('search');
        }
        params.delete('page');

        router.visit(`${window.location.pathname}?${params.toString()}`, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    }, [debouncedSearch, filters?.search]);

    // Auto-expand categories when searching
    useEffect(() => {
        if (searchTerm) {
            // Find categories with matching subcategories
            const categoriesToExpand = categories.data
                .filter((category) =>
                    category.children?.some(
                        (subcategory) =>
                            subcategory.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (subcategory.description && subcategory.description.toLowerCase().includes(searchTerm.toLowerCase())),
                    ),
                )
                .map((category) => category.id);

            // Add these categories to expanded set
            setExpandedCategories((prev) => {
                const newSet = new Set(prev);
                categoriesToExpand.forEach((id) => newSet.add(id));
                return newSet;
            });
        }
    }, [categories.data, searchTerm]);

    const handleEdit = (category: Category) => {
        setSelectedCategoryId(category.id);
        setEditDialogOpen(true);
    };

    const handleDelete = (category: Category) => {
        setSelectedCategoryId(category.id);
        setDeleteDialogOpen(true);
    };

    const handleAddSubcategory = (parentId: number) => {
        setSelectedCategoryId(parentId);
        setSubcategoryDialogOpen(true);
    };

    const toggleExpand = (categoryId: number) => {
        setExpandedCategories((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(categoryId)) {
                newSet.delete(categoryId);
            } else {
                newSet.add(categoryId);
            }
            return newSet;
        });
    };

    // Helper function to highlight search matches
    const highlightSearchMatch = (text: string) => {
        if (!searchTerm || !text) return text;
        
        const parts = text.split(new RegExp(`(${searchTerm})`, 'gi'));
        return (
            <>
                {parts.map((part, i) => 
                    part.toLowerCase() === searchTerm.toLowerCase() ? (
                        <span key={i} className="bg-yellow-200 dark:bg-yellow-800">
                            {part}
                        </span>
                    ) : (
                        part
                    )
                )}
            </>
        );
    };

    const columns: ColumnDef<Category>[] = [
        {
            accessorKey: 'name',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
            cell: ({ row }) => {
                const category = row.original;
                const hasChildren = category.children && category.children.length > 0;
                const isExpanded = expandedCategories.has(category.id) || category.isExpanded;
                const isSubcategory = category.isSubcategory;
                const nameMatches = matchesSearch(category.name);
                
                return (
                    <div className={`flex items-center ${isSubcategory ? 'pl-8' : ''}`}>
                        {hasChildren && !isSubcategory && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="mr-2 h-8 w-8 p-0"
                                onClick={() => toggleExpand(category.id)}
                            >
                                {isExpanded ? (
                                    <span className="h-4 w-4">▼</span>
                                ) : (
                                    <span className="h-4 w-4">▶</span>
                                )}
                            </Button>
                        )}
                        {nameMatches && searchTerm ? (
                            highlightSearchMatch(category.name)
                        ) : (
                            category.name
                        )}
                        {hasChildren && !isSubcategory && (
                            <Badge variant="outline" className="ml-2">
                                {category.children.length} subcategories
                            </Badge>
                        )}
                    </div>
                );
            },
            enableSorting: true,
        },
        {
            accessorKey: 'description',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Description" />,
            cell: ({ row }) => {
                const category = row.original;
                const descriptionMatches = category.description && matchesSearch(category.description);
                
                return descriptionMatches && searchTerm ? 
                    highlightSearchMatch(category.description) : 
                    category.description;
            },
            enableSorting: true,
        },
        {
            accessorKey: 'created_at',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Created At" />,
            cell: ({ row }) => {
                return new Date(row.original.created_at).toLocaleDateString();
            },
            enableSorting: true,
        },
        {
            accessorKey: 'updated_at',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Updated At" />,
            cell: ({ row }) => {
                return new Date(row.original.updated_at).toLocaleDateString();
            },
            enableSorting: true,
        },
        {
            id: 'actions',
            cell: ({ row }) => {
                const category = row.original;
                
                return (
                    <div className="flex justify-end space-x-2">
                        {!category.isSubcategory && (
                            <Button variant="ghost" size="sm" onClick={() => handleAddSubcategory(category.id)}>
                                <Plus className="h-4 w-4" />
                                <span className="sr-only">Add Subcategory</span>
                            </Button>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(category)}>
                            <span className="sr-only">Edit</span>
                            <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(category)}>
                            <span className="sr-only">Delete</span>
                            <Trash className="h-4 w-4" />
                        </Button>
                    </div>
                );
            },
        },
    ];

    // Filter data based on search term if using client-side filtering
    const filteredData = searchTerm ? 
        processedData.filter(item => 
            item.matchesSearch || 
            // Include parent categories of matching subcategories
            (item.isSubcategory && processedData.some(p => 
                p.id === item.parentId && p.children?.some(s => 
                    s.id === item.id && (
                        matchesSearch(s.name) || 
                        matchesSearch(s.description)
                    )
                )
            ))
        ) : 
        processedData;

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xl font-bold">Categories</CardTitle>
                    <Button size="sm" onClick={() => setCreateDialogOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Category
                    </Button>
                </CardHeader>
                <CardContent>
                    <DataTable
                        columns={columns}
                        data={filteredData}
                        pagination={categories}
                        searchKey="name"
                        searchValue={searchTerm}
                        onSearchChange={handleSearch}
                    />
                </CardContent>
            </Card>

            <CategoryCreate showModal={createDialogOpen} setShowModal={setCreateDialogOpen} />

            <CategoryEdit
                open={editDialogOpen}
                onOpenChange={setEditDialogOpen}
                categories={categories.data}
                selectedCategoryId={selectedCategoryId}
            />

            <CategoryDelete
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                categories={categories.data}
                selectedCategoryId={selectedCategoryId}
            />

            {/* Subcategory creation dialog */}
            {subcategoryDialogOpen && selectedCategoryId && (
                <CategoryCreate showModal={subcategoryDialogOpen} setShowModal={setSubcategoryDialogOpen} parentId={selectedCategoryId} />
            )}

            <Toaster />
        </div>
    );
}
