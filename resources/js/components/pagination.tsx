import { router } from '@inertiajs/react';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";

export interface PaginationData {
    current_page: number;
    last_page: number;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
}

interface PaginationProps {
    data: PaginationData;
    preserveScroll?: boolean;
    preserveState?: boolean;
    className?: string;
    onPageChange?: (page: number) => void;
}

export default function DataTablePagination({
    data,
    preserveScroll = true,
    preserveState = true,
    className = "mt-4 flex justify-center",
    onPageChange
}: PaginationProps) {
    const handlePageChange = (page: number) => {
        if (onPageChange) {
            onPageChange(page);
            return;
        }

        const params = new URLSearchParams(window.location.search);
        params.set('page', page.toString());
        
        router.get(
            window.location.pathname + '?' + params.toString(),
            {},
            { preserveState, preserveScroll }
        );
    };

    if (data.last_page <= 1) return null;

    return (
        <div className={className}>
            <Pagination>
                <PaginationContent>
                    {data.current_page > 1 && (
                        <PaginationItem>
                            <PaginationPrevious
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    handlePageChange(data.current_page - 1);
                                }}
                            />
                        </PaginationItem>
                    )}

                    {data.links.slice(1, -1).map((link, i) => (
                        <PaginationItem key={i}>
                            <PaginationLink
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    handlePageChange(Number(link.label));
                                }}
                                isActive={link.active}
                            >
                                {link.label}
                            </PaginationLink>
                        </PaginationItem>
                    ))}

                    {data.current_page < data.last_page && (
                        <PaginationItem>
                            <PaginationNext
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    handlePageChange(data.current_page + 1);
                                }}
                            />
                        </PaginationItem>
                    )}
                </PaginationContent>
            </Pagination>
        </div>
    );
}