"use client"

import { Cross2Icon } from "@radix-ui/react-icons"
import { Search, Filter, X, SlidersHorizontal, CircleCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface InventoryFiltersProps {
  searchValue?: string
  brandValue?: string
  categoryValue?: string
  statusValue?: string
  brands?: any[]
  categories?: any[]
  onSearchChange?: (value: string) => void
  onBrandChange?: (value: string) => void
  onCategoryChange?: (value: string) => void
  onStatusChange?: (value: string) => void
  onResetFilters?: () => void
}

export function InventoryFilters({
  searchValue = "",
  brandValue = "all",
  categoryValue = "all",
  statusValue = "all",
  brands = [],
  categories = [],
  onSearchChange,
  onBrandChange,
  onCategoryChange,
  onStatusChange,
  onResetFilters,
}: InventoryFiltersProps) {
  // Decode the search value if it's URL-encoded
  const decodedSearchValue = searchValue ? decodeURIComponent(searchValue) : "";
  const isFiltered = !!decodedSearchValue || brandValue !== "all" || categoryValue !== "all" || statusValue !== "all";
  
  // Count active filters (excluding search)
  const activeFiltersCount = 
    (brandValue !== "all" ? 1 : 0) + 
    (categoryValue !== "all" ? 1 : 0) + 
    (statusValue !== "all" ? 1 : 0);

  const handleSearchChange = (value: string) => {
    if (onSearchChange) {
      onSearchChange(value);
    }
  }

  const resetFilters = () => {
    if (onResetFilters) {
      onResetFilters();
    }
  }

  // Get display names for filter values
  const getBrandName = (id: string) => {
    if (id === "all") return "All Brands";
    const brand = brands?.find(b => b.id.toString() === id);
    return brand ? brand.name : id;
  };

  const getCategoryName = (id: string) => {
    if (id === "all") return "All Categories";
    const category = categories?.find(c => c.id.toString() === id);
    return category ? category.name : id;
  };

  const getStatusName = (status: string) => {
    if (status === "all") return "All Statuses";
    return status.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Status color mappings for badges
  const getStatusColor = (status: string) => {
    switch (status) {
      case "in-stock": return "bg-green-100 text-green-800 border-green-200";
      case "low-stock": return "bg-amber-100 text-amber-800 border-amber-200";
      case "out-of-stock": return "bg-red-100 text-red-800 border-red-200";
      default: return "";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
        {/* Search input with improved styling */}
        <div className="relative flex-1 min-w-[250px] w-full lg:w-auto">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by product name or SKU..."
            value={decodedSearchValue}
            onChange={(event) => handleSearchChange(event.target.value)}
            className="pl-9 pr-12 h-10 w-full"
          />
          {decodedSearchValue && (
            <Button
              variant="ghost"
              onClick={() => handleSearchChange("")}
              className="absolute right-0 top-0 h-full px-3"
            >
              <Cross2Icon className="h-4 w-4" />
              <span className="sr-only">Clear search</span>
            </Button>
          )}
        </div>

        {/* Individual select filters for larger screens */}
        <div className="hidden lg:flex items-center space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <Select
                    value={brandValue}
                    onValueChange={onBrandChange}
                  >
                    <SelectTrigger className="h-10 w-[180px]">
                      <SelectValue placeholder="Brand" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Filter by Brand</SelectLabel>
                        <SelectItem value="all">All Brands</SelectItem>
                        {brands?.map((brand) => (
                          <SelectItem key={brand.id} value={brand.id.toString()}>
                            {brand.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Filter by brand</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <Select 
                    value={categoryValue}
                    onValueChange={onCategoryChange}
                  >
                    <SelectTrigger className="h-10 w-[180px]">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Filter by Category</SelectLabel>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories?.map((category) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Filter by category</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <Select
                    value={statusValue}
                    onValueChange={onStatusChange}
                  >
                    <SelectTrigger className="h-10 w-[180px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Filter by Status</SelectLabel>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="in-stock" className="text-green-700">In Stock</SelectItem>
                        <SelectItem value="low-stock" className="text-amber-700">Low Stock</SelectItem>
                        <SelectItem value="out-of-stock" className="text-red-700">Out of Stock</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Filter by stock status</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {isFiltered && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={resetFilters}
                    className="h-10 w-10"
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Reset all filters</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Reset all filters</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        {/* Compact filter menu for mobile/smaller screens */}
        <div className="lg:hidden flex w-full gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex-1 justify-between">
                <span className="flex items-center">
                  <Filter className="mr-2 h-4 w-4" />
                  Filters
                </span>
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-2 rounded-full h-6 min-w-6 px-1 font-normal">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-4" align="start">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Brand</h4>
                  <Select
                    value={brandValue}
                    onValueChange={onBrandChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select brand" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Brands</SelectItem>
                      {brands?.map((brand) => (
                        <SelectItem key={brand.id} value={brand.id.toString()}>
                          {brand.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Category</h4>
                  <Select 
                    value={categoryValue}
                    onValueChange={onCategoryChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories?.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Stock Status</h4>
                  <Select
                    value={statusValue}
                    onValueChange={onStatusChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="in-stock" className="text-green-700">In Stock</SelectItem>
                      <SelectItem value="low-stock" className="text-amber-700">Low Stock</SelectItem>
                      <SelectItem value="out-of-stock" className="text-red-700">Out of Stock</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Separator className="my-4" />
              <Button variant="outline" onClick={resetFilters} className="w-full">
                <X className="mr-2 h-4 w-4" />
                Reset Filters
              </Button>
            </PopoverContent>
          </Popover>

          {isFiltered && (
            <Button
              variant="ghost"
              onClick={resetFilters}
              className="h-10"
            >
              <X className="h-4 w-4 mr-1" />
              Reset
            </Button>
          )}
        </div>
      </div>
      
      {/* Enhanced active filters display with improved styling */}
      {isFiltered && activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {brandValue !== "all" && (
            <Badge 
              variant="outline" 
              className="h-8 rounded-md px-3 py-1 bg-primary-50 border-primary-200 text-primary-800 hover:bg-primary-100 transition-colors"
            >
              <span className="mr-1 text-muted-foreground text-xs">Brand:</span>
              <span className="font-medium">{getBrandName(brandValue)}</span>
              <Button
                variant="ghost"
                onClick={() => onBrandChange && onBrandChange("all")}
                className="h-4 w-4 p-0 ml-2 hover:bg-transparent"
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove brand filter</span>
              </Button>
            </Badge>
          )}
          {categoryValue !== "all" && (
            <Badge 
              variant="outline" 
              className="h-8 rounded-md px-3 py-1 bg-primary-50 border-primary-200 text-primary-800 hover:bg-primary-100 transition-colors"
            >
              <span className="mr-1 text-muted-foreground text-xs">Category:</span>
              <span className="font-medium">{getCategoryName(categoryValue)}</span>
              <Button
                variant="ghost"
                onClick={() => onCategoryChange && onCategoryChange("all")}
                className="h-4 w-4 p-0 ml-2 hover:bg-transparent"
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove category filter</span>
              </Button>
            </Badge>
          )}
          {statusValue !== "all" && (
            <Badge 
              variant="outline" 
              className={cn(
                "h-8 rounded-md px-3 py-1 border hover:opacity-90 transition-opacity",
                getStatusColor(statusValue)
              )}
            >
              <span className="mr-1 text-muted-foreground text-xs">Status:</span>
              <span className="font-medium">{getStatusName(statusValue)}</span>
              <Button
                variant="ghost"
                onClick={() => onStatusChange && onStatusChange("all")}
                className="h-4 w-4 p-0 ml-2 hover:bg-transparent"
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove status filter</span>
              </Button>
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}
