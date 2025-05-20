import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronRight, ChevronLeft, Search } from "lucide-react";
import { useMemo, useState } from "react";

interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchField?: keyof T;
  emptyMessage?: string;
  className?: string;
  itemsPerPage?: number;
}

export function DataTable<T>({
  data,
  columns,
  searchField,
  emptyMessage = "لا توجد بيانات متاحة",
  className = "",
  itemsPerPage = 10
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Filter data based on search query
  const filteredData = useMemo(() => {
    if (!searchQuery.trim() || !searchField) return data;
    
    return data.filter((item) => {
      const fieldValue = item[searchField];
      if (typeof fieldValue === 'string') {
        return fieldValue.toLowerCase().includes(searchQuery.toLowerCase());
      }
      return false;
    });
  }, [data, searchQuery, searchField]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  const goToPage = (page: number) => {
    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;
    setCurrentPage(page);
  };

  // Get cell content
  const getCellContent = (item: T, accessor: Column<T>['accessor']) => {
    if (typeof accessor === 'function') {
      return accessor(item);
    }
    return item[accessor] as React.ReactNode;
  };

  return (
    <div className={className}>
      {searchField && (
        <div className="mb-4 relative">
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <Input
            type="text"
            placeholder="بحث..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="pr-10"
          />
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column, idx) => (
                <TableHead key={idx} className={column.className}>
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length > 0 ? (
              paginatedData.map((item, rowIdx) => (
                <TableRow key={rowIdx}>
                  {columns.map((column, colIdx) => (
                    <TableCell key={`${rowIdx}-${colIdx}`} className={column.className}>
                      {getCellContent(item, column.accessor)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-700">
            عرض <span className="font-semibold">{(currentPage - 1) * itemsPerPage + 1}</span> إلى{" "}
            <span className="font-semibold">
              {Math.min(currentPage * itemsPerPage, filteredData.length)}
            </span>{" "}
            من <span className="font-semibold">{filteredData.length}</span>
          </div>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">السابق</span>
            </Button>
            
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => goToPage(pageNum)}
                >
                  {pageNum}
                </Button>
              );
            })}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">التالي</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
