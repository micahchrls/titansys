import { ReactNode } from "react";
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from "@/components/ui/table";

type Column<T> = {
    key: keyof T;
    header: string;
    render?: (value: T[keyof T], row: T) => ReactNode;
};

type DataTableProps<T extends { id: number | string }> = {
    data: T[];
    columns: Column<T>[];
    className?: string;
};

function TableHeaderComponent<T>({ columns }: { columns: Column<T>[] }) {
    return (
        <TableHeader>
            <TableRow>
                {columns.map((column) => (
                    <TableHead key={String(column.key)}>{column.header}</TableHead>
                ))}
            </TableRow>
        </TableHeader>
    );
}

function TableRowComponent<T>({ row, columns }: { row: T; columns: Column<T>[] }) {
    return (
        <TableRow>
            {columns.map((column) => (
                <TableCell key={`${row.id}-${String(column.key)}`}>
                    {column.render ? column.render(row[column.key], row) : (row[column.key] as ReactNode)}
                </TableCell>
            ))}
        </TableRow>
    );
}

export default function DataTable<T extends { id: number | string }>({ data, columns, className }: DataTableProps<T>) {
    return (
        <div className="overflow-x-auto">
            <Table className={className}>
                <TableHeaderComponent columns={columns} />
                <TableBody>
                    {data.map((row) => (
                        <TableRowComponent key={row.id} row={row} columns={columns} />
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
