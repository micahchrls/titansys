import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, Filter, Plus, Search } from "lucide-react";

interface TableActionsProps {
  searchPlaceholder?: string;
  onSearch?: (value: string) => void;
  onFilter?: () => void;
  onDownload?: () => void;
  onAdd?: () => void;
  addButtonText?: string;
}

export function TableActions({
  searchPlaceholder = "Search...",
  onSearch,
  onFilter,
  onDownload,
  onAdd,
  addButtonText = "Add Product"
}: TableActionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative flex-1 md:min-w-[200px] md:flex-initial">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder={searchPlaceholder} 
          className="pl-8" 
          onChange={(e) => onSearch?.(e.target.value)}
        />
      </div>
      <Button variant="outline" size="sm" onClick={onFilter}>
        <Filter className="mr-2 h-4 w-4" />
        Filters
      </Button>
      <Button variant="outline" size="sm" onClick={onDownload}>
        <Download className="mr-2 h-4 w-4" />
        Download all
      </Button>
      <Button size="sm" onClick={onAdd}>
        <Plus className="mr-2 h-4 w-4" />
        {addButtonText}
      </Button>
    </div>
  );
}
