import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";

interface SearchFilterProps {
  onSearch: (value: string) => void;
  onFilter: () => void;
  searchPlaceholder?: string;
  filterButtonText?: string;
}

export function SearchFilter({
  onSearch,
  onFilter,
  searchPlaceholder = "Search...",
  filterButtonText = "Filters"
}: SearchFilterProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 my-2">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={searchPlaceholder}
          className="pl-8"
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>
      <Button variant="outline" size="sm" onClick={onFilter}>
        <Filter className="mr-2 h-4 w-4" />
        {filterButtonText}
      </Button>
    </div>
  );
}
