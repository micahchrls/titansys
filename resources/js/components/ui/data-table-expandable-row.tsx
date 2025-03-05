"use client"

import React, { useState, useEffect } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DataTableExpandableRowProps<TData> {
  row: {
    original: TData;
    getVisibleCells: () => Array<{
      id: string;
      column: any;
      getContext: () => any;
    }>;
    getIsSelected?: () => boolean;
  }
  renderSubComponent: (row: any) => React.ReactNode
  hasChildren: boolean
  autoExpand?: boolean
}

export function DataTableExpandableRow<TData>({
  row,
  renderSubComponent,
  hasChildren,
  autoExpand = false
}: DataTableExpandableRowProps<TData>) {
  const [isExpanded, setIsExpanded] = useState(autoExpand)

  // Auto-expand when autoExpand prop changes
  useEffect(() => {
    if (autoExpand) {
      setIsExpanded(true);
    }
  }, [autoExpand]);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded)
  }

  const isSelected = 'getIsSelected' in row ? row.getIsSelected?.() : false;

  return (
    <>
      <tr data-state={isSelected ? "selected" : undefined} className="hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors">
        {row.getVisibleCells().map((cell, index) => {
          // Get the cell content
          let cellContent;
          
          if (cell.column.columnDef && cell.column.columnDef.cell) {
            try {
              cellContent = React.createElement(cell.column.columnDef.cell, cell.getContext());
            } catch (error) {
              console.error("Error rendering cell:", error);
              cellContent = null;
            }
          } else if (cell.column.cell) {
            try {
              cellContent = React.createElement(cell.column.cell, cell.getContext());
            } catch (error) {
              console.error("Error rendering cell:", error);
              cellContent = null;
            }
          } else if (cell.column.accessorKey && row.original) {
            // Fallback to display the raw value from the accessorKey
            cellContent = (row.original as any)[cell.column.accessorKey];
          } else {
            cellContent = null;
          }
          
          return (
            <td 
              key={cell.id} 
              className={`p-2 align-middle ${index === 0 ? "flex items-center" : ""}`}
            >
              {index === 0 && hasChildren && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mr-2 h-8 w-8 p-0"
                  onClick={toggleExpanded}
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              )}
              {cellContent}
            </td>
          );
        })}
      </tr>
      {isExpanded && hasChildren && (
        <tr className="bg-muted/50">
          <td colSpan={row.getVisibleCells().length} className="p-0">
            <div className="pl-8 py-2">{renderSubComponent(row)}</div>
          </td>
        </tr>
      )}
    </>
  )
}
