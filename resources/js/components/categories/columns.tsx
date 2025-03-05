import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Category } from "@/types";

export const getColumns = (
  onEdit: (category: Category) => void,
  onDelete: (category: Category) => void,
  onAddSubcategory: (categoryId: number) => void,
  onToggleExpand: (categoryId: number) => void
): ColumnDef<Category & { hasChildren?: boolean; isExpanded?: boolean; formattedName?: React.ReactNode }>[] => [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      const category = row.original;
      const hasChildren = category.hasChildren;
      const isExpanded = category.isExpanded;

      return (
        <div className="flex items-center">
          {hasChildren && (
            <Button
              variant="ghost"
              size="sm"
              className="mr-2 h-8 w-8 p-0"
              onClick={() => onToggleExpand(category.id)}
            >
              {isExpanded ? (
                <span className="h-4 w-4">▼</span>
              ) : (
                <span className="h-4 w-4">▶</span>
              )}
            </Button>
          )}
          <span>{category.name}</span>
          {hasChildren && (
            <Badge variant="outline" className="ml-2">
              {category.children?.length} subcategories
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "description",
    header: "Description",
  },
  {
    accessorKey: "created_at",
    header: "Created At",
    cell: ({ row }) => {
      return new Date(row.original.created_at).toLocaleDateString();
    },
  },
  {
    accessorKey: "updated_at",
    header: "Updated At",
    cell: ({ row }) => {
      return new Date(row.original.updated_at).toLocaleDateString();
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const category = row.original;

      return (
        <div className="flex justify-end space-x-2">
          <Button variant="ghost" size="sm" onClick={() => onAddSubcategory(category.id)}>
            <Plus className="h-4 w-4" />
            <span className="sr-only">Add Subcategory</span>
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onEdit(category)}>
            <span className="sr-only">Edit</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
            </svg>
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onDelete(category)}>
            <span className="sr-only">Delete</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <path d="M3 6h18"></path>
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
            </svg>
          </Button>
        </div>
      );
    },
  },
];
