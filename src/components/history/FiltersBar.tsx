
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import { format, subMonths } from "date-fns";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

interface FiltersBarProps {
  uniqueClasses: string[];
  uniqueDocumentTypes: string[];
  filterClass: string | null;
  setFilterClass: (value: string | null) => void;
  filterPaymentStatus: string | null;
  setFilterPaymentStatus: (value: string | null) => void;
  filterDocumentType: string | null;
  setFilterDocumentType: (value: string | null) => void;
  dateRangeEnabled: boolean;
  setDateRangeEnabled: (value: boolean) => void;
  startDate: Date | undefined;
  setStartDate: (value: Date | undefined) => void;
  endDate: Date | undefined;
  setEndDate: (value: Date | undefined) => void;
  resetFilters: () => void;
}

export const FiltersBar: React.FC<FiltersBarProps> = ({
  uniqueClasses,
  uniqueDocumentTypes,
  filterClass,
  setFilterClass,
  filterPaymentStatus,
  setFilterPaymentStatus,
  filterDocumentType,
  setFilterDocumentType,
  dateRangeEnabled,
  setDateRangeEnabled,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  resetFilters,
}) => {
  const showClearButton = filterClass || filterPaymentStatus || filterDocumentType || dateRangeEnabled;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
      <span className="flex items-center gap-2">
        <Filter className="w-5 h-5" /> Filters
      </span>
      <div className="flex flex-wrap gap-2 ml-auto">
        <Select
          value={filterClass || ""}
          onValueChange={(value) => setFilterClass(value === "all" ? null : value)}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Class" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classes</SelectItem>
            {uniqueClasses.map((className) => (
              <SelectItem key={className} value={className}>
                {className}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select
          value={filterPaymentStatus || ""}
          onValueChange={(value) => setFilterPaymentStatus(value === "all" ? null : value)}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Payment Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="unpaid">Unpaid</SelectItem>
          </SelectContent>
        </Select>
        
        {uniqueDocumentTypes.length > 0 && (
          <Select
            value={filterDocumentType || ""}
            onValueChange={(value) => setFilterDocumentType(value === "all" ? null : value)}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Document Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Document Types</SelectItem>
              {uniqueDocumentTypes.map((docType) => (
                <SelectItem key={docType} value={docType}>
                  {docType}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium mr-2 whitespace-nowrap">
            <input 
              type="checkbox" 
              checked={dateRangeEnabled} 
              onChange={(e) => setDateRangeEnabled(e.target.checked)} 
              className="mr-2"
            />
            Date Range
          </label>
          
          {dateRangeEnabled && (
            <>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-[140px] justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "MMM d, yyyy") : "Start date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
              <span>to</span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-[140px] justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "MMM d, yyyy") : "End date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </>
          )}
        </div>
        
        {showClearButton && (
          <Button variant="ghost" size="sm" onClick={resetFilters}>
            Clear Filters
          </Button>
        )}
      </div>
    </div>
  );
};
