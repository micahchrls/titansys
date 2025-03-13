import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { router } from '@inertiajs/react';
import { Pencil, Plus, Trash } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { useDebounce } from '@/hooks/use-debounce';
import { Category } from '@/types';
import { ColumnDef } from '@tanstack/react-table';
import { Toaster } from 'sonner';
import { CategoriesFormDialog } from '@/components/categories/categories-form-dialog';
import { CategorySubcategoryDialog } from '@/components/categories/category-subcategory-dialog';
import { CategoryDelete } from '@/components/categories/category-delete';
import { CategoryEdit } from '@/components/categories/category-edit';

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
    const [formDialogOpen, setFormDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [subcategoryDialogOpen, setSubcategoryDialogOpen] = useState(false);
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
    const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());
    const [processedData, setProcessedData] = useState<Category[]>([]);

    // Store expanded categories in session storage to persist state after form submissions
    useEffect(() => {
        // On initial load, try to get saved expanded categories
        const savedExpandedState = sessionStorage.getItem('expandedCategories');
        if (savedExpandedState) {
            try {
                const savedIds = JSON.parse(savedExpandedState);
                setExpandedCategories(new Set(savedIds));
            } catch (e) {
                console.error('Error parsing saved expanded categories', e);
            }
        }
    }, []);

    // Save expanded categories to session storage when they change
    useEffect(() => {
        if (expandedCategories.size > 0) {
            sessionStorage.setItem('expandedCategories', JSON.stringify(Array.from(expandedCategories)));
        }
    }, [expandedCategories]);

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
                
                // Only parent categories can be expanded
                if (!category.isSubcategory && category.hasChildren) {
                    return (
                        <div className="flex items-center">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="p-0 h-7 w-7 mr-1"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleExpand(category.id);
                                }}
                            >
                                {category.isExpanded ? (
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="h-4 w-4"
                                    >
                                        <path d="M18 15l-6-6-6 6" />
                                    </svg>
                                ) : (
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="h-4 w-4"
                                    >
                                        <path d="M6 9l6 6 6-6" />
                                    </svg>
                                )}
                            </Button>
                            <span className={category.matchesSearch ? 'font-medium' : ''}>
                                {searchTerm ? highlightSearchMatch(category.name) : category.name}
                            </span>
                            {category.children && category.children.length > 0 && (
                                <Badge variant="outline" className="ml-2">
                                    {category.children.length} subcategories
                                </Badge>
                            )}
                        </div>
                    );
                }
                
                // Subcategories get indentation
                if (category.isSubcategory) {
                    return (
                        <div className="flex items-center pl-8">
                            <span className={category.matchesSearch ? 'font-medium' : ''}>
                                {searchTerm ? highlightSearchMatch(category.name) : category.name}
                            </span>
                        </div>
                    );
                }
                
                // Regular category with no children
                return (
                    <div className="flex items-center">
                        <span className={category.matchesSearch ? 'font-medium' : ''}>
                            {searchTerm ? highlightSearchMatch(category.name) : category.name}
                        </span>
                    </div>
                );
            },
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
                        <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-primary hover:bg-primary/10 hover:text-primary" 
                            onClick={() => handleEdit(category)}
                        >
                            <Pencil className="h-4 w-4 mr-1" />
                            Edit
                        </Button>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive" 
                            onClick={() => handleDelete(category)}
                        >
                            <Trash className="h-4 w-4 mr-1" />
                            Delete
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
                    <Button size="sm" onClick={() => setFormDialogOpen(true)}>
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
            
            <CategoriesFormDialog 
                open={formDialogOpen} 
                onOpenChange={setFormDialogOpen}
            />
            
            <CategorySubcategoryDialog
                open={subcategoryDialogOpen}
                onOpenChange={setSubcategoryDialogOpen}
                parentCategoryId={selectedCategoryId}
            />
            
            <CategoryDelete
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                categories={categories.data}
                selectedCategoryId={selectedCategoryId}
            />
            
            <CategoryEdit
                open={editDialogOpen}
                onOpenChange={setEditDialogOpen}
                categories={categories.data}
                selectedCategoryId={selectedCategoryId}
            />
            
            <Toaster />
        </div>
    );
}
