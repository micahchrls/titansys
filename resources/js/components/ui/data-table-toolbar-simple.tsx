"use client"

import { Cross2Icon } from "@radix-ui/react-icons"
import { Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface DataTableToolbarProps {
  searchValue?: string
  onSearchChange?: (value: string) => void
  placeholder?: string
}

export function DataTableToolbar({
  searchValue = "",
  onSearchChange,
  placeholder = "Search...",
}: DataTableToolbarProps) {
  // Decode the search value if it's URL-encoded
  const decodedSearchValue = searchValue ? decodeURIComponent(searchValue) : "";
  const isFiltered = !!decodedSearchValue;

  const handleSearchChange = (value: string) => {
    if (onSearchChange) {
      onSearchChange(value);
    }
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <div className="relative flex-1 min-w-[200px] my-2">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={placeholder}
            value={decodedSearchValue}
            onChange={(event) => handleSearchChange(event.target.value)}
            className="pl-8"
          />
          {isFiltered && (
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
      </div>
    </div>
  )
}
