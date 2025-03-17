"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
    ArrowUpDown, 
    X, 
    CalendarIcon, 
    Info 
} from 'lucide-react';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from '@/components/ui/table';
import { 
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getPaginationRowModel,
    SortingState,
    getSortedRowModel,
    ColumnFiltersState,
    getFilteredRowModel,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { format, isAfter, isBefore, isEqual, startOfDay, endOfDay } from 'date-fns';
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface StockMovement {
    id: number;
    quantity: number;
    movement_type: 'in' | 'out' | 'adjustment';
    created_at: string;
    updated_at: string;
    user_id?: number;
    user_name?: string;
    reference_number?: string;
    reference_type?: 'purchase_order' | 'sales_order' | 'return' | 'internal_transfer' | 'inventory_check';
    notes?: string;
    previous_quantity?: number;
    location?: string;
    reason_code?: string;
}

interface StockMovementHistoryProps {
    stockMovements: StockMovement[];
    onEditMovement?: (movement: StockMovement) => void;
    onAddMovement?: () => void;
}

export function StockMovementHistory({ 
    stockMovements,
    onEditMovement,
    onAddMovement
}: StockMovementHistoryProps) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [globalFilter, setGlobalFilter] = useState<string>("");
    
    // Date range filter state
    const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
    const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
    const [filteredMovements, setFilteredMovements] = useState<StockMovement[]>(stockMovements);

    // Apply date range filter whenever stockMovements, dateFrom, or dateTo changes
    useEffect(() => {
        filterMovementsByDateRange();
    }, [stockMovements, dateFrom, dateTo]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    // Function to filter movements by date range
    const filterMovementsByDateRange = () => {
        if (!dateFrom && !dateTo) {
            // If no date range is selected, show all movements
            setFilteredMovements(stockMovements);
            return;
        }

        const filtered = stockMovements.filter(movement => {
            const movementDate = new Date(movement.created_at);

            // If only start date is provided
            if (dateFrom && !dateTo) {
                return isEqual(startOfDay(movementDate), startOfDay(dateFrom)) || 
                       isAfter(movementDate, startOfDay(dateFrom));
            }

            // If only end date is provided
            if (!dateFrom && dateTo) {
                return isEqual(startOfDay(movementDate), startOfDay(dateTo)) || 
                       isBefore(movementDate, endOfDay(dateTo));
            }

            // If both dates are provided
            if (dateFrom && dateTo) {
                return (
                    (isEqual(startOfDay(movementDate), startOfDay(dateFrom)) || 
                     isAfter(movementDate, startOfDay(dateFrom))) && 
                    (isEqual(startOfDay(movementDate), startOfDay(dateTo)) || 
                     isBefore(movementDate, endOfDay(dateTo)))
                );
            }

            return true;
        });

        setFilteredMovements(filtered);
    };

    // Clear date range filters
    const clearDateFilter = () => {
        setDateFrom(undefined);
        setDateTo(undefined);
    };

    const columns: ColumnDef<StockMovement>[] = [
        {
            accessorKey: 'created_at',
            header: ({ column }) => {
                return (
                    <div
                        className="flex items-center cursor-pointer"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Date & Time
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                )
            },
            cell: ({ row }) => formatDate(row.getValue('created_at')),
        },
        {
            accessorKey: 'movement_type',
            header: "Type",
            cell: ({ row }) => {
                const type = row.getValue('movement_type') as string;
                return (
                    <Badge 
                        variant={
                            type === 'in' 
                                ? 'outline' 
                                : type === 'out' 
                                    ? 'destructive' 
                                    : 'secondary'
                        }
                        className={
                            type === 'in' 
                                ? 'text-green-600 border-green-300' 
                                : type === 'out' 
                                    ? '' 
                                    : ''
                        }
                    >
                        {type === 'in' ? 'Stock In' : type === 'out' ? 'Stock Out' : 'Adjustment'}
                    </Badge>
                );
            },
        },
        {
            accessorKey: 'quantity',
            header: ({ column }) => {
                return (
                    <div
                        className="flex items-center cursor-pointer"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Quantity
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                )
            },
            cell: ({ row }) => {
                const type = row.getValue('movement_type') as string;
                const quantity = Math.abs(row.getValue('quantity') as number);
                return (
                    <span className={
                        type === 'in' 
                            ? 'text-green-600 font-medium' 
                            : type === 'out' 
                                ? 'text-red-600 font-medium' 
                                : 'text-blue-600 font-medium'
                    }>
                        {type === 'in' ? '+' : type === 'out' ? '-' : '±'}{quantity}
                    </span>
                );
            },
        },
    ];

    const table = useReactTable({
        data: filteredMovements,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        state: {
            sorting,
            columnFilters,
            globalFilter,
        },
        onGlobalFilterChange: setGlobalFilter,
    });

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Stock Movement History</h2>
                <div className="relative w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Search movements..." 
                        className="pl-8" 
                        value={globalFilter ?? ""}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                    />
                </div>
            </div>
            
            <Card className="border-dashed mb-4">
                <CardContent className="pt-6">
                    <div className="flex flex-col gap-3">
                        <h3 className="text-sm font-medium flex items-center">
                            <CalendarIcon className="h-4 w-4 mr-2" />
                            Filter Stock Movements by Date
                        </h3>
                        
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                                <p className="text-sm mb-2">Start Date</p>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full justify-start text-left font-normal",
                                                !dateFrom && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {dateFrom ? format(dateFrom, "PPP") : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={dateFrom}
                                            onSelect={setDateFrom}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                            
                            <div className="flex-1">
                                <p className="text-sm mb-2">End Date</p>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full justify-start text-left font-normal",
                                                !dateTo && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {dateTo ? format(dateTo, "PPP") : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={dateTo}
                                            onSelect={setDateTo}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>
                        
                        {(dateFrom || dateTo) && (
                            <div className="flex justify-end">
                                <Button
                                    variant="outline"
                                    onClick={clearDateFilter}
                                    size="sm"
                                    className="flex items-center"
                                >
                                    <X className="mr-2 h-4 w-4" />
                                    Clear Filter
                                </Button>
                            </div>
                        )}
                        
                        {dateFrom && dateTo && (
                            <div className="mt-2 text-xs text-muted-foreground flex items-center">
                                <Info className="h-3 w-3 mr-1" /> 
                                Showing {filteredMovements.length} movements from {format(dateFrom, "PPP")} to {format(dateTo, "PPP")}.
                            </div>
                        )}
                        {dateFrom && !dateTo && (
                            <div className="mt-2 text-xs text-muted-foreground flex items-center">
                                <Info className="h-3 w-3 mr-1" /> 
                                Showing {filteredMovements.length} movements from {format(dateFrom, "PPP")} onwards.
                            </div>
                        )}
                        {!dateFrom && dateTo && (
                            <div className="mt-2 text-xs text-muted-foreground flex items-center">
                                <Info className="h-3 w-3 mr-1" /> 
                                Showing {filteredMovements.length} movements up to {format(dateTo, "PPP")}.
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={table.getAllColumns().length}
                                    className="h-24 text-center"
                                >
                                    <div className="flex flex-col items-center justify-center py-4">
                                        <CalendarIcon className="h-10 w-10 text-muted-foreground mb-2" />
                                        <h3 className="text-lg font-medium">No movements found</h3>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {dateFrom || dateTo 
                                                ? "No stock movements found in the selected date range." 
                                                : "No stock movements have been recorded yet."}
                                        </p>
                                        {(dateFrom || dateTo) && (
                                            <Button
                                                variant="outline"
                                                onClick={clearDateFilter}
                                                className="mt-4"
                                            >
                                                Clear Date Filter
                                            </Button>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-between">
                <div className="flex-1 text-sm text-muted-foreground">
                    {table.getFilteredRowModel().rows.length} movement(s) total
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    );
}
