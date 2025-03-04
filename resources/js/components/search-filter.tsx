import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { ChangeEvent } from "react";
import { cn } from "@/lib/utils";

interface SearchFilterProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
}

export function SearchFilter({
    value,
    onChange,
    placeholder = "Search...",
    className,
    disabled = false,
}: SearchFilterProps) {
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value);
    };

    return (
        <div className={cn("relative flex-1 min-w-[200px] my-2", className)}>
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
                placeholder={placeholder}
                className="pl-8"
                value={value}
                onChange={handleChange}
                disabled={disabled}
            />
        </div>
    );
}
