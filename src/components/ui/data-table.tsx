import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ArrowUp, ArrowDown, X } from "lucide-react";

interface DataTableProps<T> {
  data: T[];
  columns: {
    header: string;
    accessorKey: keyof T;
    cell?: (item: T) => React.ReactNode;
    searchable?: boolean;
    sortable?: boolean;
  }[];
  onRowClick?: (item: T) => void;
}

export function DataTable<T extends { id?: string | number }>({
  data,
  columns,
  onRowClick,
}: DataTableProps<T>) {
  const [sortColumn, setSortColumn] = useState<keyof T | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterColumn, setFilterColumn] = useState<keyof T | null>(null);

  // Filter data based on search query
  const filteredData = React.useMemo(() => {
    if (!searchQuery) return data;

    return data.filter((item) => {
      if (filterColumn) {
        const value = item[filterColumn];
        return String(value).toLowerCase().includes(searchQuery.toLowerCase());
      }

      // Search across all searchable columns
      return columns.some((column) => {
        if (!column.searchable) return false;
        const value = item[column.accessorKey];
        return String(value).toLowerCase().includes(searchQuery.toLowerCase());
      });
    });
  }, [data, searchQuery, filterColumn, columns]);

  // Sort data
  const sortedData = React.useMemo(() => {
    if (!sortColumn) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];

      if (aValue === bValue) return 0;

      // Handle string comparison
      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      // Handle number comparison
      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      }

      // Handle date comparison
      if (aValue instanceof Date && bValue instanceof Date) {
        return sortDirection === "asc"
          ? aValue.getTime() - bValue.getTime()
          : bValue.getTime() - aValue.getTime();
      }

      // Handle mixed types as strings
      return sortDirection === "asc"
        ? String(aValue).localeCompare(String(bValue))
        : String(bValue).localeCompare(String(aValue));
    });
  }, [filteredData, sortColumn, sortDirection]);

  // Handle sorting
  const handleSort = (column: keyof T) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  // Get searchable columns
  const searchableColumns = columns.filter((column) => column.searchable);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 w-full"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full"
              onClick={() => setSearchQuery("")}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        {searchableColumns.length > 1 && (
          <select
            className="p-2 border rounded w-full sm:w-auto"
            value={filterColumn ? String(filterColumn) : "all"}
            onChange={(e) => {
              if (e.target.value === "all") {
                setFilterColumn(null);
              } else {
                setFilterColumn(e.target.value as keyof T);
              }
            }}
          >
            <option value="all">All Columns</option>
            {searchableColumns.map((column) => (
              <option
                key={String(column.accessorKey)}
                value={String(column.accessorKey)}
              >
                {column.header}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="border rounded-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead
                  key={String(column.accessorKey)}
                  className={column.sortable ? "cursor-pointer select-none" : ""}
                  onClick={() => {
                    if (column.sortable) {
                      handleSort(column.accessorKey);
                    }
                  }}
                >
                  <div className="flex items-center gap-1">
                    {column.header}
                    {column.sortable && sortColumn === column.accessorKey && (
                      <span>
                        {sortDirection === "asc" ? (
                          <ArrowUp className="h-3 w-3" />
                        ) : (
                          <ArrowDown className="h-3 w-3" />
                        )}
                      </span>
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center h-24 text-muted-foreground"
                >
                  No results found
                </TableCell>
              </TableRow>
            ) : (
              sortedData.map((row) => (
                <TableRow
                  key={String(row.id)}
                  className={onRowClick ? "cursor-pointer" : ""}
                  onClick={() => onRowClick && onRowClick(row)}
                >
                  {columns.map((column) => (
                    <TableCell key={String(column.accessorKey)}>
                      {column.cell
                        ? column.cell(row)
                        : String(row[column.accessorKey] || "")}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="text-sm text-gray-500">
        Showing {sortedData.length} of {data.length} entries
      </div>
    </div>
  );
}
